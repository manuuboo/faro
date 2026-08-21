import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/onboarding/AnimatedBackground';
import StepContainer from '../components/onboarding/StepContainer';
import WelcomeStep from '../components/onboarding/WelcomeStep';
import NameStep from '../components/onboarding/NameStep';
import BusinessStep from '../components/onboarding/BusinessStep';
import CategoryStep from '../components/onboarding/CategoryStep';
import ProblemStep from '../components/onboarding/ProblemStep';
import {
  saveUserData,
  saveBusinessId,
  setOnboardingComplete,
} from '../services/storage';
import { createBusiness } from '../services/supabase/businesses';
import type { OnboardingData } from '../types/onboarding';
import './Onboarding.css';

type Step = 'welcome' | 'name' | 'business' | 'category' | 'problem';
const STEPS: Step[] = ['welcome', 'name', 'business', 'category', 'problem'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    businessName: '',
    category: '',
    teamSize: '',
    mainProblem: '',
  });

  const currentStep = STEPS[stepIndex];

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const finish = async () => {
    try {
      const business = await createBusiness({
        business_name: data.businessName,
        owner_name: data.name,
        category: data.category,
        main_problem: data.mainProblem,
      });

      console.log('Negocio creado en Supabase:', business);
      console.log('BUSINESS ID:', business.id);

      saveUserData(data);
      saveBusinessId(business.id);
      console.log(
        'BUSINESS ID GUARDADO:',
        localStorage.getItem('faro_business_id')
      );
      setOnboardingComplete(true);

      navigate('/dashboard');
    } catch (error) {
      console.error('No se pudo guardar el negocio:', error);
    }
  };

  const update = <K extends keyof OnboardingData>(
    key: K,
    val: OnboardingData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="onboarding-page">
      <AnimatedBackground />

      {currentStep !== 'welcome' && (
        <div className="onboarding-progress" aria-hidden="true">
          {(['name', 'business', 'category', 'problem'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`progress-dot ${stepIndex - 1 > i
                ? 'progress-dot--done'
                : stepIndex - 1 === i
                  ? 'progress-dot--active'
                  : ''
                }`}
            />
          ))}
        </div>
      )}

      <StepContainer key={currentStep}>
        {currentStep === 'welcome' && <WelcomeStep onNext={goNext} />}

        {currentStep === 'name' && (
          <NameStep
            value={data.name}
            onChange={(v) => update('name', v)}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {currentStep === 'business' && (
          <BusinessStep
            value={data.businessName}
            onChange={(v) => update('businessName', v)}
            onNext={goNext}
            onBack={goBack}
            userName={data.name}
          />
        )}

        {currentStep === 'category' && (
          <CategoryStep
            value={data.category}
            onChange={(v) => update('category', v)}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {currentStep === 'problem' && (
          <ProblemStep
            value={data.mainProblem}
            onChange={(v) => update('mainProblem', v)}
            onNext={finish}
            onBack={goBack}
          />
        )}
      </StepContainer>
    </div>
  );
}