import type { Metadata } from 'next';
import { ProjectsViewer } from '@/components/ProjectsViewer';
 

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
      <div className='w-10/12'>
        <div className='flex flex-row justify-evenly gap-5 '>
          <div className='w-2/3'>
            <h1></h1>
            <p>
              I'm a passionate fullstack developer and designer with a love for creating immersive digital experiences. I specialize in building modern web applications with cutting-edge technologies and creative visual effects.

              From pixel-perfect UI designs to complex backend systems, I bridge the gap between design and development. I'm particularly interested in backend systems, problem solving and creating unique, engaging and interactive user experiences.
            </p>
          </div>
          <div className='w-1/3'>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquid esse nihil consequatur voluptates? Expedita voluptatem hic a est consequatur, distinctio consequuntur vero quibusdam odit, necessitatibus cupiditate culpa magni velit tempore!</p>
            <img src="#" alt="" />
            <div /* Lanyard Status */></div>
          </div>
        </div>
        <div /* skills */>
          <h1>Skills</h1>
        </div>
      </div>
      <div /* Contact */>
        
      </div>
    </main>
  );
}