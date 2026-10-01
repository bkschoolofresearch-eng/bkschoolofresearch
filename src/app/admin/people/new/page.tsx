'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** People are invited only — full create editor is not used for new members. */
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/people?add=1');
  }, [router]);
  return (
    <p className="text-sm text-[#5B6B7C]">
      Opening the add-person form…
    </p>
  );
}
