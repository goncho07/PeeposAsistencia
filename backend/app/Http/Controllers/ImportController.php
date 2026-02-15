<?php

namespace App\Http\Controllers;

use App\Http\Requests\Import\ImportBatchRequest;
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
                $request->file('file')->getPathname()
            );

            return $this->success($result);
        } catch (\Exception $e) {
            return $this->error('Error al procesar el archivo: ' . $e->getMessage(), null, 422);
        }
    }

    /**
     * Execute a batch of the CSV import.
     *
     * POST /api/superadmin/execute-batch
     */
    public function executeBatch(ImportBatchRequest $request): JsonResponse
    {
        try {
            $result = $this->importService->executeBatch(
                $request->file('file')->getPathname(),
                (int) $request->input('offset', 0),
                (int) $request->input('batch_size', 50),
            );

            return $this->success($result, 'Lote procesado');
        } catch (\Exception $e) {
            return $this->error('Error durante la importación: ' . $e->getMessage(), null, 500);
        }
    }
}
