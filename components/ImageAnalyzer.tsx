import { GoogleGenAI } from "@google/genai";
import React, { useState, useMemo } from 'react';
import { getSystemInstruction } from '../constants';
import { useLocale } from '../contexts/LocaleContext';

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { locale } = useLocale();
  // FIX: Use environment variable for API key.
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResponse('');
    }
  };

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleSubmit = async () => {
    if (!image || !prompt.trim() || isLoading) return;
    setIsLoading(true);
    setResponse('');

    try {
      const imagePart = await fileToGenerativePart(image);
      const textPart = { text: `My question is: "${prompt}". Please analyze the attached image in the context of a Nigerian user and provide financial guidance based on your identity as CashDey Coach.` };
      
      const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, textPart] },
          config: {
            systemInstruction: getSystemInstruction(locale),
          }
      });

      setResponse(result.text);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setResponse("Sorry, I couldn't analyze the image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-2 space-y-4">
      <div className="flex-shrink-0 p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-white/10">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
          Upload an image (e.g., a bill, receipt, or product)
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition-colors"
          disabled={isLoading}
        />
        {preview && <img src={preview} alt="Preview" className="mt-4 rounded-lg max-h-40 w-auto animate-fade-in" />}
      </div>

      {preview && (
        <div className="flex-shrink-0 animate-fade-in-up">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question about the image... e.g., 'How can I save money on this?'"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim() || !image}
            className="mt-2 w-full bg-emerald-600 text-white rounded-lg py-2 disabled:bg-gray-500 hover:bg-emerald-700 transition-colors active:scale-95 transform"
          >
            {isLoading ? 'Analyzing...' : 'Ask Coach'}
          </button>
        </div>
      )}

      <div className="flex-grow overflow-y-auto bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-white/10">
        {isLoading && (
            <div className="flex justify-center items-center h-full">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-400"></div>
            </div>
        )}
        {!isLoading && !response && !preview && (
             <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
                <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <h2 className="text-lg font-semibold">Visual Analyzer</h2>
                <p className="text-sm">Upload an image and ask for financial insights.</p>
            </div>
        )}
        {response && (
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap animate-fade-in">{response}</div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalyzer;