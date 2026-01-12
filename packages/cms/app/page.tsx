// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { ViewerHeader } from './components/ViewerHeader';
// import { api } from './lib/api';
// import { PlayCircle, Clock, Globe } from 'lucide-react';
// import Image from 'next/image';

// interface Series {
//   id: string;
//   title: string;
//   description: string;
//   languagePrimary: string;
//   assets?: Array<{
//     id: string;
//     url: string;
//     variant: string;
//     language: string;
//     assetType: string;
//   }>;
//   terms?: Array<{
//     lessons: Array<{
//       id: string;
//     }>;
//   }>;
// }

// export default function OTTHomePage() {
//   const [series, setSeries] = useState<Series[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchSeries = async () => {
//       try {
//         const response = await api.get('/catalog/programs');
//         setSeries(response.data.items || []);
//       } catch (error) {
//         console.error('Failed to fetch series:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSeries();
//   }, []);

//   const getPosterUrl = (seriesItem: Series) => {
//     const asset = seriesItem.assets?.find(
//       (a) => a.assetType === 'poster' && a.variant === 'PORTRAIT' && a.language === seriesItem.languagePrimary
//     );
//     return asset?.url || 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400';
//   };

//   const getEpisodeCount = (seriesItem: Series) => {
//     return seriesItem.terms?.reduce((total, term) => total + (term.lessons?.length || 0), 0) || 0;
//   };

//   return (
//     <div className="min-h-screen bg-slate-950">
//       <ViewerHeader />
      
//       <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <h2 className="text-3xl font-bold text-white mb-2">Browse Series</h2>
//           <p className="text-gray-400">Discover short-form content</p>
//         </div>

//         {loading ? (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
//             {[...Array(12)].map((_, i) => (
//               <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
//             ))}
//           </div>
//         ) : series.length === 0 ? (
//           <div className="text-center py-16">
//             <PlayCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
//             <h3 className="text-xl font-medium text-white mb-2">No series available</h3>
//             <p className="text-gray-400">Check back soon for new content</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
//             {series.map((seriesItem) => (
//               <Link
//                 key={seriesItem.id}
//                 href={`/series/${seriesItem.id}`}
//                 className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 hover:scale-105 transition-transform duration-200"
//               >
//                 <Image
//                   src={getPosterUrl(seriesItem)}
//                   alt={seriesItem.title}
//                   fill
//                   className="object-cover"
//                   sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
//                   <div className="absolute bottom-0 left-0 right-0 p-3">
//                     <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
//                       {seriesItem.title}
//                     </h3>
//                     <div className="flex items-center gap-3 text-xs text-gray-300">
//                       <span className="flex items-center gap-1">
//                         <Globe className="h-3 w-3" />
//                         {seriesItem.languagePrimary}
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <PlayCircle className="h-3 w-3" />
//                         {getEpisodeCount(seriesItem)} episodes
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  PlayCircle,
  Globe,
  Film,
  LogIn,
  LogOut,
  User,
  Search,
  X
} from 'lucide-react';
import { api } from './lib/api';

interface Series {
  id: string;
  title: string;
  description: string;
  languagePrimary: string;
  assets?: Array<{
    id: string;
    url: string;
    variant: string;
    language: string;
    assetType: string;
  }>;
  terms?: Array<{
    lessons: Array<{ id: string }>;
  }>;
}

export default function OTTHomePage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await api.get('/catalog/programs');
        setSeries(res.data.items || []);
      } catch (e) {
        console.error('Failed to fetch series', e);
      } finally {
        setLoading(false);
      }
    };

    setIsLoggedIn(!!localStorage.getItem('cms_token'));
    fetchSeries();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cms_token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const getPosterUrl = (s: Series) =>
    s.assets?.find(
      a =>
        a.assetType === 'poster' &&
        a.variant === 'PORTRAIT' &&
        a.language === s.languagePrimary
    )?.url ||
    'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg';

  const getEpisodeCount = (s: Series) =>
    s.terms?.reduce((t, term) => t + (term.lessons?.length || 0), 0) || 0;

  /* 🔍 SEARCH FILTER */
  const filteredSeries = useMemo(() => {
    return series.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [series, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 backdrop-blur bg-black/70 border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="text-amber-400 h-7 w-7" />
            <span className="text-xl font-bold tracking-wide">
              Chai<span className="text-amber-400">Shots</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/cms"
                  className="hidden sm:flex items-center gap-1 text-sm text-gray-300 hover:text-white"
                >
                  <User className="h-4 w-4" />
                  CMS
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
              >
                <LogIn className="h-4 w-4" />
                CMS Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold max-w-2xl leading-tight">
            Short Stories. <br />
            <span className="text-amber-400">Strong Emotions.</span>
          </h1>
          <p className="mt-4 text-gray-400 max-w-xl">
            Explore Telugu short-form series crafted for quick, immersive
            mobile viewing.
          </p>

          {/* 🔍 SEARCH BAR */}
          <div className="mt-8 max-w-xl relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search series..."
              className="w-full rounded-xl bg-white/5 border border-white/10 py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <main className="container mx-auto px-4 pb-16">

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-xl bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* EMPTY SEARCH */}
        {!loading && filteredSeries.length === 0 && (
          <div className="text-center py-20">
            <PlayCircle className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold">No results found</h3>
            <p className="text-gray-400">
              Try searching with a different title
            </p>
          </div>
        )}

        {/* SERIES GRID */}
        {!loading && filteredSeries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredSeries.map(s => (
              <Link
                key={s.id}
                href={`/series/${s.id}`}
                className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 shadow-xl hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <Image
                  src={getPosterUrl(s)}
                  alt={s.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 p-4 w-full">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {s.title}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-gray-300">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {s.languagePrimary.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" />
                        {getEpisodeCount(s)} eps
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/5 bg-black/50">
        <div className="container mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-400">
          <div>
            <h4 className="text-white font-semibold mb-2">Chai Shots</h4>
            <p>
              A mobile-first OTT platform delivering short-form Telugu stories.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Contact</h4>
            <ul className="space-y-1">
              <li>Email: <span className="text-gray-300">contact@chaishots.com</span></li>
              <li>Location: <span className="text-gray-300">Hyderabad, India</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1">
              <li><Link href="/login" className="hover:text-white">CMS Login</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 text-center py-4 text-xs text-gray-500">
          © {new Date().getFullYear()} Chai Shots. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
