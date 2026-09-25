const FOOTER_LINKS = [
  { label: 'Research', path: '/research' },
  { label: 'Compare', path: '/compare' },
  { label: 'Contact', path: '/contact' },
];

function Footer({ onNavigate }) {
  function handleNavigate(path) {
    if (onNavigate) {
      onNavigate(path);
      return;
    }

    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  return (
    <footer className="mt-auto border-t border-slate-200 py-8 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => handleNavigate('/')}
            className="text-left text-base font-black text-slate-950 transition hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300"
          >
            AI Research Desk
          </button>
          <p className="mt-2 max-w-md leading-6">
            AI-powered investment research for faster company analysis, risk review, and decision support.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {FOOTER_LINKS.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNavigate(item.path)}
              className="font-semibold transition hover:text-slate-950 dark:hover:text-white"
            >
              {item.label}
            </button>
          ))}
          <span className="font-semibold text-slate-800 dark:text-slate-200">hello@researchdesk.com</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
