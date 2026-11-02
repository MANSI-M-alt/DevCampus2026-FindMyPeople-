import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import './index.css';

const root = createRoot(document.getElementById('root')!);

if (!isSupabaseConfigured || !supabase) {
  root.render(
    <main className="min-h-screen bg-[#FAF5F8] px-4 py-12 flex items-center justify-center">
      <section className="max-w-xl rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-[#1E2A38]">Supabase configuration is missing</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This Netlify deploy needs <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
          Add both under Site configuration → Environment variables, then trigger a new deploy.
        </p>
      </section>
    </main>
  );
} else {
  root.render(<App supabase={supabase} />);
}
