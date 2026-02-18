import { ChevronDown } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface CollapsibleSectionProps {
  icon: LucideIcon;
  title: string;
  summary?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CollapsibleSection({
  icon: Icon,
  title,
  summary,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="cursor-pointer w-full flex items-center justify-between px-4 py-3.5 bg-background hover:bg-background/70 active:bg-background/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon size={24} className="text-primary" />
          </div>
          <div className="text-left min-w-0">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            {!isOpen && summary && (
              <p className="text-sm text-text-secondary truncate">{summary}</p>
            )}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-text-tertiary shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-2 border-t border-border">{children}</div>
        </div>
      </div>
    </div>
  );
}
