import PageTransition from '../components/layout/PageTransition';
import Hero from '../components/home/Hero';
import Projects from '../components/home/Projects';
import { About, Experience } from '../components/home/Sections';
import { useHashScroll } from '../lib/hooks';
import '../components/home/home.css';

export default function Home() {
  useHashScroll();
  return (
    <PageTransition label="Kurinji">
      <Hero />
      <About />
      <Projects />
      <Experience />
    </PageTransition>
  );
}
