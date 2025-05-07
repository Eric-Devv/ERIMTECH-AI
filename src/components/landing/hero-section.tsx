"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Image from 'next/image';
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
    <section ref={sectionRef} className="w-full py-8 md:py-16 lg:py-20 scroll-animation">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-orbitron font-bold tracking-tighter sm:text-5xl xl:text-6xl/none holographic-text">
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
          <div className="relative mx-auto aspect-video overflow-hidden rounded-xl sm:w-full lg:order-last lg:aspect-square glassmorphic">
            <Image
              src="https://picsum.photos/800/600?random=1"
              alt="AI Demonstration Preview"
              layout="fill"
              objectFit="cover"
              className="opacity-70 hover:opacity-100 transition-opacity duration-500"
              data-ai-hint="futuristic technology"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-primary-foreground p-2 rounded-md bg-black/30 backdrop-blur-sm">
              <h3 className="font-orbitron text-lg">AI in Action</h3>
              <p className="text-xs">See a glimpse of what's possible.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
