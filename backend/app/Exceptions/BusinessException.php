<?php

namespace App\Exceptions;

use Exception;

class BusinessException extends Exception
{
    protected $code = 422;

    public function render($request)
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
        ], $this->code);
    }
}
