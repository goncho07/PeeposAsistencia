'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/auth';

export function useTokenValidation() {
    const router = useRouter();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                return;
            }

            try {
                await authService.getUser();
            } catch (error: any) {
                //
            }
        };

        intervalRef.current = setInterval(validateToken, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [router]);
}
