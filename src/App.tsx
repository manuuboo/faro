import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import { supabase } from './lib/supabase';
import { isOnboardingComplete } from './services/storage';

function RootRedirect() {
  return isOnboardingComplete() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/onboarding" replace />
  );
}

function App() {
  useEffect(() => {
    const testSupabase = async () => {
      const { data, error } = await supabase
        .from('test_connection')
        .select('message')
        .limit(1);

      if (error) {
        console.error('Error conectando con Supabase:', error);
        return;
      }

      console.log('Supabase conectado:', data);
    };

    testSupabase();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;