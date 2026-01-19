'use client';

import { useState, useCallback } from 'react';
import { AppLayout } from '@/app/components/layouts/AppLayout';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { useTenant } from '@/app/contexts/TenantContext';
import { FileText, Loader2 } from 'lucide-react';
import {
  useReportFilters,
  useReportData,
  useReportPDF,
} from '@/app/features/reports/hooks';
import {
  ReportFiltersPanel,
  DailyReportTable,
  MonthlyReportMatrix,
  AttendanceChart,
  BehaviorKPIs,
  ReportLegend,
  MonthNavigation,
} from '@/app/features/reports/components';

export default function ReportesPage() {
  const { tenant } = useTenant();
  const [lastGeneratedFilters, setLastGeneratedFilters] = useState<string | null>(null);

  const {
    filters,
    setFilters,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    bimesterDates,
    availableLevels,
    availableGrades,
    availableSections,
    availableShifts,
    getFiltersWithDates,
  } = useReportFilters();

  const {
    reportData,
    behaviorStats,
    isLoading,
    hasSearched,
    activeMonthIdx,
    setActiveMonthIdx,
    monthsInPeriod,
    activeMonth,
    chartData,
    generateReport,
  } = useReportData();

  const { generatePDF } = useReportPDF();

  const getCurrentFiltersKey = useCallback(() => {
    const filtersWithDates = getFiltersWithDates();
    return JSON.stringify({
      ...filtersWithDates,
      selectedMonth,
      selectedYear,
    });
  }, [getFiltersWithDates, selectedMonth, selectedYear]);

  const filtersUnchanged = hasSearched && lastGeneratedFilters === getCurrentFiltersKey();

  const handleGenerate = async () => {
    const filtersWithDates = getFiltersWithDates();
    const currentFiltersKey = getCurrentFiltersKey();

    const result = await generateReport(
      filtersWithDates,
      bimesterDates,
      selectedMonth,
      selectedYear
    );

    if (result) {
      setLastGeneratedFilters(currentFiltersKey);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportData || !tenant) return;
    generatePDF(reportData, filters, monthsInPeriod, tenant.name);
  };

  const canGenerate =
    !isLoading &&
    (filters.period !== 'bimester' || !!filters.bimester) &&
    !filtersUnchanged;

  return (
    <AppLayout>

      <HeroHeader
        title="Reportes de Asistencia"
        subtitle="Genera reportes detallados por periodo académico"
        icon={FileText}
        breadcrumbs={[{ label: 'Reportes', icon: FileText }]}
      />

      {filters.type === 'student' && behaviorStats && (
        <BehaviorKPIs stats={behaviorStats} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ReportFiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            availableLevels={availableLevels}
            availableGrades={availableGrades}
            availableSections={availableSections}
            availableShifts={availableShifts}
            isLoading={isLoading}
            hasSearched={hasSearched}
            onGenerate={handleGenerate}
            onDownloadPDF={reportData ? handleDownloadPDF : undefined}
            canGenerate={canGenerate}
          />
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl p-6 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm min-h-[600px] flex flex-col">
            {!hasSearched ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <FileText className="w-20 h-20 mb-4 opacity-20 text-text-secondary dark:text-text-secondary-dark" />
                <p className="text-lg font-semibold mb-2 text-text-primary dark:text-text-primary-dark">
                  Configura los filtros
                </p>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                  Selecciona los parámetros y presiona &quot;Generar Reporte&quot;
                </p>
              </div>
            ) : !reportData ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary dark:text-primary-light" />
              </div>
            ) : (
              <>
                {filters.period === 'bimester' &&
                  monthsInPeriod.length > 1 &&
                  activeMonth && (
                    <MonthNavigation
                      activeMonth={activeMonth}
                      activeMonthIdx={activeMonthIdx}
                      totalMonths={monthsInPeriod.length}
                      onPrevious={() =>
                        setActiveMonthIdx((prev) => Math.max(0, prev - 1))
                      }
                      onNext={() =>
                        setActiveMonthIdx((prev) =>
                          Math.min(monthsInPeriod.length - 1, prev + 1)
                        )
                      }
                    />
                  )}

                {filters.period === 'monthly' && activeMonth && (
                  <div className="p-4 border-b text-center border-border dark:border-border-dark">
                    <h4 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                      {activeMonth.name} {activeMonth.year}
                    </h4>
                  </div>
                )}

                <div className="flex-1 overflow-auto">
                  <AttendanceChart data={chartData} />

                  {filters.period === 'daily' && (
                    <DailyReportTable reportData={reportData} />
                  )}

                  {filters.period !== 'daily' && activeMonth && (
                    <MonthlyReportMatrix
                      reportData={reportData}
                      activeMonth={activeMonth}
                      userType={filters.type}
                    />
                  )}

                  <ReportLegend />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}