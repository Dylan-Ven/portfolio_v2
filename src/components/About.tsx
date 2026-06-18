"use client";

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type LanyardPayload = {
  success: boolean;
  data?: {
    discord_status?: string;
    listening_to_spotify?: boolean;
    spotify?: {
      song?: string;
      artist?: string;
    };
    activities?: Array<{ name?: string; type?: number }>;
  };
};

function HighlightWord({ children }: { children: string }) {
  return (
    <span className="mx-1 inline-block cursor-default rounded-md border border-transparent bg-slate-800/70 px-2 py-0.5 text-cyan-200 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-500/20">
      {children}
    </span>
  );
}

export function About() {
  const discordId = process.env.NEXT_PUBLIC_LANYARD_DISCORD_ID;
  const [statusText, setStatusText] = useState('Lanyard activity is loading...');

  useEffect(() => {
    if (!discordId) {
      setStatusText('Set NEXT_PUBLIC_LANYARD_DISCORD_ID to show live Discord activity.');
      return;
    }

    let isCancelled = false;

    async function loadLanyard() {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch Lanyard status');
        }

        const payload = (await response.json()) as LanyardPayload;
        if (isCancelled || !payload.success || !payload.data) {
          return;
        }

        const spotify = payload.data.spotify;
        const activeApp = payload.data.activities?.find((activity) => activity.type === 0 && activity.name)?.name;
        const baseStatus = payload.data.discord_status ?? 'offline';

        if (payload.data.listening_to_spotify && spotify?.song && spotify.artist) {
          setStatusText(`${baseStatus} · Listening to ${spotify.song} — ${spotify.artist}`);
          return;
        }

        if (activeApp) {
          setStatusText(`${baseStatus} · Active in ${activeApp}`);
          return;
        }

        setStatusText(`${baseStatus} · No active rich presence`);
      } catch {
        if (!isCancelled) {
          setStatusText('Could not load Lanyard activity right now.');
        }
      }
    }

    loadLanyard();
    const intervalId = window.setInterval(loadLanyard, 45000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [discordId]);

  const personalityWords = useMemo(
    () => ['curious', 'competitive', 'detail-oriented', 'collaborative', 'builder'],
    []
  );

  return (
    <section id="about" className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-[1.25fr_0.95fr] md:px-6">
      <article className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">About</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-50 md:text-4xl">Who I am outside of the README</h2>

        <p className="mt-4 leading-relaxed text-slate-200">
          I am Dylan, a full-stack developer from the Netherlands who enjoys shipping real products and
          learning by building. I love turning rough ideas into something you can click, test, and improve.
        </p>

        <p className="mt-4 leading-relaxed text-slate-200">
          My style is
          {personalityWords.map((word) => (
            <HighlightWord key={word}>{word}</HighlightWord>
          ))}
          with a strong focus on clean UX, useful feedback loops, and long-term maintainability.
        </p>
      </article>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
          <div className="relative h-72 w-full">
            <Image
              src="/images/Portfolio2.png"
              alt="Dylan van der Ven"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 35vw"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Lanyard activity</p>
          <p className="mt-2 text-sm text-slate-200">{statusText}</p>
        </div>
      </aside>
    </section>
  );
}
