'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useStorageSync() {
    const router = useRouter();

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token' && e.newValue === null) {
                const userStr = localStorage.getItem('user');
                let tenantSlug = null;

                try {
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        tenantSlug = user.tenant?.slug;
                    }
                } catch {
                    // Ignore
                }

                localStorage.removeItem('token');
                localStorage.removeItem('user');
                document.cookie = 'token=; path=/; max-age=0';
                document.cookie = 'user=; path=/; max-age=0';

                const loginPath = tenantSlug ? `/${tenantSlug}/login` : '/';
                router.push(loginPath);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [router]);
}
