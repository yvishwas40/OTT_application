'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LessonsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/cms/lessons');
  }, [router]);

  return null;
}
