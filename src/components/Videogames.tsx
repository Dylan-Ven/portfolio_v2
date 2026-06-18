"use client";

import { useEffect, useState } from 'react';

const topGames = [
  {
    name: 'Destiny 2',
    currentlyPlaying: true,
    milestones: ['Completed multiple raid clears with friends', 'Built optimized loadout rotations'],
  },
  {
    name: 'Overwatch',
    currentlyPlaying: true,
    milestones: ['Improved aim consistency with daily routine', 'Climbed ranked ladder with duo queue'],
  },
  {
    name: 'Forza Horizon 6',
    currentlyPlaying: true,
    milestones: ['Hit faster aerial consistency', 'Reached a new personal best rank'],
  },
  {
    name: 'Forza Horizon 5',
    currentlyPlaying: false,
    milestones: ['Built long-running survival world', 'Automated farms with Redstone systems'],
  },
  {
    name: 'Minecraft',
    currentlyPlaying: false,
    milestones: ['Expanded champion pool for ranked flexibility', 'Improved map awareness and objective calls'],
  },
];

const funFacts = [
  'I treat game patch notes like release notes for software.',
  'I enjoy building mini side projects inspired by game mechanics.',
  'I like tracking personal performance stats over time.',
];

type DestinyProfile = {
  displayName: string;
  lastPlayed: string | null;
  characterCount: number;
  totalMinutesPlayed: number;
  totalHoursPlayed: number;
  triumphScore: number;
  seasonalRank: number;
  favoriteWeapon: string;
  characters: Array<{
    characterId: string;
    classType: number;
    className: string;
    light: number;
    minutesPlayedTotal: number;
    hoursPlayedTotal: number;
    lastPlayed: string | null;
  }>;
  raidReport: {
    raidsTracked: number;
    raidsCompleted: number;
    completionRate: number;
    recentRaids: Array<{
      characterId: string;
      className: string;
      period: string | null;
      instanceId: string | null;
      durationMinutes: number;
      completed: boolean;
    }>;
  };
};

export function Videogames() {
  const [destiny, setDestiny] = useState<DestinyProfile | null>(null);
  const [destinyLoading, setDestinyLoading] = useState(true);
  const [destinyError, setDestinyError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    async function loadDestiny() {
      try {
        const response = await fetch('/api/destiny/profile');
        const payload = (await response.json()) as
          | { ok: true; destiny: DestinyProfile }
          | { ok: false; error?: string };

        if (disposed) {
          return;
        }

        if (!response.ok || !payload.ok) {
          setDestinyError(payload.ok ? 'Unknown error' : (payload.error ?? 'Unknown error'));
          return;
        }

        setDestiny(payload.destiny);
      } catch {
        if (!disposed) {
          setDestinyError('Could not load Destiny profile.');
        }
      } finally {
        if (!disposed) {
          setDestinyLoading(false);
        }
      }
    }

    loadDestiny();

    return () => {
      disposed = true;
    };
  }, []);

  const lastPlayedText = destiny?.lastPlayed
    ? new Date(destiny.lastPlayed).toLocaleString()
    : 'Unknown';

  return (
    <section id="videogames" className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Videogames</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-50 md:text-4xl">Top 5 games + milestones</h2>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-slate-50">Destiny 2 live profile</h3>

        {destinyLoading ? <p className="mt-2 text-sm text-slate-300">Loading...</p> : null}
        {destinyError ? <p className="mt-2 text-sm text-rose-300">{destinyError}</p> : null}

        {!destinyLoading && !destinyError && destiny ? (
          <div className="mt-3 grid gap-2 text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            <p className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2">
              Guardian: <span className="font-semibold">{destiny.displayName}</span>
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2">
              Characters: <span className="font-semibold">{destiny.characterCount}</span>
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2">
              Total time: <span className="font-semibold">{destiny.totalHoursPlayed}h</span>
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2">
              Last played: <span className="font-semibold">{lastPlayedText}</span>
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2">
              Triumphs: <span className="font-semibold">{destiny.triumphScore}</span>
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2">
              Season Rank: <span className="font-semibold">{destiny.seasonalRank}</span>
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 lg:col-span-2">
              Favorite Weapon: <span className="font-semibold">{destiny.favoriteWeapon}</span>
            </p>
          </div>
        ) : null}

        {!destinyLoading && !destinyError && destiny ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
              <h4 className="text-sm font-semibold text-cyan-200">Raid report</h4>
              <div className="mt-2 space-y-1 text-sm text-slate-200">
                <p>Tracked runs: <span className="font-semibold">{destiny.raidReport.raidsTracked}</span></p>
                <p>Completed: <span className="font-semibold">{destiny.raidReport.raidsCompleted}</span></p>
                <p>Completion rate: <span className="font-semibold">{destiny.raidReport.completionRate}%</span></p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
              <h4 className="text-sm font-semibold text-cyan-200">Your characters</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {destiny.characters.map((character) => (
                  <li key={character.characterId} className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{character.className}</span>
                      <span>Light {character.light}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300">Playtime: {character.hoursPlayedTotal}h</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topGames.map((game) => (
          <article key={game.name} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-50">{game.name}</h3>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  game.currentlyPlaying ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {game.currentlyPlaying ? 'Currently playing' : 'Occasionally'}
              </span>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {game.milestones.map((milestone) => (
                <li key={`${game.name}-${milestone}`} className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2">
                  {milestone}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-slate-50">More fun stuff to add</h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-200">
          {funFacts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
