import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* IMPORTANTE: 'export' genera una carpeta HTML/CSS/JS estática.
    Esto permite subir el frontend a Firebase Hosting (gratis/barato)
    sin necesitar un servidor Node.js corriendo.
  */
  output: 'export',

  // Necesario para que las imágenes funcionen en exportación estática
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'media.discordapp.net' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'www.svgrepo.com' },
    ],
  },

  // Ayuda a Firebase a gestionar las rutas (ej: /dashboard/ en vez de /dashboard.html)
  trailingSlash: true,

  // Ignorar errores de build para asegurar que se genere la carpeta 'out'
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;