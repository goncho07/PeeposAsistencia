# .idx/dev.nix - Configuración Final para Cloud Run y Persistencia
{ pkgs, ... }: 
  let
    unstable = import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixos-unstable.tar.gz") { };
  in
{
  # Usamos el canal estable para evitar errores de construcción
  channel = "stable-24.05";

  # Paquetes necesarios para tu Stack
  packages = [
    pkgs.php83
    pkgs.php83Packages.composer
    pkgs.nodejs_20
    pkgs.docker
    pkgs.mysql84       # Base de datos estable
    pkgs.redis         # Para caché y colas
    pkgs.google-cloud-sdk # <--- ¡ESTO AGREGA SOPORTE PARA CLOUD
    unstable.uv
    pkgs.firebase-tools
  ];

  # Servicios Nativos (Base de datos persistente)
  services.mysql = {
    enable = true;
    package = pkgs.mysql84;
  };
  
  # Habilitar Docker (Necesario para crear los contenedores que irán a Cloud Run)
  services.docker.enable = true;

  # Variables de entorno globales
  env = {
    PORT = "9003";
    API_URL = "http://localhost:8000";
    DB_CONNECTION = "mysql";
    DB_HOST = "127.0.0.1";
    DB_PORT = "3306";
    DB_DATABASE = "peepos";
    DB_USERNAME = "root";
    DB_PASSWORD = "";
  };

  # Configuración del Editor y Previsualizaciones
  idx = {
    extensions = [
      "bmewburn.vscode-intelephense-client"
      "bradlc.vscode-tailwindcss"
      "ES7.react-js-snippets"
    ];

    previews = {
      enable = true;
      previews = {
        # Frontend (Next.js)
        web = {
          command = ["npm" "run" "dev" "--prefix" "frontend" "--" "--port" "9003" "--hostname" "0.0.0.0"];
          manager = "web";
        };
        # Backend (Laravel)
        api = {
          command = ["php" "artisan" "serve" "--host=0.0.0.0" "--port=8000"];
          cwd = "backend";
          manager = "web";
        };
      };
    };
  };
}