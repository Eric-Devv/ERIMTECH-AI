
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
    <section ref={sectionRef} className="w-full py-12 md:py-16 scroll-animation">
      <div className="container px-4 md:px-6 text-center">
        <div className="flex flex-col justify-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl font-orbitron font-bold tracking-tighter sm:text-5xl xl:text-6xl/none leading-tight">
            Meet ERIMTECH AI
          </h1>
          <p className="text-muted-foreground md:text-xl">
            Explore advanced AI capabilities for chat, code generation, media analysis, and more. Powerful, intuitive, and built for the future.
          </p>
          <div className="flex justify-center">
            <Link href="/chat">
              <Button size="lg" className="group px-8 py-3 text-lg">
                Try ERIMTECH AI <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
