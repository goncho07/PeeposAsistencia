import { ReportData } from '@/lib/api/reports';
import { MonthData } from '../hooks';

interface MonthlyReportMatrixProps {
  reportData: ReportData;
  activeMonth: MonthData;
  userType: 'student' | 'teacher';
}

export function MonthlyReportMatrix({
  reportData,
  activeMonth,
  userType,
}: MonthlyReportMatrixProps) {
  return (
    <div className="rounded-xl overflow-hidden bg-surface dark:bg-surface-dark shadow-sm border border-border dark:border-border-dark">
      <div className="overflow-x-auto">
        <table
          className="w-full text-xs min-w-full"
          style={{ borderCollapse: 'collapse' }}
        >
          <thead>
            <tr className="bg-background dark:bg-background-dark border-b-2 border-border dark:border-border-dark">
              <th
                className="p-2 text-center font-bold sticky left-0 z-20 bg-background dark:bg-background-dark text-text-secondary dark:text-text-secondary-dark border-r border-border dark:border-border-dark"
                style={{ width: '50px' }}
              >
                #
              </th>
              <th
                className="p-2 text-left px-4 font-bold sticky z-20 bg-background dark:bg-background-dark text-text-secondary dark:text-text-secondary-dark border-r-2 border-border dark:border-border-dark"
                style={{
                  minWidth: '200px',
                  maxWidth: '250px',
                  left: '30px',
                }}
              >
                {userType === 'student' ? 'ESTUDIANTE' : 'DOCENTE'}
              </th>
              {activeMonth.days.map((d) => (
                <th
                  key={d.day}
                  className={`p-1 text-center border-r border-border dark:border-border-dark ${
                    d.isWeekend ? 'opacity-60' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-secondary)',
                    width: '36px',
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold">{d.day}</span>
                    <span className="text-xs">{d.weekday}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.details.map((person, idx) => (
              <tr
                key={person.id}
                className={`border-b border-border dark:border-border-dark ${
                  idx % 2 === 0
                    ? 'bg-surface dark:bg-surface-dark'
                    : 'bg-background dark:bg-background-dark'
                }`}
              >
                <td
                  className={`p-2 text-center font-bold sticky left-0 z-10 border-r border-border dark:border-border-dark text-text-secondary dark:text-text-secondary-dark ${
                    idx % 2 === 0
                      ? 'bg-surface dark:bg-surface-dark'
                      : 'bg-background dark:bg-background-dark'
                  }`}
                  style={{ width: '30px' }}
                >
                  {idx + 1}
                </td>
                <td
                  className={`p-2 px-4 font-semibold sticky z-10 truncate border-r-2 border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark ${
                    idx % 2 === 0
                      ? 'bg-surface dark:bg-surface-dark'
                      : 'bg-background dark:bg-background-dark'
                  }`}
                  style={{
                    minWidth: '200px',
                    maxWidth: '250px',
                    left: '30px',
                  }}
                >
                  {person.name}
                </td>
                {activeMonth.days.map((d) => {
                  const record = person.records.find(
                    (r) => r.date === d.fullDate
                  );
                  let mark = '';
                  let colorClass = 'text-gray-400';

                  if (!d.isWeekend && record) {
                    if (record.entry_status === 'COMPLETO') {
                      mark = '.';
                      colorClass = 'text-green-600 dark:text-green-400';
                    } else if (record.entry_status === 'TARDANZA') {
                      mark = 'T';
                      colorClass = 'text-orange-600 dark:text-orange-400';
                    } else if (record.entry_status === 'FALTA') {
                      mark = 'F';
                      colorClass = 'text-red-600 dark:text-red-400';
                    } else if (record.entry_status === 'FALTA_JUSTIFICADA') {
                      mark = 'J';
                      colorClass = 'text-blue-600 dark:text-blue-400';
                    }
                  }

                  return (
                    <td
                      key={d.day}
                      className={`p-1 text-center border-r border-border dark:border-border-dark ${
                        d.isWeekend ? 'bg-background dark:bg-background-dark opacity-60' : ''
                      }`}
                      style={{ width: '36px' }}
                    >
                      {!d.isWeekend && mark && (
                        <span className={`font-bold text-base ${colorClass}`}>
                          {mark}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
