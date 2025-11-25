#!/bin/bash

# ==== FASE 2: INICIALIZACIÓN DEL ECOSISTEMA ====

set -e # Terminar el script si un comando falla

echo "--- Iniciando el script de configuración del proyecto Peepos ---"

# 1. Crear proyecto Frontend (Next.js)
echo "PASO 1/5: Creando aplicación Frontend (Next.js)..."
npx create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir --import-alias="@/*" --use-npm
echo "Frontend creado en la carpeta 'frontend'."

# 2. Crear proyecto Backend (Laravel)
echo "PASO 2/5: Creando aplicación Backend (Laravel)..."
composer create-project laravel/laravel backend
echo "Backend creado en la carpeta 'backend'."

# 3. Instalar dependencias Frontend
echo "PASO 3/5: Instalando dependencias de Frontend..."
npm --prefix frontend install framer-motion lucide-react tailwind-scrollbar-hide clsx tailwind-merge @tanstack/react-query axios
echo "Dependencias de Frontend instaladas."

# 4. Instalar dependencias Backend
echo "PASO 4/5: Instalando dependencias de Backend..."
composer -d backend require laravel/sanctum
composer -d backend require google-gemini-php/laravel
echo "Dependencias de Backend instaladas."

# 5. Setup y configuración de la Base de Datos
echo "PASO 5/5: Configurando el entorno de Laravel para la base de datos..."
# Copiar el .env de ejemplo y configurarlo para usar MySQL
cp backend/.env.example backend/.env
sed -i 's/DB_CONNECTION=sqlite/DB_CONNECTION=mysql/' backend/.env
sed -i 's/DB_HOST=127.0.0.1/DB_HOST=127.0.0.1/' backend/.env
sed -i 's/DB_PORT=3306/DB_PORT=3306/' backend/.env
sed -i 's/DB_DATABASE=laravel/DB_DATABASE=peepos_db/' backend/.env
sed -i 's/DB_USERNAME=root/DB_USERNAME=peepos_user/' backend/.env
sed -i 's/DB_PASSWORD=/DB_PASSWORD=peepos_password/' backend/.env

# Generar la clave de la aplicación Laravel
php backend/artisan key:generate

echo "Configuración de .env para Laravel completada."

echo "--- ¡Configuración del proyecto Peepos finalizada con éxito! ---"
echo "Para continuar, reconstruye el entorno (Rebuild) y luego ejecuta el script con 'bash setup.sh'"