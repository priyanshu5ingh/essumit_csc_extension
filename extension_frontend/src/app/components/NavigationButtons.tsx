import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}

export default function NavigationButtons({
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = 'आगे बढ़ें',
}: NavigationButtonsProps) {
  return (
    <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-border-custom px-4 py-3">
      <div className="flex gap-2.5">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 h-11 rounded-lg bg-white border-2 border-slate-200 text-navy font-semibold text-sm flex items-center justify-center gap-1.5 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            <span>पीछे</span>
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className={`flex-[2] h-11 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] ${
              nextDisabled
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-saffron to-saffron-deep text-white shadow-md shadow-saffron/20 hover:shadow-lg hover:shadow-saffron/30'
            }`}
          >
            <span>{nextLabel}</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
