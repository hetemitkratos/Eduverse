import React, { useEffect, useState } from 'react';
import Home from './pages/Home';
import LearnPage from './pages/LearnPage';

/**
 * Minimal hash-based router.
 * #/       → Researcher demo (Home)
 * #/learn  → Learner journey (LearnPage)
 */
const getRoute = () => {
  const hash = window.location.hash;
  if (hash === '#/learn' || hash.startsWith('#/learn')) return 'learn';
  return 'home';
};

function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === 'learn') return <LearnPage />;
  return <Home />;
}

export default App;
