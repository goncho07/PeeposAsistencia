<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Estudiante;
use App\Models\Docente;
use Illuminate\Support\Facades\Log;
use Spatie\Browsershot\Browsershot;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class CarnetController extends Controller
{
    public function generate(Request $request)
    {        
        set_time_limit(300);
        ini_set('memory_limit', '512M');

        $request->validate([
            'type' => 'required|in:all,student,teacher',
            'level' => 'nullable|string',
            'grade' => 'nullable|string',
            'section' => 'nullable|string',
        ]);

        try {
            $escudoBase64 = base64_encode(file_get_contents(public_path('images/escudo.png')));
            $fondoBase64  = base64_encode(file_get_contents(public_path('images/fondo.png')));
            $fontBase64   = base64_encode(file_get_contents(public_path('fonts/ChauPhilomeneOne-Regular.ttf')));
            
            $users = collect();

            $renderer = new ImageRenderer(
                new RendererStyle(160, 0),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);

            if (in_array($request->type, ['all', 'student'])) {
                $studentsQuery = Estudiante::with(['aula.docente']);

                if ($request->level && $request->level !== 'all' && $request->type !== 'all') {
                    $studentsQuery->whereHas('aula', function ($q) use ($request) {
                        $q->where('nivel', $request->level);

                        if ($request->grade && $request->grade !== 'all') {
                            $q->where('grado', $request->grade);
                        }

                        if ($request->section && $request->section !== 'all') { 
                            $q->where('seccion', $request->section);
                        }
                    });
                }

                $students = $studentsQuery->get();

                foreach ($students as $estudiante) {
                    try {
                        $pngData = $writer->writeString((string) $estudiante->qr_code);
                        $estudiante->qr_base64 = base64_encode($pngData);
                        $estudiante->user_type = 'student';
                    } catch (\Throwable $qrError) {
                        Log::error("❌ Error generando QR para estudiante ID={$estudiante->id}", [
                            'message' => $qrError->getMessage(),
                        ]);
                        $estudiante->qr_base64 = '';
                    }
                }

                $users = $users->merge($students);
            }

            if (in_array($request->type, ['all', 'teacher'])) {
                $teachersQuery = Docente::query();

                if ($request->level && $request->level !== 'all' && $request->type !== 'all') {
                    $teachersQuery->where('nivel', $request->level);
                }

                $teachers = $teachersQuery->get();

                foreach ($teachers as $docente) {
                    try {
                        $pngData = $writer->writeString((string) $docente->qr_code);
                        $docente->qr_base64 = base64_encode($pngData);
                        $docente->user_type = 'teacher';
                    } catch (\Throwable $qrError) {
                        Log::error("❌ Error generando QR para docente ID={$docente->id}", [
                            'message' => $qrError->getMessage(),
                        ]);
                        $docente->qr_base64 = '';
                    }
                }

                $users = $users->merge($teachers);
            }

            if ($users->isEmpty()) {
                return response()->json([
                    'message' => 'No se encontraron usuarios con los filtros especificados'
                ], 404);
            }

            $html = view('carnets.template', [
                'users'        => $users,
                'escudoBase64' => $escudoBase64,
                'fondoBase64'  => $fondoBase64,
                'fontBase64'   => $fontBase64,
            ])->render();

            $browsershot = Browsershot::html($html)
                ->setOption('args', ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'])
                ->setChromePath(env('PUPPETEER_EXECUTABLE_PATH', '/usr/bin/chromium'))
                ->timeout(120)
                ->showBackground()
                ->format('A4');

            $pdfBinary = $browsershot->pdf();

            $filename = 'carnets_' . now()->format('Y-m-d_His') . '.pdf';

            return response()->streamDownload(function () use ($pdfBinary) {
                echo $pdfBinary;
            }, $filename);
        } catch (\Throwable $e) {
            Log::error('❌ Error general generando carnets', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Error al generar carnets',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
