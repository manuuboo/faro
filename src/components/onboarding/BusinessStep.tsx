import { useState } from 'react';
import NavigationButtons from './NavigationButtons';
import './FormStep.css';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
  userName: string;
}

export default function BusinessStep({
  value,
  onChange,
  onNext,
  onBack,
  userName,
}: Props) {
  const [touched, setTouched] = useState(false);
  const error = touched && value.trim().length === 0;

  const handleNext = () => {
    setTouched(true);
    if (value.trim().length > 0) onNext();
  };

  return (
    <div className="form-step">
      <div className="step-header">
        <span className="step-badge">2 / 4</span>
        <h2 className="step-title">
          Mucho gusto, {userName || 'amigo'}
        </h2>
        <p className="step-description">
          ¿Cuál es el nombre de tu negocio?
        </p>
      </div>

      <div className="field-group">
        <label htmlFor="input-business" className="field-label">
          Nombre del negocio
        </label>
        <input
          id="input-business"
          type="text"
          className={`field-input ${error ? 'field-input--error' : ''}`}
          placeholder="Ej. Café Central"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          autoFocus
          autoComplete="organization"
        />
        {error && (
          <span className="field-error">
            Por favor, ingresa el nombre de tu negocio.
          </span>
        )}
      </div>

      <NavigationButtons onBack={onBack} onNext={handleNext} />
    </div>
  );
}
