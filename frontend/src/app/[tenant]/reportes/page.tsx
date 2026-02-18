'use client';

import { useState, useCallback, useMemo } from 'react';
import { AppLayout } from '@/app/components/layouts/AppLayout';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { useTenant } from '@/app/contexts/TenantContext';
import { FileText, Loader2, Search, X, SearchX } from 'lucide-react';
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
  ReportLegend,
  MonthNavigation,
} from '@/app/features/reports/components';

export default function ReportesPage() {
  const { tenant } = useTenant();
  const [lastGeneratedFilters, setLastGeneratedFilters] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    filters,
    setFilters,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    allowedTypes,
    availableLevels,
    availableGrades,
    availableSections,
    availableShifts,
    getFiltersWithDates,
  } = useReportFilters();

  const {
    reportData,
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

    const result = await generateReport(filtersWithDates);

    if (result) {
      setLastGeneratedFilters(currentFiltersKey);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportData || !tenant) return;
    generatePDF(reportData, filters, monthsInPeriod, tenant.name);
  };

  const filteredReportData = useMemo(() => {
    if (!reportData) return null;
    if (!searchQuery.trim()) return reportData;

    const query = searchQuery.toLowerCase().trim();
    const filteredDetails = reportData.details.filter(
      (person) =>
        person.name.toLowerCase().includes(query) ||
        person.document?.toLowerCase().includes(query)
    );

    return { ...reportData, details: filteredDetails };
  }, [reportData, searchQuery]);

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
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ReportFiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            allowedTypes={allowedTypes}
            availableLevels={availableLevels}
            availableGrades={availableGrades}
            availableSections={availableSections}
            availableShifts={availableShifts}
            isLoading={isLoading}
            hasSearched={hasSearched}
            onGenerate={handleGenerate}
            onDownloadPDF={filteredReportData ? handleDownloadPDF : undefined}
            canGenerate={canGenerate}
          />
        </div>

        <div className="lg:col-span-3 min-w-0">
          <div className="rounded-xl p-6 bg-surface border border-border min-h-[600px] flex flex-col">
            {!hasSearched ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <FileText className="w-20 h-20 mb-4 opacity-20 text-text-secondary" />
                <p className="text-lg font-semibold mb-2 text-text-primary">
                  Configura los filtros
                </p>
                <p className="text-sm text-text-secondary">
                  Selecciona los parámetros y presiona &quot;Generar Reporte&quot;
                </p>
              </div>
            ) : !filteredReportData ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
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
                  <div className="p-4 border-b text-center border-border">
                    <h4 className="text-xl font-bold text-text-primary">
                      {activeMonth.name} {activeMonth.year}
                    </h4>
                  </div>
                )}

                <div className="flex-1 overflow-auto">
                  <AttendanceChart data={chartData} />

                  {reportData!.details.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-8">
                      <SearchX className="w-24 h-24 mb-6 opacity-20 text-text-secondary" />
                      <p className="text-2xl font-semibold mb-2 text-text-primary">
                        No se encontraron registros
                      </p>
                      <p className="text-lg text-text-secondary max-w-md">
                        No hay registros de asistencia para los filtros seleccionados. Prueba cambiando el periodo, nivel o sección.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="pt-2 pb-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                          <input
                            type="text"
                            placeholder="Buscar por nombre o documento..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-7 py-2 rounded-xl border border-border bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors text-lg"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                        {searchQuery && (
                          <p className="mt-1 text-xs text-text-secondary">
                            {filteredReportData!.details.length} de {reportData!.details.length} resultados
                          </p>
                        )}
                      </div>

                      {filteredReportData!.details.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-8">
                          <SearchX className="w-16 h-16 mb-4 opacity-20 text-text-secondary" />
                          <p className="text-lg font-semibold mb-2 text-text-primary">
                            Sin coincidencias
                          </p>
                          <p className="text-sm text-text-secondary max-w-md">
                            No se encontraron personas que coincidan con &quot;{searchQuery}&quot;. Intenta con otro nombre o documento.
                          </p>
                        </div>
                      ) : (
                        <>
                          {filters.period === 'daily' && (
                            <DailyReportTable reportData={filteredReportData!} />
                          )}

                          {filters.period !== 'daily' && activeMonth && (
                            <MonthlyReportMatrix
                              reportData={filteredReportData!}
                              activeMonth={activeMonth}
                              userType={filters.type}
                            />
                          )}

                          <ReportLegend />
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
