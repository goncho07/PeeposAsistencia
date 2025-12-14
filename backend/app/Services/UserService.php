<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\EstudianteRepositoryInterface;
use App\Repositories\Contracts\DocenteRepositoryInterface;
use App\Repositories\Contracts\PadreRepositoryInterface;
use App\Http\Resources\UserTypeResource;
use App\Exceptions\BusinessException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function __construct(
        private UserRepositoryInterface $userRepo,
        private EstudianteRepositoryInterface $estudianteRepo,
        private DocenteRepositoryInterface $docenteRepo,
        private PadreRepositoryInterface $padreRepo,
    ) {}

    public function createAdmin(array $data)
    {
        $data['password'] = Hash::make($data['password']);
        $data['status'] = 'ACTIVO';

        return $this->userRepo->create($data);
    }

    public function createStudent(array $data)
    {
        $this->validateAulaCapacity($data['aula_id']);

        $data['qr_code'] = $this->generateQRCode($data['document_number']);

        return $this->estudianteRepo->create($data);
    }

    public function createTeacher(array $data)
    {
        return $this->docenteRepo->create($data);
    }

    public function createParent(array $data)
    {
        return $this->padreRepo->create($data);
    }

    public function updateUser(string $type, int $id, array $data)
    {
        return DB::transaction(function () use ($type, $id, $data) {
            $user = $this->findUserByType($type, $id);

            if ($type === 'student' && isset($data['aula_id']) && $data['aula_id'] !== $user->aula_id) {
                $this->validateAulaCapacity($data['aula_id']);
            }

            $updated = match ($type) {
                'admin'   => $this->userRepo->update($id, $data),
                'student' => $this->estudianteRepo->update($id, $data),
                'teacher' => $this->docenteRepo->update($id, $data),
                'parent'  => $this->padreRepo->update($id, $data),
                default   => throw new \InvalidArgumentException("Tipo de usuario inválido: {$type}"),
            };

            return new UserTypeResource($updated, $type);
        });
    }

    public function deleteUser(string $type, int $id): void
    {
        DB::transaction(function () use ($type, $id) {
            $user = $this->findUserByType($type, $id);

            if ($type === 'teacher' && $user->aulas()->exists()) {
                throw new BusinessException('No se puede eliminar el docente porque tiene aulas asignadas');
            }

            if ($type === 'parent' && $user->estudiantes()->exists()) {
                throw new BusinessException('No se puede eliminar el apoderado porque tiene estudiantes asociados');
            }

            match ($type) {
                'admin'   => $this->userRepo->delete($id),
                'student' => $this->estudianteRepo->delete($id),
                'teacher' => $this->docenteRepo->delete($id),
                'parent'  => $this->padreRepo->delete($id),
                default   => throw new \InvalidArgumentException("Tipo de usuario inválido: {$type}"),
            };
        });
    }

    public function getAllUsers(?string $search = null): Collection
    {
        $admins   = $this->userRepo->getAll($search)->map(fn($u) => new UserTypeResource($u, 'admin'));
        $students = $this->estudianteRepo->getAll($search)->map(fn($u) => new UserTypeResource($u, 'student'));
        $teachers = $this->docenteRepo->getAll($search)->map(fn($u) => new UserTypeResource($u, 'teacher'));
        $parents  = $this->padreRepo->getAll($search)->map(fn($u) => new UserTypeResource($u, 'parent'));

        return collect()
            ->merge($admins)
            ->merge($students)
            ->merge($teachers)
            ->merge($parents);
    }

    public function findUserByType(string $type, int $id)
    {
        return match ($type) {
            'admin' => $this->userRepo->findById($id),
            'student' => $this->estudianteRepo->findById($id),
            'teacher' => $this->docenteRepo->findById($id),
            'parent' => $this->padreRepo->findById($id),
            default => throw new \InvalidArgumentException("Tipo de usuario inválido: {$type}"),
        };
    }

    private function formatUserCollection(Collection $collection, string $type): Collection
    {
        return $collection->map(fn($user) => [
            'type' => $type,
            'data' => $user,
        ]);
    }
    
    private function validateAulaCapacity(int $aulaId): void
    {
        $aula = \App\Models\Aula::find($aulaId);

        if (!$aula) {
            throw new BusinessException('El aula no existe');
        }

        if ($aula->esta_completa) {
            throw new BusinessException('El aula seleccionada está completa');
        }
    }

    private function generateQRCode(string $dni): string
    {
        $hash = strtoupper(substr(hash('crc32', $dni), 0, 8));
        return 'RP000' . $hash;
    }
}