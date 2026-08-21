import { useState, useEffect } from 'react';
import { setTutorialComplete } from '../../services/storage';

interface Props {
  onClose: () => void;
  onNavigate: (section: any) => void;
  onOpenChat: () => void;
}

export default function HelpTutorial({ onClose, onNavigate: _onNavigate, onOpenChat: _onOpenChat }: Props) {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Prevent scrolling behind tutorial
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep(s => s + 1);
        setAnimating(false);
      }, 300);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setTutorialComplete();
    onClose();
  };

  const STEPS = [
    {
      title: "1. Faro AI",
      desc: "Comunícate con Faro como si fuera una persona. Podés enviarle texto, mensajes de audio, o adjuntar imágenes y archivos. Él se encargará de entender y procesar la información por vos.",
      action: null,
      align: "center",
      pos: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    },
    {
      title: "2. Registro manual",
      desc: "Si preferís el control total, podés registrar manualmente tus ventas, productos, compras y clientes desde los botones de acción rápida o dentro de cada módulo.",
      action: null,
      align: "center",
      pos: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    },
    {
      title: "3. Navegación",
      desc: "Usá el menú lateral para acceder al Dashboard (resumen) y a todos los módulos principales: Ventas, Compras, Inventario, Clientes y más.",
      action: null,
      align: "center",
      pos: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    },
    {
      title: "4. Asistencia Faro",
      desc: "Faro te ayuda de forma proactiva con sugerencias inteligentes en el Dashboard, notificaciones importantes y reportes detallados para que tomes las mejores decisiones.",
      action: null,
      align: "center",
      pos: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }
  ];

  const currentStep = STEPS[step];

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,17,33,0.7)', zIndex: 699, backdropFilter: 'blur(2px)', animation: 'fadeIn 0.3s ease' }} onClick={handleFinish} />

      {/* Highlight element (simulated by a ring over the DOM element if we had refs, but we use fixed position for the modal) */}

      <div style={{
        position: 'fixed', ...currentStep.pos, width: 340, background: 'white',
        borderRadius: 'var(--radius-xl)', padding: '28px', zIndex: 700,
        boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-light)',
        opacity: animating ? 0 : 1, transform: animating ? `${currentStep.pos.transform || ''} translateY(10px)` : `${currentStep.pos.transform || ''} translateY(0)`,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)'
      }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'var(--border-light)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>{currentStep.title}</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 24px' }}>{currentStep.desc}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleFinish} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Saltar</button>

          <button className="btn-primary" onClick={currentStep.action || handleNext}>
            {step === STEPS.length - 1 ? 'Empezar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </>
  );
}
