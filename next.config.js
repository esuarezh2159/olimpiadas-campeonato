/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de imágenes
  images: {
    unoptimized: true, // Para hosting compartido
  },

  // Configuración de compilación
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // Desactivar type checking en build para producción
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Configuración de API
  rewrites: async () => {
    return [];
  },

  // Variables de entorno disponibles en el cliente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://olimpuades2026.com',
  },
};

module.exports = nextConfig;
