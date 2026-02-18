'use client';
import { useState, useRef, useCallback } from 'react';
import {
  superadminService,
  ImportValidationResult,
  ImportExecuteResult,
} from '@/lib/api/superadmin';
import { Button } from '@/app/components/ui/base';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Users,
  GraduationCap,
} from 'lucide-react';

interface ImportResultState {
  success: boolean;
  message: string;
  result?: ImportExecuteResult;
}

export function TenantImportTab() {
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResultState | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [accumulatedResult, setAccumulatedResult] = useState<ImportExecuteResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setImportResult(null);
    setValidationResult(null);
    setValidating(true);

    try {
      const result = await superadminService.validateImport(selectedFile);
      setValidationResult(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al validar archivo';
      setValidationResult({
        headers: [],
        total_rows: 0,
        students_count: 0,
        teachers_count: 0,
        valid_rows: 0,
        warnings: [],
        errors: [{ row: 0, message: errorMessage }],
        preview: [],
        can_import: false,
      });
    } finally {
      setValidating(false);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      processFile(droppedFile);
    }
  }, [processFile]);

  const handleImport = async () => {
    if (!file || !validationResult?.can_import) return;

    setImporting(true);
    setProgress({ current: 0, total: validationResult.total_rows });

    const BATCH_SIZE = 50;
    let offset = 0;
    const accumulated: ImportExecuteResult = {
      students: { imported: 0, updated: 0, skipped: 0 },
      teachers: { imported: 0, updated: 0, skipped: 0 },
      errors: [],
    };

    try {
      let hasMore = true;
      while (hasMore) {
        const batch = await superadminService.executeBatchImport(file, offset, BATCH_SIZE);

        accumulated.students.imported += batch.students.imported;
        accumulated.students.updated += batch.students.updated;
        accumulated.students.skipped += batch.students.skipped;
        accumulated.teachers.imported += batch.teachers.imported;
        accumulated.teachers.updated += batch.teachers.updated;
        accumulated.teachers.skipped += batch.teachers.skipped;
        accumulated.errors.push(...batch.errors);

        offset += batch.processed_count;
        hasMore = batch.has_more;
        setProgress({ current: offset, total: batch.total });
        setAccumulatedResult({ ...accumulated });
      }

      setImportResult({
        success: true,
        message: 'Importación completada exitosamente',
        result: accumulated,
      });
      setValidationResult(null);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error durante la importación';
      setImportResult({
        success: false,
        message: `Error en lote (fila ~${offset + 2}): ${errorMessage}`,
        result: accumulated.students.imported + accumulated.teachers.imported > 0 ? accumulated : undefined,
      });
    } finally {
      setImporting(false);
      setProgress(null);
      setAccumulatedResult(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setImportResult(null);
    setProgress(null);
    setAccumulatedResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
        <h3 className="text-xl font-semibold text-text-primary mb-2">Importación de datos</h3>
        <p className="text-base text-text-secondary mb-3 leading-relaxed">
          Sube un archivo CSV con estudiantes y docentes. El sistema detectará automáticamente
          el tipo de registro según la columna <code className="px-1.5 py-0.5 bg-background rounded text-xs font-mono text-primary">ROL</code>.
        </p>
        <div className="text-text-tertiary">
          <p className="text-base font-semibold mb-1">Columnas requeridas:</p>
          <p className="text-sm font-mono">ROL, ETAPA, SECCIÓN, APELLIDO PATERNO, NOMBRES</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-3">Archivo CSV</h3>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragging
              ? 'border-primary bg-primary/10'
              : file
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            {validating ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-text-secondary">Validando archivo...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center">
                <FileSpreadsheet size={54} className="text-primary mb-3" />
                <p className="text-xl font-medium text-text-primary">{file.name}</p>
                <p className="text-md text-text-secondary mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload size={54} className="text-text-tertiary mb-3" />
                <p className="text-xl text-text-secondary">
                  Arrastra tu archivo CSV aquí o{' '}
                  <span className="text-primary">haz click para seleccionar</span>
                </p>
                <p className="text-md text-text-tertiary mt-2">
                  Formato aceptado: .csv (máx. 10MB)
                </p>
              </div>
            )}
          </label>
        </div>
      </div>

      {validationResult && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3.5 border-b border-border bg-background">
            <h3 className="text-xl font-semibold text-text-primary">Resultado de validación</h3>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="text-center p-3 bg-background rounded-xl">
                <p className="text-3xl font-bold text-text-primary">
                  {validationResult.total_rows}
                </p>
                <p className="text-base text-text-secondary">Total filas</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-xl">
                <div className="flex items-center justify-center gap-1">
                  <GraduationCap size={20} className="text-primary" />
                  <p className="text-3xl font-bold text-primary">
                    {validationResult.students_count}
                  </p>
                </div>
                <p className="text-base text-text-secondary">Estudiantes</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-xl">
                <div className="flex items-center justify-center gap-1">
                  <Users size={20} className="text-primary" />
                  <p className="text-3xl font-bold text-primary">
                    {validationResult.teachers_count}
                  </p>
                </div>
                <p className="text-base text-text-secondary">Docentes</p>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-xl">
                <p className="text-3xl font-bold text-warning">
                  {validationResult.warnings.length}
                </p>
                <p className="text-base text-text-secondary">Advertencias</p>
              </div>
              <div className="text-center p-3 bg-danger/10 rounded-xl">
                <p className="text-3xl font-bold text-danger">
                  {validationResult.errors.length}
                </p>
                <p className="text-base text-text-secondary">Errores</p>
              </div>
            </div>

            {validationResult.preview.length > 0 && (
              <div>
                <p className="text-lg font-medium text-text-secondary mb-2">
                  Vista previa (primeras 10 filas):
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-background">
                        {validationResult.headers.slice(0, 8).map((header) => (
                          <th
                            key={header}
                            className="px-3 py-2 text-left text-xs font-semibold text-text-secondary"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {validationResult.preview.map((row, i) => (
                        <tr key={i}>
                          {validationResult.headers.slice(0, 8).map((header) => (
                            <td
                              key={header}
                              className="px-3 py-2 text-text-primary whitespace-nowrap"
                            >
                              {row[header] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div>
                <p className="text-lg font-medium text-warning mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={24} />
                  Advertencias
                </p>
                <div className="max-h-42 bg-background overflow-y-auto space-y-1 p-3">
                  {validationResult.warnings.slice(0, 10).map((w, i) => (
                    <p key={i} className="text-base text-text-secondary">
                      Fila {w.row}: {w.message}
                    </p>
                  ))}
                  {validationResult.warnings.length > 10 && (
                    <p className="text-base text-text-tertiary">
                      +{validationResult.warnings.length - 10} más...
                    </p>
                  )}
                </div>
              </div>
            )}

            {validationResult.errors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-danger mb-2 flex items-center gap-1.5">
                  <XCircle size={24} />
                  Errores
                </p>
                <div className="max-h-42 overflow-y-auto space-y-1">
                  {validationResult.errors.slice(0, 10).map((e, i) => (
                    <p key={i} className="text-base text-text-secondary">
                      {e.row > 0 ? `Fila ${e.row}: ` : ''}{e.message}
                    </p>
                  ))}
                  {validationResult.errors.length > 10 && (
                    <p className="text-base text-text-tertiary">
                      +{validationResult.errors.length - 10} más...
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={handleReset} className="text-xl">
                Cancelar
              </Button>
              <Button
                variant="primary"
                icon={<Upload size={18} />}
                onClick={handleImport}
                loading={importing}
                disabled={!validationResult.can_import}
                className="text-xl"
              >
                Importar {validationResult.valid_rows} registros
              </Button>
            </div>
          </div>
        </div>
      )}

      {importing && progress && progress.total > 0 && (
        <div className="border border-primary/30 rounded-xl p-5 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-text-secondary">
              Importando... {progress.current} de {progress.total} registros
            </span>
            <span className="text-xl font-bold text-primary">
              {Math.round((progress.current / progress.total) * 100)}%
            </span>
          </div>
          <div className="w-full h-3 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          {accumulatedResult && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-base text-text-tertiary">
              <span>
                <GraduationCap size={20} className="inline mr-1" />
                {accumulatedResult.students.imported} nuevos, {accumulatedResult.students.updated} actualizados
              </span>
              <span>
                <Users size={20} className="inline mr-1" />
                {accumulatedResult.teachers.imported} nuevos, {accumulatedResult.teachers.updated} actualizados
              </span>
              {accumulatedResult.errors.length > 0 && (
                <span className="text-danger">
                  {accumulatedResult.errors.length} error(es)
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {importResult && (
        <div
          className={`p-4 rounded-xl border ${
            importResult.success
              ? 'bg-success/10 border-success/20'
              : 'bg-danger/10 border-danger/20'
          }`}
        >
          <div className="flex items-start gap-3">
            {importResult.success ? (
              <CheckCircle size={24} className="text-success shrink-0" />
            ) : (
              <XCircle size={24} className="text-danger shrink-0" />
            )}
            <div className="flex-1">
              <p
                className={`text-xl font-semibold ${
                  importResult.success ? 'text-success' : 'text-danger'
                }`}
              >
                {importResult.message}
              </p>
              {importResult.success && importResult.result && (
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-background rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap size={24} className="text-primary" />
                      <span className="font-semibold text-text-primary text-lg">Estudiantes</span>
                    </div>
                    <div className="space-y-1 text-text-secondary text-base">
                      <p>Importados: {importResult.result.students.imported}</p>
                      <p>Actualizados: {importResult.result.students.updated}</p>
                      {importResult.result.students.skipped > 0 && (
                        <p>Omitidos: {importResult.result.students.skipped}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-background rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={24} className="text-info" />
                      <span className="font-semibold text-text-primary text-lg">Docentes</span>
                    </div>
                    <div className="space-y-1 text-text-secondary text-base">
                      <p>Importados: {importResult.result.teachers.imported}</p>
                      <p>Actualizados: {importResult.result.teachers.updated}</p>
                      {importResult.result.teachers.skipped > 0 && (
                        <p>Omitidos: {importResult.result.teachers.skipped}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={24} />}
              onClick={handleReset}
              className="text-xl"
            >
              Nueva importación
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
