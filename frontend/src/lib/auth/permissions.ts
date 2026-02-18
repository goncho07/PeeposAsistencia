import { Home, Users, QrCode, AlertTriangle, FileText } from 'lucide-react';

export type UserRole =
  | 'SUPERADMIN'
  | 'DIRECTOR'
  | 'SUBDIRECTOR'
  | 'SECRETARIO'
  | 'COORDINADOR'
  | 'AUXILIAR'
  | 'DOCENTE'
  | 'ESCANER';

const ALL_MENU_ITEMS = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: Users, label: 'Usuarios', href: '/usuarios' },
  { icon: QrCode, label: 'Escáner', href: '/escaner' },
  { icon: AlertTriangle, label: 'Incidencias', href: '/incidencias' },
  { icon: FileText, label: 'Reportes', href: '/reportes' },
] as const;

export type MenuItem = (typeof ALL_MENU_ITEMS)[number];

const ROLE_ROUTES: Record<UserRole, string[]> = {
  SUPERADMIN: ['*'],
  DIRECTOR: ['*'],
  SUBDIRECTOR: ['*'],
  SECRETARIO: ['/dashboard', '/usuarios', '/escaner', '/incidencias', '/reportes', '/perfil'],
  COORDINADOR: ['/dashboard', '/usuarios', '/escaner', '/incidencias', '/reportes', '/perfil'],
  AUXILIAR: ['/dashboard', '/escaner', '/incidencias', '/perfil'],
  DOCENTE: ['/dashboard', '/incidencias', '/perfil'],
  ESCANER: ['/dashboard', '/escaner', '/perfil'],
};

const DEFAULT_ROUTES: Partial<Record<UserRole, string>> = {
  ESCANER: '/escaner',
};

export function hasAccess(role: string | undefined, path: string): boolean {
  if (!role) return false;

  const routes = ROLE_ROUTES[role as UserRole];
  if (!routes) return false;
  if (routes.includes('*')) return true;

  const segments = path.split('/').filter(Boolean);
  const routePath = segments.length >= 2 ? `/${segments[segments.length - 1]}` : path;

  return routes.includes(routePath);
}

export function getDefaultRoute(role: string): string {
  return DEFAULT_ROUTES[role as UserRole] || '/dashboard';
}

export function getMenuItems(role: string | undefined): MenuItem[] {
  if (!role) return [];

  const routes = ROLE_ROUTES[role as UserRole];
  if (!routes) return [];
  if (routes.includes('*')) return [...ALL_MENU_ITEMS];

  return ALL_MENU_ITEMS.filter((item) => routes.includes(item.href));
}
