"use client"
import {useLanyardWS } from 'use-lanyard';

const DISCORD_ID = '828859067618558012';

export function AboutViewer() {
const presence = useLanyardWS(DISCORD_ID);

if (!presence) return <div>offline <span className="text-gray-500">⦿</span></div>;

const { discord_status, spotify, listening_to_spotify } = presence;

const statusColors: Record<string, string> ={
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    dnd: 'bg-red-500',
    offline: 'bg-gray-500',
};

return (
    <section id="About" className='flex flex-row justify-evenly gap-5 w-10/12'>
        <div className='w-2/3'>
            <h2>I'm Dylan van der Ven</h2>
            <p>
                I'm a passionate fullstack developer and designer with a love for creating immersive digital experiences. I specialize in building modern web applications with cutting-edge technologies and creative visual effects.
                From pixel-perfect UI designs to complex backend systems, I bridge the gap between design and development. I'm particularly interested in backend systems, problem solving and creating unique, engaging and interactive user experiences.
            </p>
        </div>
        <div className='w-1/3 border border-gray-700 rounded-lg p-4 flex flex-col items-center gap-3'>
           <img src="#" alt="" />
           <div>
                <p>(Lanyard Status)</p>
           </div>
        </div>
    </section>
);
}
