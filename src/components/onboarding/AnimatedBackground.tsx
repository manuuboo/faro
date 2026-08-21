import './AnimatedBackground.css';

/**
 * AnimatedBackground
 * Pure CSS animated violet/lavender gradient environment.
 * Respects prefers-reduced-motion automatically via CSS.
 */
export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      <div className="bg-orb bg-orb--3" />
      <div className="bg-orb bg-orb--4" />
    </div>
  );
}
