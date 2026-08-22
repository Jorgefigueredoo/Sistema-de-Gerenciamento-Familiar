import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Agenda da Família',
    short_name: 'Agenda',
    description: 'A rotina da casa, do trabalho e da família em um lugar só.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f9f8fb',
    theme_color: '#ffffff',
    lang: 'pt-BR',
    categories: ['productivity', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      { name: 'Nova tarefa', short_name: 'Nova', url: '/nova-tarefa' },
      { name: 'Essa semana', short_name: 'Semana', url: '/semana' },
      { name: 'Delegado', short_name: 'Delegado', url: '/delegado' },
    ],
  };
}
