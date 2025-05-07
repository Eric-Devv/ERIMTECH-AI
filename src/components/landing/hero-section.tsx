
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { HeroSlideshow } from '@/components/landing/hero-slideshow';
import { useEffect, useRef } from 'react';

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-animation-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-8 md:py-10 lg:py-12 scroll-animation">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-3">
              <h1 className="text-4xl font-orbitron font-bold tracking-tighter sm:text-5xl xl:text-6xl/snug holographic-text">
                Welcome to the Future with ERIMTECH AI
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Unleash the power of next-generation artificial intelligence. ERIMTECH AI provides cutting-edge solutions for chat, code, media analysis, and more, wrapped in a stunning futuristic interface.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/chat">
                <Button size="lg" className="w-full sm:w-auto group">
                  Get Started <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features-video" passHref>
                 <Button variant="outline" size="lg" className="w-full sm:w-auto group">
                    <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Watch Demo
                 </Button>
              </Link>
            </div>
          </div>
          <div className="lg:order-last">
            <HeroSlideshow />
          </div>
        </div>
      </div>
    </section>
  );
}
