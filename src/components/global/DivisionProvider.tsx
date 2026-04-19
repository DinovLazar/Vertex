'use client';

import { usePathname } from '@/i18n/navigation';
import { getDivisionFromPath } from '@/lib/divisions';

export default function DivisionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const division = getDivisionFromPath(pathname);

  return (
    <div data-division={division} className="min-h-screen">
      {children}
    </div>
  );
}
