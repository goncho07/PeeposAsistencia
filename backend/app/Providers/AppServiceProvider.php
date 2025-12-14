<?php

namespace App\Providers;

use App\Models\User;
use App\Repositories\Contracts\EstudianteRepositoryInterface;
use App\Repositories\Contracts\DocenteRepositoryInterface;
use App\Repositories\Contracts\PadreRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\EloquentEstudianteRepository;
use App\Repositories\Eloquent\EloquentDocenteRepository;
use App\Repositories\Eloquent\EloquentPadreRepository;
use App\Repositories\Eloquent\EloquentUserRepository;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(EstudianteRepositoryInterface::class, EloquentEstudianteRepository::class);
        $this->app->bind(DocenteRepositoryInterface::class, EloquentDocenteRepository::class);
        $this->app->bind(PadreRepositoryInterface::class, EloquentPadreRepository::class);
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->configureGates();
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perHour(3)->by($request->ip());
        });
    }

    protected function configureGates(): void
    {
        Gate::define('isDirector', function (User $user) {
            return $user->isDirector();
        });
    }
}
