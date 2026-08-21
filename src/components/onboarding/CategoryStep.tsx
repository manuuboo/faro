import { Utensils, ShoppingBag, Settings, Activity, BookOpen, Laptop, HardHat, Globe } from 'lucide-react';
import NavigationButtons from './NavigationButtons';
import './FormStep.css';

const CATEGORIES = [
  { id: 'gastronomy', label: 'Gastronomía', icon: <Utensils size={18} /> },
  { id: 'retail', label: 'Comercio', icon: <ShoppingBag size={18} /> },
  { id: 'services', label: 'Servicios', icon: <Settings size={18} /> },
  { id: 'health', label: 'Salud', icon: <Activity size={18} /> },
  { id: 'education', label: 'Educación', icon: <BookOpen size={18} /> },
  { id: 'technology', label: 'Tecnología', icon: <Laptop size={18} /> },
  { id: 'construction', label: 'Construcción', icon: <HardHat size={18} /> },
  { id: 'other', label: 'Otro', icon: <Globe size={18} /> },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CategoryStep({ value, onChange, onNext, onBack }: Props) {
  const handleNext = () => {
    if (value) onNext();
  };

  return (
    <div className="form-step">
      <div className="step-header">
        <span className="step-badge">3 / 4</span>
        <h2 className="step-title">¿Cuál es tu rubro?</h2>
        <p className="step-description">
          Selecciona la categoría que mejor describe tu negocio.
        </p>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            id={`category-${cat.id}`}
            type="button"
            className={`category-option ${value === cat.id ? 'category-option--selected' : ''}`}
            onClick={() => onChange(cat.id)}
          >
            <span className="category-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={!value}
      />
    </div>
  );
}
