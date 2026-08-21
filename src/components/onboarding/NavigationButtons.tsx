import './NavigationButtons.css';

interface Props {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  isLast?: boolean;
}

export default function NavigationButtons({
  onNext,
  onBack,
  nextLabel = 'Continuar',
  backLabel = 'Atrás',
  nextDisabled = false,
  isLast = false,
}: Props) {
  return (
    <div className={`nav-buttons ${onBack ? 'nav-buttons--has-back' : ''}`}>
      {onBack && (
        <button
          id="btn-back"
          type="button"
          className="btn btn-ghost"
          onClick={onBack}
        >
          ← {backLabel}
        </button>
      )}
      <button
        id="btn-next"
        type="button"
        className={`btn btn-primary ${isLast ? 'btn-finish' : ''}`}
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel}
        {!isLast && <span className="btn-arrow">→</span>}
      </button>
    </div>
  );
}
