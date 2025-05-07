"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function CallToActionSection() {
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
      { threshold: 0.2 }
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
    <section ref={sectionRef} className="w-full py-8 md:py-12 lg:py-16 bg-gradient-to-br from-background to-secondary/30 scroll-animation">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-6 text-center glassmorphic p-8 md:p-10 lg:p-12 rounded-xl shadow-2xl">
          <Rocket className="h-16 w-16 text-primary animate-pulse" />
          <h2 className="text-3xl font-orbitron font-bold tracking-tighter sm:text-4xl md:text-5xl holographic-text">
            Ready to Experience the Future?
          </h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Join ERIMTECH AI today and unlock a new era of intelligent automation and creativity. Your journey into advanced AI starts now.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="group">
                Sign Up for Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact" passHref>
               <Button variant="outline" size="lg">
                  Contact Sales
               </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
