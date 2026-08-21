import { useState } from 'react';
import NavigationButtons from './NavigationButtons';
import './FormStep.css';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function NameStep({ value, onChange, onNext, onBack }: Props) {
  const [touched, setTouched] = useState(false);
  const error = touched && value.trim().length === 0;

  const handleNext = () => {
    setTouched(true);
    if (value.trim().length > 0) onNext();
  };

  return (
    <div className="form-step">
      <div className="step-header">
        <span className="step-badge">1 / 4</span>
        <h2 className="step-title">¿Cómo te llamas?</h2>
        <p className="step-description">
          Faro usará tu nombre para personalizar tu experiencia.
        </p>
      </div>

      <div className="field-group">
        <label htmlFor="input-name" className="field-label">
          Tu nombre
        </label>
        <input
          id="input-name"
          type="text"
          className={`field-input ${error ? 'field-input--error' : ''}`}
          placeholder="Ej. Carlos"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          autoFocus
          autoComplete="given-name"
        />
        {error && (
          <span className="field-error">Por favor, ingresa tu nombre.</span>
        )}
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={false}
      />
    </div>
  );
}
