'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LessonDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    if (params.id) {
      router.replace(`/cms/lessons/${params.id}`);
    }
  }, [router, params.id]);

  return null;
}
