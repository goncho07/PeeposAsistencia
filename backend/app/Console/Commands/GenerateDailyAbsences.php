<?php

namespace App\Console\Commands;

use App\Services\AttendanceService;
use Illuminate\Console\Command;

class GenerateDailyAbsences extends Command
{
    protected $signature = 'attendance:generate-absences {date?}';
    protected $description = 'Generar faltas automáticas para ausentes';

    public function __construct(private AttendanceService $attendanceService)
    {
        parent::__construct();
    }

    public function handle()
    {
        $date = $this->argument('date')
            ? \Carbon\Carbon::parse($this->argument('date'))
            : now()->subDay();

        $this->info("Generando ausencias para: {$date->format('Y-m-d')}");

        $this->attendanceService->generateAbsences($date);

        $this->info('✅ Ausencias generadas exitosamente');
    }
}
