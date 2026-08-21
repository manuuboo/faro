import AnimatedLogo from './AnimatedLogo';
import AnimatedTagline from './AnimatedTagline';
import NavigationButtons from './NavigationButtons';
import './WelcomeStep.css';

interface Props {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: Props) {
  return (
    <div className="welcome-step">
      <div className="welcome-brand">
        <AnimatedLogo size={56} />
        <span className="welcome-wordmark">Faro</span>
      </div>

      <div className="welcome-copy">
        <h1 className="welcome-title">Tu asistente administrativo inteligente</h1>
        <p className="welcome-subtitle">
          Gestiona tu negocio, tus ventas e inventario desde un solo lugar,
          con la ayuda de inteligencia artificial.
        </p>
        <AnimatedTagline />
      </div>

      <NavigationButtons onNext={onNext} nextLabel="Comenzar" />
    </div>
  );
}
