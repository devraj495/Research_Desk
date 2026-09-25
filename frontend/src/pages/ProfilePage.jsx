import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';

function getInitial(user) {
  const source = user?.name || user?.email || 'U';
  return source.trim().charAt(0).toUpperCase() || 'U';
}

function ProfilePage({ onNavigate, user, onLogout, theme = 'light', onToggleTheme }) {
  const darkMode = theme === 'dark';

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] px-4 py-4 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <Navbar currentPath="/profile" onNavigate={onNavigate} user={user} onLogout={onLogout} />

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-[0_30px_90px_-55px_rgba(15,23,42,0.75)] dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-3xl font-black text-emerald-900">
              ?
            </div>
            <h1 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
              Please login to view your profile.
            </h1>
            <button
              type="button"
              onClick={() => onNavigate('/auth')}
              className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Login
            </button>
          </section>
          <Footer onNavigate={onNavigate} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-4 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Navbar currentPath="/profile" onNavigate={onNavigate} user={user} onLogout={onLogout} />

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.75)] dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-emerald-50 bg-emerald-100 text-4xl font-black text-emerald-900 shadow-sm">
            {getInitial(user)}
          </div>

          <div className="mt-6 text-center">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Your profile
            </div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">
              {user.name || 'Research Desk User'}
            </h1>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{user.email}</p>
          </div>

          <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Name</p>
              <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{user.name || 'Not provided'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Email</p>
              <p className="mt-2 break-words text-lg font-black text-slate-950 dark:text-white">{user.email}</p>
            </div>
          </div>

          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <div>
              <p className="text-sm font-black text-slate-950 dark:text-white">Appearance</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Switch between light and dark mode.
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-pressed={darkMode}
              className={`flex h-9 w-16 items-center rounded-full p-1 transition ${
                darkMode ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full bg-white text-xs font-black text-slate-950 shadow-sm transition ${
                  darkMode ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {darkMode ? 'D' : 'L'}
              </span>
            </button>
          </div>
        </section>
        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default ProfilePage;
