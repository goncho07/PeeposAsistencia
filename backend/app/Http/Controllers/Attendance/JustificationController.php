<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\Justificacion;
use App\Models\Estudiante;
use App\Models\Docente;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class JustificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Justificacion::with(['justifiable', 'creator', 'reviewer']);

        if ($request->query('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->query('type')) {
            if ($request->query('type') === 'student') {
                $query->where('justifiable_type', Estudiante::class);
            } elseif ($request->query('type') === 'teacher') {
                $query->where('justifiable_type', Docente::class);
            }
        }

        $justifications = $query->latest()->paginate(20);

        return response()->json($justifications);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:student,teacher',
            'person_id' => 'required|integer',
            'justification_type' => 'required|in:FALTA,SALIDA_ANTICIPADA',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'reason' => 'required|string|max:1000',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $justifiableType = $request->type === 'student' ? Estudiante::class : Docente::class;
        $justifiable = $justifiableType::findOrFail($request->person_id);

        $documentPath = null;
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('justifications', 'public');
        }

        $justification = Justificacion::create([
            'justifiable_type' => $justifiableType,
            'justifiable_id' => $justifiable->id,
            'type' => $request->justification_type,
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
            'reason' => $request->reason,
            'document_path' => $documentPath,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Justificación creada exitosamente',
            'justification' => $justification->load(['justifiable', 'creator']),
        ], 201);
    }

    public function approve(int $id, Request $request): JsonResponse
    {
        $justification = Justificacion::findOrFail($id);
        $justification->approve($request->user());

        return response()->json([
            'message' => 'Justificación aprobada',
            'justification' => $justification->fresh(['justifiable', 'reviewer']),
        ]);
    }

    public function reject(int $id, Request $request): JsonResponse
    {
        $justification = Justificacion::findOrFail($id);
        $justification->reject($request->user());

        return response()->json([
            'message' => 'Justificación rechazada',
            'justification' => $justification->fresh(['justifiable', 'reviewer']),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $justification = Justificacion::findOrFail($id);

        if ($justification->document_path) {
            Storage::disk('public')->delete($justification->document_path);
        }

        $justification->delete();

        return response()->json([
            'message' => 'Justificación eliminada',
        ]);
    }
}