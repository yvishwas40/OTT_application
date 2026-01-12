'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProgramsNewRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/cms/programs/new');
  }, [router]);

  return null;
}
