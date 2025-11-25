# .idx/dev.nix
{ pkgs, ... }: {
  # IMPORTANTE: Es "channel" en singular, y solo una cadena de texto.
  channel = "stable-24.05";

  # Paquetes del sistema
  packages = [
    pkgs.php83
    pkgs.php83Packages.composer
    pkgs.nodejs_20
    pkgs.docker
    pkgs.mysql84
    pkgs.redis
    pkgs.google-cloud-sdk
  ];

  # Servicios Nativos (Esto asegura la PERSISTENCIA de la Base de Datos)
  services.mysql = {
    enable = true;
    package = pkgs.mysql84;
  };

  services.docker.enable = true;

  # Variables de entorno para conectar Laravel y Next.js
  env = {
    PORT = "9003";
    API_URL = "http://localhost:8000";
    # Configuración para que Laravel encuentre el MySQL nativo
    DB_CONNECTION = "mysql";
    DB_HOST = "127.0.0.1";
    DB_PORT = "3306";
    DB_DATABASE = "peepos";
    DB_USERNAME = "root";
    DB_PASSWORD = ""; # IDX suele dejar root sin clave en local
  };

  # Configuración del IDE y Previsualizaciones
  idx = {
    extensions = [
      "bmewburn.vscode-intelephense-client"
      "bradlc.vscode-tailwindcss"
      "ES7.react-js-snippets"
    ];

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--prefix" "frontend" "--" "--port" "9003" "--hostname" "0.0.0.0"];
          manager = "web";
        };
        api = {
          command = ["php" "artisan" "serve" "--host=0.0.0.0" "--port=8000"];
          cwd = "backend";
          manager = "web";
        };
      };
    };
  };
}