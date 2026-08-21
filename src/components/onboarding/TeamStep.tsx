/**
 * TeamStep
 *
 * Reserved for future use.
 * NOT part of the current MVP onboarding flow.
 */
import { User, Users, Building, Factory } from 'lucide-react';
import NavigationButtons from './NavigationButtons';
import './FormStep.css';

const TEAM_SIZES = [
  { id: 'solo', label: 'Solo yo', icon: <User size={18} /> },
  { id: '2-5', label: '2 – 5', icon: <Users size={18} /> },
  { id: '6-15', label: '6 – 15', icon: <Building size={18} /> },
  { id: '15+', label: 'Más de 15', icon: <Factory size={18} /> },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function TeamStep({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="form-step">
      <div className="step-header">
        <span className="step-badge">Equipo</span>
        <h2 className="step-title">¿Cuántas personas trabajan contigo?</h2>
        <p className="step-description">
          Esto nos ayuda a configurar las herramientas correctas.
        </p>
      </div>

      <div className="category-grid">
        {TEAM_SIZES.map((size) => (
          <button
            key={size.id}
            id={`team-${size.id}`}
            type="button"
            className={`category-option ${value === size.id ? 'category-option--selected' : ''}`}
            onClick={() => onChange(size.id)}
          >
            <span className="category-icon">{size.icon}</span>
            {size.label}
          </button>
        ))}
      </div>

      <NavigationButtons onBack={onBack} onNext={onNext} nextDisabled={!value} />
    </div>
  );
}
