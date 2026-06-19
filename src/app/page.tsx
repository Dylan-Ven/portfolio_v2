import type { Metadata } from 'next';
import { ProjectsViewer } from '@/components/ProjectsViewer';
import { SkillViewer } from '@/components/SkillViewer'; 
import { AboutViewer } from '@/components/AboutViewer';
import { ContactViewer } from '@/components/ContactViewer';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Portfolio homepage with optional terminal mode.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <main className="flex flex-col items-center w-full">
      <div className='h-[85vh] w-full flex flex-col items-center justify-center'>
        <img src="#" alt="" />
        <h1 className='text-6xl font-bold'>My name is <span className='hover:text-orange-300 duration-200'>Dylan van der Ven</span></h1>
        <p>I am <span className='hover:text-orange-300 duration-300'>20 years old</span> and I currently study <span className='hover:text-orange-300 duration-300'>Software Development</span></p>
      </div>
      <ProjectsViewer />
      <AboutViewer />
      <SkillViewer />
      <ContactViewer />

    </main>
  );
}