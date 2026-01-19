export function ReportLegend() {
  return (
    <div className="mt-6 rounded-xl overflow-hidden bg-surface dark:bg-surface-dark shadow-sm border border-border dark:border-border-dark">
      <div className="p-4 border-b bg-background dark:bg-background-dark border-border dark:border-border-dark">
        <h4 className="text-sm font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">
          Simbología
        </h4>
      </div>
      <div className="p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
          <span className="font-black text-xl text-green-600 dark:text-green-400">
            .
          </span>
          <span className="text-sm font-bold text-green-800 dark:text-green-300">
            ASISTIÓ
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
          <span className="font-bold text-base text-red-600 dark:text-red-400">
            F
          </span>
          <span className="text-sm font-bold text-red-800 dark:text-red-300">
            FALTÓ
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700">
          <span className="font-bold text-base text-orange-600 dark:text-orange-400">
            T
          </span>
          <span className="text-sm font-bold text-orange-800 dark:text-orange-300">
            TARDANZA
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
          <span className="font-bold text-base text-blue-600 dark:text-blue-400">
            J
          </span>
          <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
            FALTA JUSTIFICADA
          </span>
        </div>
      </div>
    </div>
  );
}
