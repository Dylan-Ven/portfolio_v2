"use client";

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Accordeon } from '@/components/Accordeon';
import { majorProjects, minorProjects } from '@/data/portfolio';

type PortfolioProject = (typeof majorProjects)[number];

function ProjectStrip({
  projects,
  selectedProjectId,
  onSelect,
}: {
  projects: PortfolioProject[];
  selectedProjectId: number;
  onSelect: (project: PortfolioProject) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {projects.map((project) => {
        const isSelected = project.id === selectedProjectId;

        return (
          <button
            key={`${project.name}-${project.id}`}
            type="button"
            onClick={() => onSelect(project)}
            className={`min-w-60 rounded-xl border p-4 text-left transition ${
              isSelected
                ? 'border-cyan-400 bg-slate-800/90'
                : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
            }`}
          >
            <p className="text-sm font-semibold text-slate-100">{project.name}</p>
            <p className="mt-2 line-clamp-2 text-xs text-slate-300">{project.description}</p>
            <p className="mt-3 text-[11px] uppercase tracking-wide text-cyan-300">{project.status}</p>
          </button>
        );
      })}
    </div>
  );
}

export function Projects() {
  const [selected, setSelected] = useState<PortfolioProject>(majorProjects[0] ?? minorProjects[0]);

  const selectedTech = useMemo(() => selected?.tech ?? [], [selected]);

  if (!selected) {
    return null;
  }

  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Projects</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-50 md:text-4xl">Major + minor work, one view</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="space-y-4">
          <Accordeon title="Major projects" defaultOpen>
            <ProjectStrip
              projects={majorProjects}
              selectedProjectId={selected.id}
              onSelect={setSelected}
            />
          </Accordeon>

          <Accordeon title="Minor projects" defaultOpen>
            <ProjectStrip
              projects={minorProjects}
              selectedProjectId={selected.id}
              onSelect={setSelected}
            />
          </Accordeon>
        </div>

        <article className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
          <div className="relative h-64 w-full md:h-80">
            <Image
              src={selected.image || '/images/Portfolio1.png'}
              alt={selected.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-slate-950/30 to-slate-950/90" />

            <div className="absolute inset-y-0 right-0 flex w-[70%] flex-col justify-end p-6 md:w-[62%]">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Selected project</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{selected.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">{selected.description}</p>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex flex-wrap gap-2">
              {selectedTech.map((tech) => (
                <span
                  key={`${selected.name}-${tech}`}
                  className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs text-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              {selected.webapp ? (
                <a
                  href={selected.webapp}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Live preview
                </a>
              ) : null}
              {selected.link ? (
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-600 px-4 py-2 text-slate-200 hover:border-slate-400"
                >
                  Source code
                </a>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
