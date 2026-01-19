import { ReportData } from '@/lib/api/reports';

interface DailyReportTableProps {
  reportData: ReportData;
}

export function DailyReportTable({ reportData }: DailyReportTableProps) {
  return (
    <div className="rounded-xl overflow-hidden bg-surface dark:bg-surface-dark shadow-sm border border-border dark:border-border-dark">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className="bg-background dark:bg-background-dark border-b-2 border-border dark:border-border-dark">
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">
                N°
              </th>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">
                Apellidos y Nombres
              </th>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">
                Entrada
              </th>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">
                Salida
              </th>
              <th className="p-4 text-center text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {reportData.details.map((person, idx) => {
              const record = person.records[0];
              return (
                <tr
                  key={person.id}
                  className={`border-b border-border dark:border-border-dark ${
                    idx % 2 === 0
                      ? 'bg-surface dark:bg-surface-dark'
                      : 'bg-background dark:bg-background-dark'
                  }`}
                >
                  <td className="p-4 text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                    {idx + 1}
                  </td>
                  <td className="p-4 text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    {person.name}
                  </td>
                  <td className="p-4 text-sm text-text-secondary dark:text-text-secondary-dark">
                    {record?.entry_time || '-'}
                  </td>
                  <td className="p-4 text-sm text-text-secondary dark:text-text-secondary-dark">
                    {record?.exit_time || '-'}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                        record?.entry_status === 'COMPLETO'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : record?.entry_status === 'TARDANZA'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                            : record?.entry_status === 'FALTA'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}
                    >
                      {record?.entry_status || '-'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
