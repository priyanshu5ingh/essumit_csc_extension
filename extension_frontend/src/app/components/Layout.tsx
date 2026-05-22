import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import Header from './Header';
import ProgressStepper from './ProgressStepper';
import AIAssistantPopup from './AIAssistantPopup';

export default function Layout() {
  const location = useLocation();
  const isWelcome = location.pathname === '/' || location.pathname === '/welcome';
  const isAIAssistant = location.pathname === '/ai-assistant';
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false);

  return (
    <div className="w-full min-h-screen flex flex-col bg-bg-primary relative">
      <Header onOpenAI={() => setIsAIPopupOpen(true)} className="flex-shrink-0 sticky top-0 z-30" />
      {!isWelcome && !isAIAssistant && <ProgressStepper />}
      <main className="flex-1 w-full focus:outline-none pb-16">
        <Outlet />
      </main>
      <AIAssistantPopup isOpen={isAIPopupOpen} onClose={() => setIsAIPopupOpen(false)} />
    </div>
  );
}
