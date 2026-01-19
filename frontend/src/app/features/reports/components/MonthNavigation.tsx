import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MonthData } from '../hooks';

interface MonthNavigationProps {
  activeMonth: MonthData;
  activeMonthIdx: number;
  totalMonths: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function MonthNavigation({
  activeMonth,
  activeMonthIdx,
  totalMonths,
  onPrevious,
  onNext,
}: MonthNavigationProps) {
  return (
    <div className="p-4 border-b flex justify-between items-center border-border dark:border-border-dark">
      <button
        onClick={onPrevious}
        disabled={activeMonthIdx === 0}
        className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <div className="text-center">
        <h4 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
          {activeMonth?.name} {activeMonth?.year}
        </h4>
      </div>

      <button
        onClick={onNext}
        disabled={activeMonthIdx === totalMonths - 1}
        className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
