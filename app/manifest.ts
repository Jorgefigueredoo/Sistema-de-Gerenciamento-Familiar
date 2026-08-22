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
    // Papel creme: é a cor real do app, então a splash não pisca branco.
    background_color: '#fdf6ec',
    theme_color: '#fdf6ec',
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
      { name: 'Agenda', short_name: 'Agenda', url: '/' },
      { name: 'Delegado', short_name: 'Delegado', url: '/delegado' },
    ],
  };
}
