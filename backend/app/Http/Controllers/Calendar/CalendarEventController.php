<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Http\Resources\CalendarEventResource;
use App\Services\CalendarEventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CalendarEventController extends Controller
{
    public function __construct(
        private CalendarEventService $calendarEventService
    ) {}

    /**
     * Get all events for a year.
     *
     * GET /api/calendar/events
     * GET /api/calendar/events?year=2025
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $year = $request->query('year') ? (int) $request->query('year') : null;
            $tenantId = Auth::user()?->tenant_id;

            $events = $this->calendarEventService->getAllEvents($year, $tenantId);

            return $this->success(
                CalendarEventResource::collection($events),
                'Eventos obtenidos exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al obtener eventos: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get a specific event.
     *
     * GET /api/calendar/events/{id}
     */
    public function show(int $id): JsonResponse
    {
        try {
            $event = $this->calendarEventService->findById($id);

            return $this->success(
                new CalendarEventResource($event),
                'Evento obtenido exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Evento no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al obtener evento: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create a new event.
     *
     * POST /api/calendar/events
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:100',
                'description' => 'nullable|string',
                'type' => 'required|in:FESTIVIDAD_NACIONAL,FESTIVIDAD_REGIONAL,FERIADO,EVENTO_ESCOLAR,ADMINISTRATIVO',
                'event_date' => 'required|date',
                'end_date' => 'nullable|date|after_or_equal:event_date',
                'is_recurring' => 'boolean',
                'is_non_working_day' => 'boolean',
                'color' => 'nullable|string|max:7',
                'is_global' => 'boolean',
            ]);

            $user = Auth::user();

            if ($validated['is_global'] ?? false) {
                if ($user->role !== 'SUPERADMIN') {
                    return $this->error('Solo SUPERADMIN puede crear eventos globales', null, 403);
                }
                $validated['tenant_id'] = null;
            } else {
                $validated['tenant_id'] = $user->tenant_id;
            }

            unset($validated['is_global']);

            $event = $this->calendarEventService->create($validated);

            return $this->created(
                new CalendarEventResource($event),
                'Evento creado exitosamente'
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Error de validación', $e->errors(), 422);
        } catch (\Exception $e) {
            return $this->error('Error al crear evento: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update an event.
     *
     * PUT /api/calendar/events/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $event = $this->calendarEventService->findById($id);
            $user = Auth::user();

            if ($event->tenant_id === null && $user->role !== 'SUPERADMIN') {
                return $this->error('Solo SUPERADMIN puede modificar eventos globales', null, 403);
            }

            if ($event->tenant_id !== null && $event->tenant_id !== $user->tenant_id) {
                return $this->error('No tiene permiso para modificar este evento', null, 403);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:100',
                'description' => 'nullable|string',
                'type' => 'sometimes|in:FESTIVIDAD_NACIONAL,FESTIVIDAD_REGIONAL,FERIADO,EVENTO_ESCOLAR,ADMINISTRATIVO',
                'event_date' => 'sometimes|date',
                'end_date' => 'nullable|date|after_or_equal:event_date',
                'is_recurring' => 'boolean',
                'is_non_working_day' => 'boolean',
                'color' => 'nullable|string|max:7',
            ]);

            $event = $this->calendarEventService->update($id, $validated);

            return $this->success(
                new CalendarEventResource($event),
                'Evento actualizado exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Evento no encontrado', null, 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Error de validación', $e->errors(), 422);
        } catch (\Exception $e) {
            return $this->error('Error al actualizar evento: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete an event.
     *
     * DELETE /api/calendar/events/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $event = $this->calendarEventService->findById($id);
            $user = Auth::user();

            if ($event->tenant_id === null && $user->role !== 'SUPERADMIN') {
                return $this->error('Solo SUPERADMIN puede eliminar eventos globales', null, 403);
            }

            if ($event->tenant_id !== null && $event->tenant_id !== $user->tenant_id) {
                return $this->error('No tiene permiso para eliminar este evento', null, 403);
            }

            $this->calendarEventService->delete($id);

            return $this->success(null, 'Evento eliminado exitosamente');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Evento no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al eliminar evento: ' . $e->getMessage(), null, 500);
        }
    }
}
