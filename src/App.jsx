import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router';
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring } from 'motion/react';
import { useLenis } from 'lenis/react';

import SmoothScroll from './components/layout/SmoothScroll';
import Nav from './components/layout/Nav';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/layout/ErrorBoundary';
import Home from './pages/Home';
import Achievements from './pages/Achievements';
import Education from './pages/Education';
import NotFound from './pages/NotFound';
import { useReduceMotion } from './lib/motionPref';
import './components/layout/layout.css';

// The problems page pulls in Supabase, Markdown and syntax highlighting — load it on demand.
const loadProblems = () => import('./pages/Problems');
const Problems = lazy(loadProblems);

// The coding page used to live at /problems; keep old links working.
function LegacyProblemsRedirect() {
  const { problemId } = useParams();
  const { search } = useLocation();
  return <Navigate replace to={{ pathname: problemId ? `/coding/${problemId}` : '/coding', search }} />;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 30, restDelta: 0.001 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

function Shell() {
  const location = useLocation();
  const lenis = useLenis();
  // Key on the first path segment so /coding → /coding/:id doesn't replay the page transition
  // (and the /problems redirect doesn't either).
  const segment = location.pathname.split('/')[1] || 'home';
  const pageKey = segment === 'problems' ? 'coding' : segment;

  const resetScroll = () => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const id = setTimeout(loadProblems, 3000);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollProgress />
      <Nav />
      <AnimatePresence mode="wait" onExitComplete={resetScroll}>
        <ErrorBoundary key={pageKey}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/education" element={<Education />} />
            <Route
              path="/coding/:problemId?"
              element={
                <Suspense fallback={<div className="curtain" aria-hidden="true" />}>
                  <Problems />
                </Suspense>
              }
            />
            <Route path="/problems/:problemId?" element={<LegacyProblemsRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </AnimatePresence>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </>
  );
}

export default function App() {
  const reduce = useReduceMotion();
  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
      <SmoothScroll>
        <Shell />
      </SmoothScroll>
    </MotionConfig>
  );
}
