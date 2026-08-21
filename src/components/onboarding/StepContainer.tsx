import type { ReactNode } from 'react';
import './StepContainer.css';

interface Props {
  children: ReactNode;
}

export default function StepContainer({ children }: Props) {
  return (
    <div className="step-container">
      <div className="step-card">{children}</div>
    </div>
  );
}
