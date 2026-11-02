import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthView: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() } },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setMessage('Check your email to confirm your account, then sign in.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF5F8] px-4 py-12 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
        <div>
          <div className="text-sm font-bold uppercase tracking-wider text-[#1E2A38]">FindMyPeople</div>
          <h1 className="mt-2 text-2xl font-bold text-[#1E2A38]">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to discover collaborators and manage your projects.</p>
        </div>

        {isSignUp && (
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              required
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        )}

        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            required
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {isSignUp && <span className="mt-1 block text-xs text-slate-500">Use at least 6 characters.</span>}
        </label>

        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#1E2A38] px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSignUp((current) => !current);
            setError(null);
            setMessage(null);
          }}
          className="w-full text-sm font-medium text-[#1E2A38] underline underline-offset-2"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </form>
    </main>
  );
};
