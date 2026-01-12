'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProgramDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    if (params.id) {
      router.replace(`/cms/programs/${params.id}`);
    }
  }, [router, params.id]);

  return null;
}
