import { useEffect, useState } from 'react';
import './AnimatedTagline.css';

const WORDS = [
  'inteligente.',
  'rápido.',
  'eficiente.',
  'organizado.',
  'proactivo.',
  'con IA.',
];

const INTERVAL_MS = 2200;

export default function AnimatedTagline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % WORDS.length);
        setVisible(true);
      }, 320);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <p className="tagline">
      Tu negocio,{' '}
      <span
        className={`tagline-word ${visible ? 'tagline-word--visible' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {WORDS[index]}
      </span>
    </p>
  );
}
