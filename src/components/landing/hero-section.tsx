
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Brain, Code, ImageIcon } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

const slides = [
  {
    icon: <Brain className="h-16 w-16 text-primary" />,
    title: "Intelligent Conversations",
    description: "Engage with our advanced AI for insights, brainstorming, and creative exploration.",
    bgColor: "bg-blue-500/10",
    imgSrc: "https://picsum.photos/seed/brain/600/400",
    imgAlt: "AI Brain"
  },
  {
    icon: <Code className="h-16 w-16 text-green-500" />,
    title: "Code Generation & Analysis",
    description: "Accelerate development with AI-powered code generation, explanation, and debugging.",
    bgColor: "bg-green-500/10",
    imgSrc: "https://picsum.photos/seed/code/600/400",
    imgAlt: "Code Snippet"
  },
  {
    icon: <ImageIcon className="h-16 w-16 text-purple-500" />,
    title: "Visual Understanding",
    description: "Unlock insights from images with our powerful visual analysis capabilities.",
    bgColor: "bg-purple-500/10",
    imgSrc: "https://picsum.photos/seed/image/600/400",
    imgAlt: "Abstract Image"
  },
    {
    icon: <Zap className="h-16 w-16 text-yellow-500" />,
    title: "And Much More...",
    description: "Explore audio transcription, video summarization, and a powerful developer API.",
    bgColor: "bg-yellow-500/10",
    imgSrc: "https://picsum.photos/seed/zap/600/400",
    imgAlt: "Future Tech"
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

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
      clearInterval(timer);
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="relative w-full h-auto md:h-[calc(100vh-4rem)] min-h-[600px] flex items-center justify-center text-center overflow-hidden py-12 md:py-0 scroll-animation">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background opacity-80 z-0"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-primary/10 rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 5}s`,
              opacity: Math.random() * 0.3 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 px-4 md:px-6 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="lg:w-1/2 lg:text-left text-center max-w-2xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-orbitron font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-pink-500 !leading-tight md:!leading-tight lg:!leading-tight">
            Welcome to the Future of AI with ERIMTECH
          </h1>
          <p className="mt-4 md:mt-6 max-w-xl mx-auto lg:mx-0 text-md md:text-lg text-muted-foreground">
            Unlock limitless possibilities with our suite of advanced AI tools, now free for everyone. Experience intelligent chat, code generation, image analysis, and more.
          </p>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link href="/chat">
              <Button size="lg" className="group w-full sm:w-auto text-base md:text-lg">
                Try ERIMTECH AI <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:w-1/2 mt-8 lg:mt-0 w-full max-w-xl">
          <div className="relative aspect-video rounded-xl shadow-2xl overflow-hidden glassmorphic p-2">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col items-center justify-center p-4 md:p-6",
                  slide.bgColor,
                  currentSlide === index ? "opacity-100" : "opacity-0"
                )}
              >
                <Image 
                  src={slide.imgSrc} 
                  alt={slide.imgAlt} 
                  width={600} 
                  height={400} 
                  className="absolute inset-0 w-full h-full object-cover opacity-20" 
                  data-ai-hint={slide.imgAlt}
                />
                <div className="relative z-10 text-center">
                  <div className="p-3 bg-background/70 rounded-full inline-block mb-3 md:mb-4 shadow-md">
                     {slide.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-orbitron font-semibold text-foreground">{slide.title}</h3>
                  <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground max-w-md mx-auto">{slide.description}</p>
                </div>
              </div>
            ))}
             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-20">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-colors",
                    currentSlide === index ? "bg-primary" : "bg-muted-foreground/50 hover:bg-muted-foreground/80"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
