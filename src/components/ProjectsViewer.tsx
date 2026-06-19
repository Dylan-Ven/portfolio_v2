"use client";

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Projects } from '@/data/portfolio';

type Category = 'major' | 'minor' | 'schoolwork';
type SchoolworkYear = 'Year 1' | 'Year 2' | 'Year 3';

interface PortfolioProject {
  id: number;
  name: string;
  description: string;
  tech: string[];
  link: string;
  webapp: string;
  status: string;
  image: string;
  year?: SchoolworkYear;
}

export function ProjectsViewer() {
  const [category, setCategory] = useState<Category>('major');
  const yearKeys = useMemo(() => ['Year 1', 'Year 2', 'Year 3'] as const, []);
  const [selectedYear, setSelectedYear] = useState<SchoolworkYear>('Year 1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);

  const major = Projects.Major as PortfolioProject[];
  const minor = Projects.Minor as PortfolioProject[];
  const schoolwork = Projects.Schoolwork as PortfolioProject[];

  const visibleProjects = useMemo(() => {
    if (category === 'major') {
      return major;
    }
    if (category === 'minor') {
      return minor;
    }
    return schoolwork.filter((project) => project.year === selectedYear);
  }, [category, major, minor, schoolwork, selectedYear]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [category, selectedYear]);

  useEffect(() => {
    if (!visibleProjects.length || isPaused || slideDirection) {
      return;
    }

    const intervalId = setInterval(() => {
      setSlideDirection('next');
    }, 3500);

    return () => clearInterval(intervalId);
  }, [isPaused, slideDirection, visibleProjects]);

  useEffect(() => {
    if (!slideDirection || visibleProjects.length < 2) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setCurrentIndex((previous) => {
        if (slideDirection === 'next') {
          return (previous + 1) % visibleProjects.length;
        }
        return (previous - 1 + visibleProjects.length) % visibleProjects.length;
      });
      setSlideDirection(null);
    }, 420);

    return () => clearTimeout(timeoutId);
  }, [slideDirection, visibleProjects]);

  const selectedProject = useMemo(() => {
    if (!visibleProjects.length) {
      return null;
    }
    return visibleProjects[currentIndex] ?? visibleProjects[0];
  }, [currentIndex, visibleProjects]);

  function goToPrevious() {
    if (!visibleProjects.length || slideDirection) {
      return;
    }
    setSlideDirection('prev');
  }

  function goToNext() {
    if (!visibleProjects.length || slideDirection) {
      return;
    }
    setSlideDirection('next');
  }

  function wrapIndex(index: number) {
    if (!visibleProjects.length) {
      return -1;
    }
    return (index + visibleProjects.length) % visibleProjects.length;
  }

  const carouselItems = useMemo(() => {
    if (!visibleProjects.length) {
      return [];
    }

    return [-2, -1, 0, 1, 2].map((offset) => {
      const index = wrapIndex(currentIndex + offset);
      return {
        project: visibleProjects[index],
        index,
        offset,
      };
    });
  }, [currentIndex, visibleProjects]);

  const trackTranslate =
    slideDirection === 'next' ? '-40%' : slideDirection === 'prev' ? '0%' : '-20%';

  return (
    <section id="projects" className="mx-auto py-10">
      <div id="projects-filter" className="flex flex-wrap gap-2 justify-center">
        {Object.keys(Projects).map((key) => (
          <button
            key={key}
            onClick={() => setCategory(key as Category)}
            className={`bg-none border-none`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
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

      <div className="mt-6">
        <article
          className="rounded-2xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {selectedProject ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-400"
                    aria-label="Previous project"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-400"
                    aria-label="Next project"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="overflow-hidden">
                <div
                  className="flex gap-3 "
                  style={{
                    width: '166.6667%',
                    transform: `translateX(${trackTranslate})`,
                    transition: slideDirection ? 'transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none',
                  }}
                >
                  {carouselItems.map(({ project, index, offset }) => {
                    const isCenter = offset === 0;
                    return (
                      <button
                        key={`${project.id}-${project.name}-${offset}-${index}`}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        className={`overflow-hidden rounded-xl border text-left transition ${
                          isCenter
                            ? 'border-orange-400 bg-slate-800 shadow-[0_0_0_1px_rgba(251,146,60,0.4)]'
                            : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                        }`}
                        style={{ width: 'calc((100% - 12px) / 5)' }}
                      >
                        <div className="relative h-36 overflow-hidden bg-slate-800">
                          <Image
                            src={project.image || '/images/Portfolio1.png'}
                            alt={project.name}
                            fill
                            className={`object-cover transition ${isCenter ? 'scale-100' : 'scale-[1.02] opacity-80'}`}
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 to-transparent" />
                          <p className="absolute bottom-2 left-2 rounded bg-slate-950/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-200">
                            {project.status}
                          </p>
                        </div>

                        <div className="p-3">
                          <h3 className="line-clamp-1 text-sm font-semibold text-slate-100">{project.name}</h3>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-300">{project.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {project.tech.slice(0, 3).map((tech) => (
                              <span
                                key={`${project.name}-${tech}`}
                                className="rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {selectedProject.webapp && selectedProject.webapp !== '#' ? (
                  <a
                    href={selectedProject.webapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-orange-400 px-3 py-1.5 font-semibold text-slate-950 hover:bg-orange-300"
                  >
                    Live
                  </a>
                ) : null}
                {selectedProject.link && selectedProject.link !== '#' ? (
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 hover:border-slate-400"
                  >
                    Source
                  </a>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">No projects in this filter.</p>
          )}
        </article>
      </div>
    </section>
  );
}
