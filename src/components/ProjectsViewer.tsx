"use client";

import { useMemo, useState } from 'react';
import { Projects } from '@/data/portfolio';

type Category = 'major' | 'minor' | 'schoolwork';

interface PortfolioProject {
  id: number;
  name: string;
  description: string;
  tech: string[];
  link: string;
  webapp: string;
  status: string;
  image: string;
}

function getGroups() {
  const major = (Projects.find((group) => 'Major' in group) as { Major?: PortfolioProject[] } | undefined)?.Major ?? [];
  const minor = (Projects.find((group) => 'Minor' in group) as { Minor?: PortfolioProject[] } | undefined)?.Minor ?? [];
  const schoolwork =
    (Projects.find((group) => 'Schoolwork' in group) as
      | { Schoolwork?: Array<Record<string, PortfolioProject[]>> }
      | undefined)?.Schoolwork ?? [];

  const schoolworkByYear = Object.fromEntries(
    schoolwork.flatMap((yearObject) => Object.entries(yearObject)),
  ) as Record<string, PortfolioProject[]>;

  return { major, minor, schoolworkByYear };
}

export function ProjectsViewer() {
  const { major, minor, schoolworkByYear } = useMemo(() => getGroups(), []);
  const [category, setCategory] = useState<Category>('major');

  const yearKeys = useMemo(() => Object.keys(schoolworkByYear), [schoolworkByYear]);
  const [selectedYear, setSelectedYear] = useState<string>(yearKeys[0] ?? '');

  const visibleProjects = useMemo(() => {
    if (category === 'major') {
      return major;
    }
    if (category === 'minor') {
      return minor;
    }
    return selectedYear ? schoolworkByYear[selectedYear] ?? [] : [];
  }, [category, major, minor, schoolworkByYear, selectedYear]);

  return (
    <section id="projects" className="mx-auto w-10/12 py-10">
      <div id="projects-filter" className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('major')}
          className={`rounded-md border px-3 py-1.5 text-sm transition ${
            category === 'major'
              ? 'border-orange-400 bg-orange-400 text-slate-950'
              : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
          }`}
        >
          Major
        </button>
        <button
          type="button"
          onClick={() => setCategory('minor')}
          className={`rounded-md border px-3 py-1.5 text-sm transition ${
            category === 'minor'
              ? 'border-orange-400 bg-orange-400 text-slate-950'
              : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
          }`}
        >
          Minor
        </button>
        <button
          type="button"
          onClick={() => setCategory('schoolwork')}
          className={`rounded-md border px-3 py-1.5 text-sm transition ${
            category === 'schoolwork'
              ? 'border-orange-400 bg-orange-400 text-slate-950'
              : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
          }`}
        >
          Schoolwork
        </button>
      </div>

      {category === 'schoolwork' ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {yearKeys.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`rounded-md border px-3 py-1.5 text-xs transition ${
                selectedYear === year
                  ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleProjects.map((project) => (
          <article
            key={`${category}-${project.id}-${project.name}`}
            className="rounded-xl border border-slate-700 bg-slate-900 p-4"
          >
            <h3 className="text-lg font-semibold text-slate-100">{project.name}</h3>
            <p className="mt-2 text-sm text-slate-300">{project.description}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">{project.status}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span
                  key={`${project.name}-${tech}`}
                  className="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
