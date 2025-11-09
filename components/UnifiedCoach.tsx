// FIX: Removed `LiveSession` as it's not an exported member of '@google/genai'.
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from "@google/genai";
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { getSystemInstruction } from '../constants';
import { decode, encode, decodeAudioData } from '../utils/audio';
import type { ChatMessage, Content } from '../types';
import { useLocale } from '../contexts/LocaleContext';
import { useData } from '../contexts/DataContext';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
type CoachMode = 'text' | 'live';

interface Transcription {
    user: string;
    model: string;
    isFinal: boolean;
}

const UnifiedCoach: React.FC = () => {
    const [mode, setMode] = useState<CoachMode>('text');
    const { locale, t } = useLocale();
    const { user, wallet, transactions, portfolio, savingsGoals } = useData();

    // --- Text Chat State ---
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: "Hi! To give you the best advice, I'm looking at your latest financial activity. Your data is private and I don't store personal details." }
    ]);
    const [input, setInput] = useState('');
    const [isTextLoading, setIsTextLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('VITE_GEMINI_API_KEY is not set. Please configure it in your environment.');
    }

    const aiText = useMemo(() => new GoogleGenAI({ apiKey: geminiApiKey }), [geminiApiKey]);


    // --- Live Coach State ---
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    // FIX: Infer session type from aiLive.live.connect and move aiLive definition before sessionRef.
    const aiLive = useMemo(() => new GoogleGenAI({ apiKey: geminiApiKey }), [geminiApiKey]);
    const sessionRef = useRef<Awaited<ReturnType<typeof aiLive.live.connect>> | null>(null);
    const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mainAnalyserRef = useRef<AnalyserNode | null>(null); // Main analyser for visualizer
    const inputAnalyserRef = useRef<AnalyserNode | null>(null); // Analyser for user input
    const outputAnalyserRef = useRef<AnalyserNode | null>(null); // Analyser for AI output
    const animationFrameId = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const outputSources = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTime = useRef<number>(0);
    const currentInputTranscription = useRef('');
    const currentOutputTranscription = useRef('');
    const isSpeakingRef = useRef(false);

    const getFinancialContextString = () => {
        if (!user || !wallet || !transactions || !portfolio || !savingsGoals) {
            return '';
        }
        // Sanitize transactions to only include relevant fields for the prompt
        const sanitizedTransactions = transactions.map(({ id, notes, ...rest }) => rest);

        const financialContext = {
            user: {
                name: user.name,
                levelName: user.levelName,
                levelTier: user.levelTier,
            },
            wallet: {
                spendable: wallet.spendable,
                lockedInGoals: wallet.lockedInGoals,
                totalBalance: wallet.totalBalance,
            },
            portfolio: {
                totalValue: portfolio.totalValue,
                totalChange: portfolio.totalChange,
            },
            savingsGoals: savingsGoals.map(({ id, ...rest }) => rest), // Remove id
            recentTransactions: sanitizedTransactions.slice(0, 10) // Limit to last 10
        };

        return `
---
USER'S CURRENT FINANCIAL SNAPSHOT (FOR YOUR CONTEXT ONLY):
This is real-time data from the user's CashDey app. Use it to provide personalized, accurate, and relevant financial advice. Do NOT repeat this data back to the user unless they explicitly ask for a summary.
${JSON.stringify(financialContext, null, 2)}
---
`;
    };

    // --- Effects ---
    useEffect(() => {
        const initialPrompt = sessionStorage.getItem('coach_prompt');
        if (initialPrompt) {
            setMode('text');
            setInput(initialPrompt);
            sessionStorage.removeItem('coach_prompt');
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (mode === 'text') {
            scrollToBottom();
        }
    }, [messages, mode]);

    const handleSend = async () => {
        if (!input.trim() || isTextLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsTextLoading(true);

        const financialContextString = getFinancialContextString();
        const fullSystemInstruction = getSystemInstruction(locale) + financialContextString;

        try {
            // Exclude the initial welcome message from the history sent to the API
            const contents = updatedMessages.slice(1).map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            })) as Content[];

            const responseStream = await aiText.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: contents,
                config: {
                    systemInstruction: fullSystemInstruction
                }
            });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of responseStream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', content: modelResponse };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'model', content: 'Sorry, something went wrong. Please try again.' }]);
        } finally {
            setIsTextLoading(false);
        }
    };

    // --- Live Coach Logic ---
    
    const drawVisualizer = () => {
        if (!mainAnalyserRef.current || !canvasRef.current) return;
    
        animationFrameId.current = requestAnimationFrame(drawVisualizer);
    
        const bufferLength = mainAnalyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        mainAnalyserRef.current.getByteFrequencyData(dataArray);
    
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);
    
        const barWidth = (width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
    
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
    
            const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
            gradient.addColorStop(0, '#10b981'); // emerald-500
            gradient.addColorStop(1, '#34d399'); // emerald-400
    
            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    
            x += barWidth + 1;
        }
    };


    const cleanupLiveSession = () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        
        sourceNodeRef.current?.disconnect();
        sourceNodeRef.current = null;
        
        inputAnalyserRef.current?.disconnect();
        inputAnalyserRef.current = null;
        
        outputAnalyserRef.current?.disconnect();
        outputAnalyserRef.current = null;
        
        mainAnalyserRef.current = null;

        if (audioContextRef.current) {
            audioContextRef.current.input?.close();
            audioContextRef.current.output?.close();
            audioContextRef.current = null;
        }
        outputSources.current.forEach(source => source.stop());
        outputSources.current.clear();
        nextStartTime.current = 0;
        setConnectionState('disconnected');
        setIsSpeaking(false);
        isSpeakingRef.current = false;
    };

    useEffect(() => {
        return () => cleanupLiveSession();
    }, []);

    const startSession = async () => {
        setConnectionState('connecting');
        setTranscriptions([]);
        
        const financialContextString = getFinancialContextString();
        const fullSystemInstruction = getSystemInstruction(locale) + financialContextString;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = { input: inputAudioContext, output: outputAudioContext };
            
            // Create analysers once
            const localInputAnalyser = inputAudioContext.createAnalyser();
            localInputAnalyser.fftSize = 256;
            inputAnalyserRef.current = localInputAnalyser;

            const localOutputAnalyser = outputAudioContext.createAnalyser();
            localOutputAnalyser.fftSize = 256;
            outputAnalyserRef.current = localOutputAnalyser;

            // Start with visualizer on user input
            mainAnalyserRef.current = inputAnalyserRef.current;


            const sessionPromise = aiLive.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setConnectionState('connected');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        sourceNodeRef.current = source;
                        
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

                            // User speaking detection
                            let sumSquares = 0.0;
                            for (const amplitude of inputData) {
                                sumSquares += amplitude * amplitude;
                            }
                            const rms = Math.sqrt(sumSquares / inputData.length);
                            const speaking = rms > 0.025; // Adjusted threshold
                            if (speaking !== isSpeakingRef.current) {
                                isSpeakingRef.current = speaking;
                                setIsSpeaking(speaking);
                            }

                            // Send audio data to GenAI
                            // FIX: Optimized audio data conversion for performance.
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        source.connect(inputAnalyserRef.current!);
                        inputAnalyserRef.current!.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);

                        drawVisualizer();
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            
                            // Switch visualizer to output
                            mainAnalyserRef.current = outputAnalyserRef.current;
                            source.connect(outputAnalyserRef.current!);
                            outputAnalyserRef.current!.connect(outputAudioContext.destination);
                            
                            source.addEventListener('ended', () => {
                                outputSources.current.delete(source);
                                // Switch back only if no other model audio is playing
                                if (outputSources.current.size === 0) {
                                    mainAnalyserRef.current = inputAnalyserRef.current;
                                }
                            });
                            
                            source.start(nextStartTime.current);
                            nextStartTime.current += audioBuffer.duration;
                            outputSources.current.add(source);
                        }
                        
                        if (message.serverContent?.interrupted) {
                            outputSources.current.forEach(source => source.stop());
                            outputSources.current.clear();
                            nextStartTime.current = 0;
                            // Immediately switch visualizer back to input
                             mainAnalyserRef.current = inputAnalyserRef.current;
                        }

                        if(message.serverContent?.inputTranscription) {
                            currentInputTranscription.current += message.serverContent.inputTranscription.text;
                            setTranscriptions(prev => {
                                const last = prev[prev.length - 1];
                                if(last && !last.isFinal) return [...prev.slice(0, -1), {...last, user: currentInputTranscription.current}];
                                return [...prev, {user: currentInputTranscription.current, model: '', isFinal: false}];
                            });
                        }
                        if(message.serverContent?.outputTranscription) {
                            currentOutputTranscription.current += message.serverContent.outputTranscription.text;
                             setTranscriptions(prev => {
                                const last = prev[prev.length - 1];
                                if(last && !last.isFinal) return [...prev.slice(0, -1), {...last, model: currentOutputTranscription.current}];
                                return [...prev];
                            });
                        }
                        if(message.serverContent?.turnComplete) {
                            setTranscriptions(prev => {
                                const last = prev[prev.length - 1];
                                if(last && !last.isFinal) return [...prev.slice(0, -1), {...last, isFinal: true}];
                                return prev;
                            });
                            currentInputTranscription.current = '';
                            currentOutputTranscription.current = '';
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setConnectionState('error');
                        cleanupLiveSession();
                    },
                    onclose: () => cleanupLiveSession(),
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: fullSystemInstruction,
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
            });
            sessionRef.current = await sessionPromise;
        } catch (error) {
            console.error('Failed to start session:', error);
            setConnectionState('error');
            cleanupLiveSession();
        }
    };
    
    const handleMicClick = () => {
        if (connectionState === 'connected') {
            cleanupLiveSession();
        } else if (connectionState === 'disconnected' || connectionState === 'error') {
            startSession();
        }
    };

    const ModeSwitcher = () => (
        <div className="flex justify-center p-2 bg-transparent">
            <div className="flex items-center bg-gray-800/80 rounded-full p-1 border border-white/10">
                <button onClick={() => setMode('text')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${mode === 'text' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{t('coachScreen.textMode')}</button>
                <button onClick={() => setMode('live')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${mode === 'live' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{t('coachScreen.voiceMode')}</button>
            </div>
        </div>
    );
    
    const MicButton = () => {
        const isDisabled = connectionState === 'connecting';
        
        let iconColor = 'text-gray-300';
        let ringColor = 'ring-gray-600';
        let pulse = false;
        let pulseColorClass = 'bg-amber-500/50';

        switch (connectionState) {
            case 'connecting':
                iconColor = 'text-amber-400';
                ringColor = 'ring-amber-500';
                pulse = true;
                break;
            case 'connected':
                iconColor = 'text-emerald-400';
                ringColor = 'ring-emerald-500';
                if (isSpeaking) {
                    pulse = true;
                    pulseColorClass = 'bg-emerald-500/50';
                }
                break;
            case 'error':
                iconColor = 'text-rose-500';
                ringColor = 'ring-rose-600';
                break;
        }

        return (
            <button
                onClick={handleMicClick}
                disabled={isDisabled}
                className={`relative group rounded-full p-5 transition-all duration-300 ease-in-out bg-gray-800/50 ring-2 ${ringColor} focus:outline-none focus:ring-4 focus:ring-emerald-400/50 hover:bg-gray-700/70 disabled:cursor-not-allowed`}
                aria-label={connectionState === 'connected' ? 'End Session' : 'Start Session'}
            >
                {pulse && <div className={`absolute inset-0 rounded-full ${pulseColorClass} animate-ping`}></div>}
                <svg className={`w-8 h-8 transition-colors ${iconColor}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            <ModeSwitcher />
            <div className="flex-grow relative overflow-hidden">
                {/* Text Chat UI */}
                <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${mode === 'text' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                     <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {messages.length <= 1 && (
                        <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
                            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <h2 className="text-lg font-semibold">{t('coachScreen.startConversationTitle')}</h2>
                            <p className="text-sm">{t('coachScreen.startConversationSubtitle')}</p>
                        </div>
                        )}
                        {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-lg p-3 rounded-2xl shadow-md whitespace-pre-wrap ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>{msg.content}</div>
                        </div>
                        ))}
                        {isTextLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex justify-start"><div className="p-3 rounded-2xl bg-gray-700 rounded-bl-none"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div><div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div><div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div></div></div></div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 bg-gray-900/50 border-t border-white/10">
                        <div className="flex items-center space-x-2">
                            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={t('coachScreen.placeholder')} className="flex-grow bg-gray-700 border border-gray-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-shadow" disabled={isTextLoading} />
                            <button onClick={handleSend} disabled={isTextLoading || !input.trim()} className="bg-emerald-600 text-white rounded-full p-2 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-emerald-700 transition-all transform active:scale-95" aria-label="Send message">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Coach UI */}
                <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${mode === 'live' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="flex flex-col h-full items-center justify-between p-4">
                        <div className="w-full max-w-2xl flex-grow overflow-y-auto bg-gray-800/50 rounded-lg p-4 mb-4 backdrop-blur-sm border border-white/10">
                            {transcriptions.length === 0 && connectionState !== 'connected' && (
                                <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
                                    <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    <h2 className="text-lg font-semibold">{t('coachScreen.liveCoachTitle')}</h2>
                                    <p className="text-sm">{t('coachScreen.liveCoachSubtitle')}</p>
                                    <p className="text-xs text-gray-500 mt-2 max-w-xs">To give you the best advice, I'll access your latest financial activity in real-time. Your data remains private.</p>
                                </div>
                            )}
                            {transcriptions.map((t, i) => (
                                <div key={i} className="mb-4 animate-fade-in-up">
                                    <p className="text-emerald-400 font-semibold">You:</p>
                                    <p className={`text-gray-200 transition-opacity duration-300 ${!t.isFinal ? 'opacity-60' : ''}`}>{t.user || '...'}</p>
                                    {t.model && (<>
                                        <p className="text-blue-400 font-semibold mt-2">Coach:</p>
                                        <p className={`text-gray-200 transition-opacity duration-300 ${!t.isFinal ? 'opacity-60' : ''}`}>{t.model || '...'}</p>
                                    </>)}
                                </div>
                            ))}
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-center space-y-4">
                           <canvas ref={canvasRef} className={`w-64 h-20 transition-opacity duration-300 ${connectionState === 'connected' ? 'opacity-100' : 'opacity-0'}`} />
                           <MicButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedCoach;