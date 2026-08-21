import './AnimatedLogo.css';

interface Props {
  size?: number;
  /** If true, renders a lighter version for use on dark backgrounds */
  inverted?: boolean;
}

/**
 * FaroLogo — circular mark.
 * Works from 24px to 64px. Has a subtle slow rotation animation on the outer ring.
 */
export default function AnimatedLogo({ size = 48, inverted = false }: Props) {
  return (
    <div
      className={`faro-logo ${inverted ? 'faro-logo--inverted' : ''}`}
      style={{ width: size, height: size }}
      aria-label="Faro logo"
      role="img"
    >
      <svg
        className="faro-logo__svg"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ width: '100%', height: '100%' }}
      >
        <circle 
          className="faro-logo__ring"
          cx="16" cy="16" r="14" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeDasharray="32 10"
        />
        <circle 
          className="faro-logo__inner"
          cx="16" cy="16" r="6" 
          fill="currentColor"
        />
        <circle 
          className="faro-logo__dot"
          cx="16" cy="16" r="2.5" 
          fill="white"
        />
      </svg>
    </div>
  );
}
