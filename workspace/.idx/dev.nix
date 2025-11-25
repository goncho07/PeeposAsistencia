{ pkgs, ... }: {
  # Definir canales para paquetes estables
  channels.nixpkgs.branch = "nixos-24.05";
  
  # Paquetes de entorno requeridos
  packages = [
    pkgs.php83
    pkgs.php83.extensions.mysql
    pkgs.composer
    pkgs.mysql84
    pkgs.nodejs_20
  ];
  
  # Variables de entorno para la conexión a la BD
  env = {
    DB_HOST = "127.0.0.1";
    DB_PORT = "3306";
    DB_DATABASE = "peepos_db";
    DB_USERNAME = "peepos_user";
    DB_PASSWORD = "peepos_password";
  };

  # Previews para Frontend y Backend
  previews = [
    {
      id = "web";
      name = "Frontend (Next.js)";
      port = 9003;
      command = "npm --prefix frontend run dev";
    }
    {
      id = "api";
      name = "Backend (Laravel)";
      port = 8000;
      command = "php backend/artisan serve --host=0.0.0.0 --port=8000";
    }
  ];

  # Hooks para gestionar el ciclo de vida del entorno
  hooks = {
    # Inicialización de la base de datos persistente al crear el workspace
    onCreate = ''
      # Crear el directorio para los datos de MySQL si no existe
      mkdir -p $PWD/backend/.data/mysql
      
      # Inicializar la base de datos de MySQL solo si el directorio está vacío
      if [ -z "$(ls -A $PWD/backend/.data/mysql)" ]; then
        echo "Inicializando la base de datos MySQL..."
        mysqld --initialize-insecure --user=$(whoami) --datadir=$PWD/backend/.data/mysql
      else
        echo "La base de datos MySQL ya está inicializada."
      fi
    '';
    
    # Iniciar el servidor MySQL al iniciar el workspace
    onStart = ''
      echo "Iniciando el servidor MySQL en segundo plano..."
      mysqld --datadir=$PWD/backend/.data/mysql --socket=$PWD/backend/.data/mysql/mysql.sock &
      
      # Esperar un momento a que el servidor MySQL inicie
      sleep 5 
      
      echo "Creando base de datos y usuario si no existen..."
      mysql --socket=$PWD/backend/.data/mysql/mysql.sock -u root -e "CREATE DATABASE IF NOT EXISTS ${"peepos_db"};"
      mysql --socket=$PWD/backend/.data/mysql/mysql.sock -u root -e "CREATE USER IF NOT EXISTS '${"peepos_user"}'@'localhost' IDENTIFIED BY '${"peepos_password"}';"
      mysql --socket=$PWD/backend/.data/mysql/mysql.sock -u root -e "GRANT ALL PRIVILEGES ON ${"peepos_db"}.* TO '${"peepos_user"}'@'localhost';"
      mysql --socket=$PWD/backend/.data/mysql/mysql.sock -u root -e "FLUSH PRIVILEGES;"
      
      echo "MySQL listo."
    '';
  };
}
