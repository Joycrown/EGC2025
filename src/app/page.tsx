"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';

const EventSchema = () => ({
  __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "EGC Conference 2026",
    "description": "Annual gathering of The Gospel Faith Mission International youth for spiritual enrichment, fellowship, and transformation.",
    "startDate": "2026-12-11T09:00:00",
    "endDate": "2026-12-13T18:00:00",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "The Gospel Faith Mission International Headquarters",
      "address": { "@type": "PostalAddress", "addressLocality": "Nigeria" },
    },
    "image": [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
    "performer": { "@type": "Organization", "name": "The Gospel Faith Mission International" },
    "organizer": { "@type": "Organization", "name": "The Gospel Faith Mission International", "url": "https://gofamint.org" },
    "offers": { "@type": "Offer", "url": `${process.env.NEXT_PUBLIC_APP_URL}/register`, "availability": "https://schema.org/InStock" },
  }),
});

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [imageRotation, setImageRotation] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.isLoggedIn);
        }
      } catch (error) {
        console.error('Failed to fetch auth status:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const conferenceDate = new Date('2026-12-11T00:00:00');
    const calculateTimeLeft = () => {
      const difference = +conferenceDate - +new Date();
      if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days:    Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setImageRotation(prev => (prev + 1) % 3), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-gray-900 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={EventSchema()} />
      <Header isLoggedIn={isLoggedIn} isLoading={isLoading} />

      <section
        aria-labelledby="hero-heading"
        className="relative lg:h-[calc(100vh-64px)] lg:max-h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] w-full lg:overflow-hidden overflow-y-auto overflow-x-hidden"
      >
        <h1 id="hero-heading" className="sr-only">EGC Conference 2026 - The Gospel Faith Mission International</h1>

        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/60 z-10" />

        {/* Background watermark */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: `url('/images/GofamintLogo.png')`, backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'overlay' }}
          />
        </div>

        {/* Mobile & tablet background circles */}
        <div className="absolute top-[10%] left-[10%] w-[180px] h-[180px] bg-yellow-400/20 rounded-full lg:hidden" />
        <div className="absolute bottom-[25%] right-[-10%] w-[150px] h-[150px] bg-red-600/20 rounded-full lg:hidden" />

        {/* Desktop decorative elements */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-10 hidden lg:block" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-600 rounded-full translate-x-1/3 translate-y-1/3 hidden lg:block" />

        <div className="relative z-20 w-full lg:h-[calc(100vh-64px)] min-h-[calc(100vh-64px)]">

          {/* ── MOBILE & TABLET ── */}
          <div className="lg:hidden flex flex-col min-h-full pt-[2vh] sm:pt-[3vh] pb-[120px] xs:pb-[130px] sm:pb-[130px]">
            <div className="text-center md:mt-10 mb-[1vh] sm:mb-[2vh]">
              <div className="inline-flex items-center bg-black/30 px-3 sm:px-5 py-1 sm:py-1.5 rounded-full shadow-lg">
                <span className="text-yellow-400 mr-1 sm:mr-2">★</span>
                <p className="text-yellow-400 font-medium text-sm sm:text-3xl">Welcome to EGC Conference</p>
                <span className="text-yellow-400 ml-1 sm:ml-2">★</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-between pt-1 sm:pt-4 px-6 sm:px-10 sm:max-w-2xl sm:mx-auto">
              <h1 className="text-center mb-[2vh] sm:mb-[3vh]">
                <div className="relative inline-block">
                  <span className="block text-2xl xs:text-3xl sm:text-7xl font-black tracking-wide relative z-10">Emerging</span>
                  <span className="block text-2xl xs:text-3xl sm:text-6xl bg-gradient-to-r text-red-500 bg-clip-text font-black tracking-wider relative z-20 transform -translate-y-1 scale-110">Generals&apos;</span>
                  <span className="block text-xl xs:text-2xl sm:text-5xl font-extrabold tracking-widest mt-0.5 relative z-10 border-b-2 border-t-2 border-white/40 py-0.5 px-3 sm:px-6">CONFERENCE 2026</span>
                </div>
              </h1>

              {/* Rotating images */}
              <div className="w-full h-[30vh] xs:h-[32vh] sm:h-[38vh] my-[2vh] sm:my-[3vh] relative">
                <div className="absolute left-[15%] bottom-[20%] w-[25%] aspect-square rounded-full border border-white/20 backdrop-blur-sm z-10 mix-blend-overlay opacity-60" />
                <div className="absolute right-[20%] top-[15%] w-[18%] aspect-square rounded-full border border-white/30 backdrop-blur-sm z-10 mix-blend-overlay opacity-40" />

                {[
                  { src: '/images/church image2.jpg', alt: 'Pastor',  overlay: 'from-black/10' },
                  { src: '/images/Churchimage3.jpg',  alt: 'Worship', overlay: 'from-red-500/20' },
                  { src: '/images/Churchimage.jpg',   alt: 'Church',  overlay: 'from-yellow-500/20' },
                ].map((img, i) => {
                  const center = 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] xs:w-[50%] z-30';
                  const bl     = 'left-[2%] bottom-[10%] w-[45%] xs:w-[42%] z-20 translate-y-2';
                  const tr     = 'right-[2%] top-[5%] w-[45%] xs:w-[42%] z-20 -translate-y-2';
                  const matrix = [[center,bl,tr],[tr,center,bl],[bl,tr,center]];
                  const border = i === 0 ? 'border-[5px]' : 'border-[4px]';
                  return (
                    <div key={img.src} className={`absolute transition-all duration-1000 ease-in-out ${matrix[imageRotation][i]} aspect-square rounded-full overflow-hidden ${border} border-white shadow-2xl`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${img.overlay} to-transparent z-10`} />
                      <Image src={img.src} alt={img.alt} width={500} height={500}
                        className="object-cover w-full h-full transform hover:scale-110 transition-all duration-700" priority />
                    </div>
                  );
                })}

                <div className="absolute bottom-[15%] right-[25%] w-[8%] aspect-square rounded-full bg-yellow-400 z-25 animate-pulse shadow-lg shadow-yellow-400/50" />
                <div className="absolute top-[20%] left-[25%] w-[6%] aspect-square rounded-full bg-red-500 z-25 animate-pulse shadow-lg shadow-red-500/50" />
              </div>

              <p className="text-xs xs:text-sm sm:text-lg md:text-[22px] text-center text-gray-300 mt-[2vh] sm:mt-[3vh] mb-0 max-w-[85%] sm:max-w-[80%] md:max-w-[90%] leading-tight sm:leading-tight">
                Join us for an amazing conference experience with engaging activities, and spiritual growth opportunities.
              </p>

              <div className="mt-auto mb-[6vh] xs:mb-[7vh] sm:mb-[8vh] flex flex-col items-center">
                <div className="text-yellow-400 font-medium text-center text-sm xs:text-base sm:text-2xl my-2 sm:mb-3">
                  11th–13th December, 2026
                </div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-sm xs:text-base sm:text-lg py-3 px-8 sm:px-12 rounded-full shadow-2xl shadow-red-900/50 ring-2 ring-red-400/30 transition-all duration-300 hover:scale-105"
                >
                  Register Now
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* ── DESKTOP ── */}
          <div className="hidden lg:flex w-full h-full items-center">
            <div className="container mx-auto px-4 flex flex-row items-center">

              {/* Text column */}
              <div className="w-3/5 pr-2">
                <div className="flex items-center mb-1">
                  <div className="mr-1 text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-yellow-400 font-medium md:text-md lg:text-2xl">Welcome to EGC Conference</p>
                </div>

                <h1 className="md:text-4xl lg:text-6xl font-bold leading-none mb-2">
                  <span className="block">Emerging</span>
                  <span className="block text-red-500">Generals&apos;</span>
                  <span className="block text-white">CONFERENCE 2026</span>
                </h1>

                <p className="md:text-[13px] lg:text-[16px] font-light mb-2 text-gray-300 max-w-[90%]">
                  Join us for an amazing conference experience with engaging activities, and spiritual growth opportunities.
                </p>

                <div className="mb-2">
                  <h3 className="md:text-sm lg:text-lg font-medium text-yellow-400">
                    11th–13th December, 2026
                  </h3>
                </div>

                <div className="mt-3 md:mt-2 flex items-center gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold md:text-sm lg:text-base px-6 py-3 rounded-full shadow-xl shadow-red-900/40 ring-2 ring-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-red-600/40"
                  >
                    Register Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link href="/login" className="text-sm text-white/60 hover:text-white/90 font-medium transition-colors underline underline-offset-2">
                    Sign in
                  </Link>
                </div>
              </div>

              {/* Image column */}
              <div className="w-2/5 h-full flex items-center justify-center relative">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute right-[5%] w-[65%] aspect-square rounded-full bg-yellow-500/20 z-10" />

                  <div className="absolute top-[5%] right-[8%] w-[45%] lg:top-[15%] lg:right-[15%] lg:w-[35%] aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl z-30">
                    <Image src="/images/church image2.jpg" alt="Pastor" width={400} height={400} className="object-cover w-full h-full" priority />
                  </div>
                  <div className="absolute bottom-[-30px] right-[30%] w-[50%] lg:w-[40%] aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl z-20">
                    <Image src="/images/Churchimage.jpg" alt="Church" width={300} height={300} className="object-cover w-full h-full" priority />
                  </div>
                  <div className="absolute bottom-[-220px] left-[-2%] w-[45%] lg:left-[17%] lg:w-[35%] aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl z-25">
                    <Image src="/images/Churchimage3.jpg" alt="Worship" width={300} height={300} className="object-cover w-full h-full" priority />
                  </div>

                  <div className="absolute bottom-[35%] right-[18%] w-[6%] aspect-square rounded-full bg-yellow-400 z-15" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Countdown bar ── */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw]">
          <div className="backdrop-blur-md bg-black/70 border border-white/10 rounded-t-2xl shadow-2xl px-5 py-3 sm:px-8 sm:py-4">
            <p className="text-center text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-yellow-400/80 mb-3">
              Countdown to EGC &apos;26 · 11–13 December 2026
            </p>
            <div className="flex items-end gap-2 sm:gap-3">
              {[
                { value: timeLeft.days,    label: 'Days',  color: 'from-red-600 to-red-700' },
                { value: timeLeft.hours,   label: 'Hours', color: 'from-amber-500 to-yellow-600' },
                { value: timeLeft.minutes, label: 'Mins',  color: 'from-blue-500 to-blue-600' },
                { value: timeLeft.seconds, label: 'Secs',  color: 'from-purple-500 to-purple-700' },
              ].map(({ value, label, color }, i, arr) => (
                <div key={label} className="flex items-end gap-2 sm:gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-b ${color} flex flex-col items-center justify-center shadow-lg`}>
                      <span className="text-lg sm:text-xl lg:text-2xl font-black text-white tabular-nums leading-none">
                        {String(value).padStart(2, '0')}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-white/70 font-bold uppercase tracking-wide mt-0.5">{label}</span>
                    </div>
                  </div>
                  {i < arr.length - 1 && <span className="text-white/30 text-lg font-bold mb-3">:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
