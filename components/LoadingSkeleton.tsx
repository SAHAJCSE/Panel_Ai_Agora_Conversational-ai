'use client';

import { Loader } from '@/components/ui/loader';

export function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-black p-6">
      <Loader
        size="lg"
        title="Loading Interview Console..."
        subtitle="Connecting WebRTC audio channels and loading AI panel memory"
      />
    </div>
  );
}
