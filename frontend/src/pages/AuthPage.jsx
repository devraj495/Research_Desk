import { useMemo, useState } from 'react';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';

function AuthPage({ apiBaseUrl, onNavigate, onAuth, user, onLogout }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === 'signin' ? 'Sign in' : 'Create account'), [mode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/signup';
      const payload = mode === 'signin'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      localStorage.setItem('researchDeskToken', data.token || '');
      localStorage.setItem('researchDeskUser', JSON.stringify(data.user || {}));
      setMessage(mode === 'signin' ? 'Signed in successfully.' : 'Account created successfully.');
      onAuth?.(data.user || {});
    } catch (err) {
      setMessage(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Navbar currentPath="/auth" onNavigate={onNavigate} user={user} onLogout={onLogout} />

        <section className="grid gap-6 rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.75)] lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div className="flex flex-col justify-center">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Secure access
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Sign in or create an account to save your research flow.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
              Authentication is connected to your MongoDB database, so each account is stored and can be used for future sessions.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1">
              <button type="button" onClick={() => setMode('signin')} className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition ${mode === 'signin' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
                Sign in
              </button>
              <button type="button" onClick={() => setMode('signup')} className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition ${mode === 'signup' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
                Sign up
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                  required
                />
              )}

              <input
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                required
              />

              <input
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                type="password"
                placeholder="Password"
                minLength="8"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                required
              />

              {mode === 'signup' && <p className="text-xs text-slate-500">Use at least 8 characters.</p>}

              <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Please wait…' : title}
              </button>
            </form>

            {message && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                {message}
              </div>
            )}
          </div>
        </section>
        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default AuthPage;
