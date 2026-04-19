export type Division = 'consulting' | 'marketing' | 'shared';

export function getDivisionFromPath(pathname: string): Division {
  if (pathname.startsWith('/consulting')) return 'consulting';
  if (pathname.startsWith('/marketing')) return 'marketing';
  return 'shared';
}

// Division-specific class strings. After the Phase 1/2 grayscale refactor
// all three divisions share the same visual palette; these entries stay in
// sync so division-driven styling remains neutral on every page.
export const divisionConfig = {
  consulting: {
    label: 'Vertex Consulting',
    accentClass: 'text-[#F5F5F5]',
    bgClass: 'bg-[#141414]',
    borderClass: 'border-[#404040]',
  },
  marketing: {
    label: 'Vertex Marketing',
    accentClass: 'text-[#F5F5F5]',
    bgClass: 'bg-[#141414]',
    borderClass: 'border-[#404040]',
  },
  shared: {
    label: 'Vertex Consulting',
    accentClass: 'text-[#F5F5F5]',
    bgClass: 'bg-[#141414]',
    borderClass: 'border-[#404040]',
  },
} as const;
