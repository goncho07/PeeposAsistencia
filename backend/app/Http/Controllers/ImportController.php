<?php

namespace App\Http\Controllers;

use App\Http\Requests\Import\ImportExecuteRequest;
use App\Http\Requests\Import\ImportValidateRequest;
use App\Services\ImportService;
use Illuminate\Http\JsonResponse;

class ImportController extends Controller
{
    public function __construct(
        private ImportService $importService
    ) {}

    /**
     * Validate a CSV file before importing.
     *
     * POST /api/import/validate
     */
    public function validate(ImportValidateRequest $request): JsonResponse
    {
        try {
            $result = $this->importService->validateFile(
                $request->file('file')->getPathname(),
                $request->type
            );

            return $this->success($result);
        } catch (\Exception $e) {
            return $this->error('Error al procesar el archivo: ' . $e->getMessage(), null, 422);
        }
    }

    /**
     * Execute the CSV import.
     *
     * POST /api/import/execute
     */
    public function execute(ImportExecuteRequest $request): JsonResponse
    {
        try {
            $result = $this->importService->executeImport(
                $request->file('file')->getPathname(),
                $request->type
            );

            return $this->success([
                'imported' => $result['imported'],
                'updated' => $result['updated'],
                'skipped' => $result['skipped'],
                'errors' => $result['errors'],
            ], 'Importación completada exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error durante la importación: ' . $e->getMessage(), null, 500);
        }
    }
}
