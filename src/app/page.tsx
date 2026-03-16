import type { Metadata } from 'next';
import Home from '@/sections/Home';

const SITE_URL = 'https://www.dylanvdven.xyz';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Explore projects, skills, and experience of Dylan Van Der Ven, a full-stack developer and UI/UX designer.',
  alternates: {
    canonical: '/',
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Dylan Van Der Ven',
  url: SITE_URL,
  jobTitle: 'Full-Stack Developer',
  knowsAbout: ['Next.js', 'TypeScript', 'React', 'UI/UX Design', 'JavaScript', 'Three.js'],
  sameAs: [
    'https://github.com/Dylan-Ven',
    'https://www.linkedin.com/in/dylan-van-der-ven-766a94240/',
    'https://www.instagram.com/ven.dylan/',
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Home />
    </>
  );
}