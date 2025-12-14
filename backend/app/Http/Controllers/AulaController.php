<?php

namespace App\Http\Controllers;

use App\Models\Aula;
use App\Http\Resources\AulaResource;

class AulaController extends Controller
{
    public function index()
    {
        $aulas = Aula::with('docente')
            ->withCount('estudiantes')
            ->ordenado()
            ->get();

        return AulaResource::collection($aulas);
    }

    public function show(Aula $aula)
    {
        $aula->load('docente')->loadCount('estudiantes');

        return new AulaResource($aula);
    }
}
