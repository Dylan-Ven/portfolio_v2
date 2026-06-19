"use client";
import { skillsData, type SkillEntry } from '@/data/portfolio';

const levelColors: Record<number, string> = {
    1: '#6B0000',
    2: '#AE260B',
    3: '#D1B500',
    4: '#8CAB00',
    5: '#24A400',
};

function clampLevel(level: number): 1 | 2 | 3 | 4 | 5 {
    const safeLevel = Math.max(1, Math.min(5, level));
    return safeLevel as 1 | 2 | 3 | 4 | 5;
}

export function SkillViewer() {
    const sectionTitleMap: Record<string, string> = {
        languages: 'Languages',
        frontend: 'Frontend-frameworks',
        backend: 'Backend-frameworks',
        fullstack: 'Fullstack-frameworks',
        creativeAndGraphics: 'Creative-and-graphics',
        engines: 'Engines',
        other: 'Other',
    };

    const skillSections: Array<{ title: string; items: SkillEntry[] }> = Object.entries(skillsData)
        .filter(([key]) => key !== 'tools')
        .map(([key, items]) => ({
            title: sectionTitleMap[key] ?? key,
            items,
        }));

    const tools = skillsData.tools;

    return (
        <section id="skills" className="mx-auto w-10/12 py-10">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-100">Skills</h2>
            </div>

            <div className="space-y-8">
                {skillSections.map((section) => (
                    <div key={section.title}>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {section.title}
                        </h3>

                        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {section.items.map((skill) => {
                                const level = clampLevel(skill.level);
                                const filled = '█'.repeat(level);
                                const empty = '░'.repeat(5 - level);

                                return (
                                    <li
                                        key={`${section.title}-${skill.name}`}
                                        className="rounded-xl border border-slate-700 bg-slate-900 p-4"
                                    >
                                        <p className="text-base font-semibold text-slate-100">{skill.name}</p>
                                        <p className="mt-2 font-mono text-sm">
                                            <span style={{ color: levelColors[level] }}>{filled}</span>
                                            <span className="text-slate-500">{empty}</span>
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}

                <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Tools
                    </h3>

                    <ul className="flex flex-wrap gap-2">
                        {tools.map((tool) => (
                            <li
                                key={`tools-${tool.name}`}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200"
                            >
                                {tool.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}