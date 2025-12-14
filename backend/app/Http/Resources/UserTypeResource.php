<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserTypeResource extends JsonResource
{
    protected string $userType;

    public function __construct($resource, string $type)
    {
        parent::__construct($resource);
        $this->userType = $type;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        $resource = match ($this->userType) {
            'admin' => new UserResource($this->resource),
            'student' => new EstudianteResource($this->resource),
            'teacher' => new DocenteResource($this->resource),
            'parent' => new PadreResource($this->resource),
            default => $this->resource,
        };

        $data = ($resource instanceof JsonResource)
            ? $resource->toArray($request)
            : (is_array($resource) ? $resource : (array) $resource);

        return [
            'type' => $this->userType,
            'data' => $data,
        ];
    }
}
