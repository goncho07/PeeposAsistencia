<?php

namespace App\Http\Controllers;

use App\Services\SettingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function __construct(private SettingService $settingService) {}

    public function index(): JsonResponse
    {
        $settings = $this->settingService->getAllSettings();
        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        $this->settingService->updateSettings($request->settings);

        return response()->json([
            'message' => 'Configuración actualizada exitosamente',
        ]);
    }
}
