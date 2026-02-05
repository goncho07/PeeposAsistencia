<?php

namespace App\Services;

use App\Models\Tenant;

class QRCodeService
{
    /**
     * Generate a QR code hash for attendance scanning.
     *
     * This method generates a unique 8-character alphanumeric code using CRC32 hash
     * of the document number combined with the current timestamp.
     *
     * @param string $documentNumber The person's document number (DNI, etc.)
     */
    public function generate(string $documentNumber): string
    {
        return strtoupper(substr(hash('crc32', $documentNumber . time()), 0, 8));
    }
}
