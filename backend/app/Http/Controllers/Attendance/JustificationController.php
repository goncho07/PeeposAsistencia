<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\Justification;
use App\Models\Student;
use App\Models\Teacher;
use App\Http\Requests\Justifications\JustificationStoreRequest;
use App\Http\Resources\JustificationResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class JustificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Justification::with(['justifiable', 'creator']);

            if ($request->query('type')) {
                if ($request->query('type') === 'student') {
                    $query->where('justifiable_type', Student::class);
                } elseif ($request->query('type') === 'teacher') {
                    $query->where('justifiable_type', Teacher::class);
                }
            }

            if ($request->query('date_from')) {
                $query->where('date_from', '>=', $request->query('date_from'));
            }

            if ($request->query('date_to')) {
                $query->where('date_to', '<=', $request->query('date_to'));
            }

            $justifications = $query->latest()->paginate(20);

            return $this->success(JustificationResource::collection($justifications)->response()->getData(true));
        } catch (\Exception $e) {
            return $this->error('Error al obtener justificaciones: ' . $e->getMessage(), null, 500);
        }
    }

    public function store(JustificationStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            $documentPath = null;
            if ($request->hasFile('document')) {
                $documentPath = $request->file('document')->store('justifications', 'public');
                $data['document_path'] = $documentPath;
            }

            $data['tenant_id'] = $request->user()->tenant_id;
            $data['created_by'] = $request->user()->id;

            $justification = DB::transaction(function () use ($data) {
                return Justification::create($data);
            });

            $justification->load(['justifiable', 'creator']);

            return $this->created(
                new JustificationResource($justification),
                'Justificación creada y aplicada exitosamente'
            );
        } catch (\Exception $e) {
            if (isset($documentPath)) {
                Storage::disk('public')->delete($documentPath);
            }
            return $this->error('Error al crear justificación: ' . $e->getMessage(), null, 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $justification = Justification::with(['justifiable', 'creator'])->findOrFail($id);

            return $this->success(new JustificationResource($justification));
        } catch (\Exception $e) {
            return $this->error('Justificación no encontrada', null, 404);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $justification = Justification::findOrFail($id);

            DB::transaction(function () use ($justification) {
                if ($justification->document_path) {
                    Storage::disk('public')->delete($justification->document_path);
                }

                $justification->delete();
            });

            return $this->success(null, 'Justificación eliminada exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al eliminar justificación: ' . $e->getMessage(), null, 500);
        }
    }
}