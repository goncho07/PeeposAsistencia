<?php

if (! function_exists('client_ip')) {
    
    function client_ip(): ?string
    {
        $forwarded = request()->header('X-Forwarded-For');
        if ($forwarded) {
            $ips = explode(',', $forwarded);
            return trim($ips[0]);
        }

        return request()->ip();
    }
}
