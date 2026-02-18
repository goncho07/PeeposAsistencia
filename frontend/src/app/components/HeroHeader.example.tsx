/**
 * HeroHeader - Ejemplo de Uso
 *
 * Este componente crea un header hero moderno con gradiente, icono y efectos decorativos.
 */

import { HeroHeader } from './ui/HeroHeader';
import { Home, Users, ScanLine, FileText, Settings } from 'lucide-react';

// ============================================
// EJEMPLO 1: Dashboard/Inicio
// ============================================
export function DashboardExample() {
  return (
    <HeroHeader
      title="Dashboard"
      subtitle="Bienvenido al panel de control. Aquí encontrarás un resumen de toda la actividad."
      icon={Home}
      gradient="bg-gradient-to-br from-blue-500 to-blue-700"
    />
  );
}

// ============================================
// EJEMPLO 2: Usuarios
// ============================================
export function UsersExample() {
  return (
    <HeroHeader
      title="Usuarios"
      subtitle="Gestiona estudiantes, profesores y apoderados desde un solo lugar."
      icon={Users}
      gradient="bg-gradient-to-br from-purple-500 to-purple-700"
    />
  );
}

// ============================================
// EJEMPLO 3: Escáner
// ============================================
export function ScannerExample() {
  return (
    <HeroHeader
      title="Escáner de Asistencia"
      subtitle="Escanea códigos QR para registrar la asistencia de forma rápida y precisa."
      icon={ScanLine}
      gradient="bg-gradient-to-br from-green-500 to-green-700"
    />
  );
}

// ============================================
// EJEMPLO 4: Reportes
// ============================================
export function ReportsExample() {
  return (
    <HeroHeader
      title="Reportes"
      subtitle="Genera y exporta reportes detallados de asistencia y estadísticas."
      icon={FileText}
      gradient="bg-gradient-to-br from-orange-500 to-orange-700"
    />
  );
}

// ============================================
// EJEMPLO 5: Configuración
// ============================================
export function SettingsExample() {
  return (
    <HeroHeader
      title="Configuración"
      subtitle="Personaliza el sistema según las necesidades de tu institución."
      icon={Settings}
      gradient="bg-gradient-to-br from-gray-600 to-gray-800"
    />
  );
}

// ============================================
// EJEMPLO 6: Con icono decorativo diferente
// ============================================
export function CustomDecorativeExample() {
  return (
    <HeroHeader
      title="Dashboard Avanzado"
      subtitle="Vista personalizada con icono decorativo diferente al principal."
      icon={Home}
      decorativeIcon={Users}
      gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
    />
  );
}

// ============================================
// GRADIENTES DISPONIBLES
// ============================================
/*
  Azul:    bg-gradient-to-br from-blue-500 to-blue-700
  Púrpura: bg-gradient-to-br from-purple-500 to-purple-700
  Verde:   bg-gradient-to-br from-green-500 to-green-700
  Naranja: bg-gradient-to-br from-orange-500 to-orange-700
  Rojo:    bg-gradient-to-br from-red-500 to-red-700
  Cyan:    bg-gradient-to-br from-cyan-500 to-cyan-700
  Rosa:    bg-gradient-to-br from-pink-500 to-pink-700
  Gris:    bg-gradient-to-br from-gray-600 to-gray-800
*/
