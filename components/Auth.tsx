import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLocale } from '../contexts/LocaleContext';
import { useToast } from '../contexts/ToastContext';

// FIX: Changed to a named export to match the import in App.tsx.
export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocale();
  const { addToast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        
        // Profile creation is now handled automatically by the database trigger.
        // No client-side action is needed.
        
        addToast('Success! Please check your email for a confirmation link to activate your account.', 'success');
        
        // Reset form and switch to login view for better UX
        setEmail('');
        setPassword('');
        setIsLogin(true);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
            <img src="/logo-a.png" alt="CashDey Logo" className="w-40 h-auto mb-4"/>
            <h1 className="text-3xl font-bold text-white mb-1">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-gray-400">{isLogin ? 'Sign in to your CashDey account' : 'Start your financial journey'}</p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white rounded-lg py-3 font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-500"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
          {error && <p className="text-rose-400 text-sm text-center">{error}</p>}
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-semibold text-emerald-400 hover:underline ml-1">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};