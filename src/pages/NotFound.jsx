import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import BloomMark from '../components/ui/BloomMark';
import './pages.css';

export default function NotFound() {
  return (
    <PageTransition label="404">
      <section className="container notfound">
        <motion.span
          className="notfound__bloom"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        >
          <BloomMark />
        </motion.span>
        <h1 className="notfound__title">404</h1>
        <p className="lede">
          This page is like the Kurinji flower — it only shows up once every twelve years. Try again in 2038?
        </p>
        <Link to="/" className="btn btn--primary">
          <ArrowLeft /> Back home
        </Link>
      </section>
    </PageTransition>
  );
}
