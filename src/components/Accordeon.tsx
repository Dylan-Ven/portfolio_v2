"use client"
import { ReactNode, useId, useState } from 'react';

interface AccordeonProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  width?: string;
}

export const Accordeon = ({
  title,
  children,
  defaultOpen = false,
  width = '100%',
}: AccordeonProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div
      className="overflow-hidden rounded-[10px] border border-slate-700 bg-slate-900"
      style={{ width }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-4 py-[14px] text-left text-[15px] font-semibold text-slate-200"
      >
        <span>{title}</span>
        <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen ? (
        <div
          id={contentId}
          className="border-t border-slate-700 bg-gray-900 px-4 py-[14px] text-sm leading-relaxed text-slate-300"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};

export type { AccordeonProps };
