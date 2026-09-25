import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Research', path: '/research' },
  { label: 'Comparison', path: '/compare' },
  { label: 'Contact', path: '/contact' },
];

function getInitial(user) {
  const source = user?.name || user?.email || 'U';
  return source.trim().charAt(0).toUpperCase() || 'U';
}

function Navbar({ currentPath, onNavigate, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const items = user ? NAV_ITEMS : [...NAV_ITEMS, { label: 'Login', path: '/auth' }];

  function navigate(path) {
    setMenuOpen(false);
    onNavigate(path);
  }

  function navItemClass(active) {
    return `rounded-xl px-3 py-2 text-sm font-medium transition ${
      active
        ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`;
  }

  return (
    <nav className="sticky top-3 z-30 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-3 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-black/30 sm:top-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="min-w-0 rounded-xl px-2 py-2 text-left text-sm font-bold text-slate-950 transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 sm:px-3"
        >
          AI Research Desk
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {items.map((item) => (
            <button key={item.path} type="button" onClick={() => navigate(item.path)} className={navItemClass(currentPath === item.path)}>
              {item.label}
            </button>
          ))}
          {user && <UserActions user={user} onProfile={() => navigate('/profile')} onLogout={onLogout} />}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
            {menuOpen ? <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-navigation" className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800 md:hidden">
          <div className="grid gap-1">
            {items.map((item) => (
              <button key={item.path} type="button" onClick={() => navigate(item.path)} className={`${navItemClass(currentPath === item.path)} w-full text-left`}>
                {item.label}
              </button>
            ))}
          </div>
          {user && (
            <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
              <UserActions user={user} onProfile={() => navigate('/profile')} onLogout={onLogout} mobile />
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function UserActions({ user, onProfile, onLogout, mobile = false }) {
  return (
    <>
      <button
        type="button"
        onClick={onProfile}
        aria-label="Open profile"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-200 bg-emerald-100 text-sm font-black text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-200"
        title={user.name || user.email}
      >
        {getInitial(user)}
      </button>
      <button
        type="button"
        onClick={onLogout}
        className={`rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${mobile ? 'flex-1 text-left' : ''}`}
      >
        Logout
      </button>
    </>
  );
}

export default Navbar;
