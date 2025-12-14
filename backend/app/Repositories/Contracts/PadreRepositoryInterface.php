<?php

namespace App\Repositories\Contracts;

use App\Models\Padre;
use Illuminate\Support\Collection;

interface PadreRepositoryInterface
{
    public function getAll(?string $search = null): Collection;
    public function findById(int $id): Padre;
    public function create(array $data): Padre;
    public function update(int $id, array $data): Padre;
    public function delete(int $id): bool;
}
