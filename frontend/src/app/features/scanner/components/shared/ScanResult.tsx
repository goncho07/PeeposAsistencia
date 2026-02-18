'use client';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { ScanResponse } from '@/lib/api/scanner';

interface ScanResultProps {
  result: ScanResponse | null;
  error: string | null;
  scanType: 'entry' | 'exit';
}

export function ScanResult({ result, error, scanType }: ScanResultProps) {
  const getTimeDisplay = (res: ScanResponse) => {
    if (!res) return '';
    const timeString =
      scanType === 'entry'
        ? res.attendance.entry_time
        : res.attendance.exit_time;

    if (!timeString) return '';

    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));

      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };


  const isOpen = !!(error || result);
  if (!isOpen) return null;

  const isEntry = result ? !!result.attendance.entry_time : false;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface dark:bg-surface-dark rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-slide-up">
        {error ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-danger/15 flex items-center justify-center mb-5">
              <XCircle className="w-14 h-14 text-danger" />
            </div>
            <h3 className="text-3xl font-bold mb-2 text-text-primary dark:text-text-primary-dark">
              Error de Lectura
            </h3>
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark">
              {error}
            </p>
          </div>
        ) : result && (
          <div className="flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 ${
              isEntry ? 'bg-success/15' : 'bg-warning/15'
            }`}>
              <CheckCircle2 className={`w-14 h-14 ${isEntry ? 'text-success' : 'text-warning'}`} />
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[15px] font-black uppercase tracking-[0.2em] mb-4 ${
              isEntry ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
            }`}>
              {isEntry ? 'Entrada Confirmada' : 'Salida Confirmada'}
            </div>

            <h3 className="text-3xl font-bold mb-2 text-text-primary dark:text-text-primary-dark">
              {result.person.full_name}
            </h3>

            <p className="text-lg text-text-secondary dark:text-text-secondary-dark mb-6">
              {result.message}
            </p>

            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-background dark:bg-background-dark">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {getTimeDisplay(result)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}