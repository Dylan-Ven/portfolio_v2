import type { Metadata } from 'next';
import Home from '@/sections/Home';

export const metadata: Metadata = {
  title: 'Terminal Mode',
  description: 'Interactive terminal portfolio mode for commands, navigation, and mini-games.',
  alternates: {
    canonical: '/terminal',
  },
};

export default function TerminalPage() {
  return <Home />;
}
