<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;

class ScannerControllerTest extends TestCase
{
    
    public function test_scan_entry_success()
    {
        /** @var \App\Models\User $user */
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/scanner/entry', [
            'qr_code' => 'RP0003216D2CF',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'response',
            ]);
    }
}
