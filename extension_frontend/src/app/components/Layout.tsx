import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import Header from './Header';
import ProgressStepper from './ProgressStepper';
import AIAssistantPopup from './AIAssistantPopup';

export default function Layout() {
  const location = useLocation();
  const isWelcome = location.pathname === '/' || location.pathname === '/welcome';
  const isAIAssistant = location.pathname === '/ai-assistant';
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const prevLocation = useRef(location);

  useEffect(() => {
    if (location.pathname !== prevLocation.current.pathname) {
      setTransitionStage('fadeOut');
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 100);
      prevLocation.current = location;
      return () => clearTimeout(timeout);
    } else {
      setDisplayLocation(location);
    }
  }, [location]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-b from-bg-primary to-slate-50 relative">
      <Header onOpenAI={() => setIsAIPopupOpen(true)} className="flex-shrink-0 sticky top-0 z-30" />
      {!isWelcome && !isAIAssistant && <ProgressStepper />}
      <main
        className={`flex-1 w-full focus:outline-none pb-16 transition-opacity duration-150 ease-in-out ${
          transitionStage === 'fadeIn' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Outlet />
      </main>
      <AIAssistantPopup isOpen={isAIPopupOpen} onClose={() => setIsAIPopupOpen(false)} />
    </div>
  );
}
