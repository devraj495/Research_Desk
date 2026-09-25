import { useEffect, useMemo, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/research';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const USER_STORAGE_KEY = 'researchDeskUser';
const TOKEN_STORAGE_KEY = 'researchDeskToken';
const THEME_STORAGE_KEY = 'researchDeskTheme';

function getStoredUser() {
  try {
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function getStoredTheme() {
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [user, setUser] = useState(() => getStoredUser());
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  function navigate(path) {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  }

  function handleAuth(authUser) {
    setUser(authUser);
    navigate('/research');
  }

  function handleLogout() {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    navigate('/auth');
  }

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }

  const page = useMemo(() => {
    if (currentPath === '/' || currentPath === '') {
      return <LandingPage onNavigate={navigate} user={user} onLogout={handleLogout} />;
    }

    if (currentPath === '/research') {
      return <HomePage apiUrl={API_URL} onNavigate={navigate} user={user} onLogout={handleLogout} />;
    }

    if (currentPath === '/compare') {
      return <ComparePage apiUrl={API_URL} onNavigate={navigate} user={user} onLogout={handleLogout} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage onNavigate={navigate} user={user} onLogout={handleLogout} />;
    }

    if (currentPath === '/profile') {
      return <ProfilePage onNavigate={navigate} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />;
    }

    if (currentPath === '/auth') {
      return <AuthPage apiBaseUrl={BACKEND_URL} onNavigate={navigate} onAuth={handleAuth} user={user} onLogout={handleLogout} />;
    }

    return <NotFoundPage onNavigate={navigate} />;
  }, [currentPath, user, theme]);

  return <div>{page}</div>;
}

export default Router;
