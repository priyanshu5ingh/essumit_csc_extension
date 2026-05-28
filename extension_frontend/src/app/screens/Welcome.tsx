import { useNavigate } from 'react-router';
import { FileText, Bot, ChevronRight, Sparkles } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm animate-slideUp">
        <div className="bg-surface rounded-xl p-6 border border-border-custom shadow-card">
          <div className="mb-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-saffron to-saffron-deep flex items-center justify-center mx-auto mb-4 shadow-lg shadow-saffron/20">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-navy mb-1">नमस्ते, Welcome</h2>
            <p className="text-sm text-muted-text font-medium">Digital India service delivery platform</p>
          </div>

          <button
            onClick={() => navigate('/citizen-details')}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-green to-green-deep hover:from-green-hover hover:to-green-deep text-white font-semibold text-sm flex items-center justify-between px-5 transition-all duration-200 shadow-md shadow-green/20 active:scale-[0.98] group mb-1"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                <FileText className="w-4 h-4" strokeWidth={2} />
              </div>
              <span>नया आवेदन शुरू करें</span>
            </div>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          </button>
          <p className="text-xs text-muted-text mb-5 px-1 font-medium">Start New Application</p>

          <button
            onClick={() => navigate('/ai-assistant')}
            className="w-full h-12 rounded-xl bg-surface border-2 border-slate-200 hover:border-saffron/30 hover:bg-saffron-light/20 text-navy font-semibold text-sm flex items-center justify-between px-5 transition-all duration-200 active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-saffron/20 to-saffron/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-saffron" strokeWidth={2} />
              </div>
              <span>AI सहायक से बात करें</span>
            </div>
            <ChevronRight className="w-4 h-4 text-saffron group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          </button>
          <p className="text-xs text-muted-text px-1 font-medium">Chat with AI Assistant</p>

          <div className="mt-6 pt-5 border-t border-border-custom">
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-text">
              <Sparkles className="w-3 h-3 text-saffron" strokeWidth={2} />
              <span>v1.0.0 &mdash; CHIPS Chhattisgarh &mdash; Government of India</span>
              <Sparkles className="w-3 h-3 text-saffron" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
