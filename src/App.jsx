import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
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

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 30, restDelta: 0.001 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

function Shell() {
  const location = useLocation();
  const lenis = useLenis();
  // Key on the first path segment so /problems → /problems/:id doesn't replay the page transition.
  const pageKey = location.pathname.split('/')[1] || 'home';

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
              path="/problems/:problemId?"
              element={
                <Suspense fallback={<div className="curtain" aria-hidden="true" />}>
                  <Problems />
                </Suspense>
              }
            />
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
