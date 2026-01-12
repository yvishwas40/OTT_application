'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LessonsNewRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/cms/lessons/new');
  }, [router]);

  return null;
}
