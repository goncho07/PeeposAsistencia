// Lista de tenants para generación estática
// Actualiza esta lista cuando agregues nuevos tenants
export const STATIC_TENANTS = [
    'iee-6049-ricardo-palma',
    'ie-francisco-bolognesi-cervantes',
] as const;

// Función para generateStaticParams en páginas dinámicas [tenant]
export function generateTenantStaticParams() {
    return STATIC_TENANTS.map(tenant => ({ tenant }));
}
