import { Package, TrendingUp, DollarSign, CheckSquare, Users, BarChart } from 'lucide-react';
import NavigationButtons from './NavigationButtons';
import './FormStep.css';

const PROBLEMS = [
  { id: 'inventory', label: 'Gestión de inventario', icon: <Package size={18} /> },
  { id: 'sales', label: 'Seguimiento de ventas', icon: <TrendingUp size={18} /> },
  { id: 'finances', label: 'Control de finanzas', icon: <DollarSign size={18} /> },
  { id: 'tasks', label: 'Organización de tareas', icon: <CheckSquare size={18} /> },
  { id: 'clients', label: 'Gestión de clientes', icon: <Users size={18} /> },
  { id: 'reports', label: 'Reportes y análisis', icon: <BarChart size={18} /> },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ProblemStep({ value, onChange, onNext, onBack }: Props) {
  const handleNext = () => {
    if (value) onNext();
  };

  return (
    <div className="form-step">
      <div className="step-header">
        <span className="step-badge">4 / 4</span>
        <h2 className="step-title">¿Cuál es tu mayor desafío?</h2>
        <p className="step-description">
          Faro priorizará las herramientas que más necesitas.
        </p>
      </div>

      <div className="problem-options">
        {PROBLEMS.map((problem) => (
          <button
            key={problem.id}
            id={`problem-${problem.id}`}
            type="button"
            className={`problem-option ${value === problem.id ? 'problem-option--selected' : ''}`}
            onClick={() => onChange(problem.id)}
          >
            <span className="problem-icon">{problem.icon}</span>
            {problem.label}
          </button>
        ))}
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={handleNext}
        nextLabel="Comenzar con Faro"
        nextDisabled={!value}
        isLast={true}
      />
    </div>
  );
}
