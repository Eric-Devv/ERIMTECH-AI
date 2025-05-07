
"use client";
import { useState, useEffect, useCallback } from 'react';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Slide {
  id: number;
  illustrationUrl: string | StaticImageData;
  aiHint: string;
  title: string;
  description: string;
}

// Placeholder images will be used. Replace with actual illustrations.
const slidesData: Slide[] = [
  { id: 1, illustrationUrl: "https://picsum.photos/800/450?random=10", aiHint: "ai chat", title: "Intelligent Conversations", description: "Engage with our AI, get answers, and brainstorm ideas effortlessly." },
  { id: 2, illustrationUrl: "https://picsum.photos/800/450?random=11", aiHint: "code generation", title: "Instant Code Creation", description: "Generate complex code snippets in multiple languages with simple prompts." },
  { id: 3, illustrationUrl: "https://picsum.photos/800/450?random=12", aiHint: "image analysis", title: "Deep Image Understanding", description: "Upload images for detailed analysis, object recognition, and insights." },
  { id: 4, illustrationUrl: "https://picsum.photos/800/450?random=13", aiHint: "audio processing", title: "Accurate Audio Transcription", description: "Convert spoken words from audio files into text with high precision." },
  { id: 5, illustrationUrl: "https://picsum.photos/800/450?random=14", aiHint: "video summary", title: "Quick Video Summaries", description: "Extract key information and get concise summaries from long video content." },
];

const SLIDESHOW_INTERVAL = 5000; // 5 seconds

export function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    // This ensures slidesData is only accessed on the client after hydration
    setSlides(slidesData);
  }, []);


  const goToNext = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setTimeout(goToNext, SLIDESHOW_INTERVAL);
    return () => clearTimeout(timer);
  }, [currentIndex, slides.length, goToNext]);

  const goToPrevious = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    if (slides.length === 0) return;
    setCurrentIndex(index);
  };
  
  if (slides.length === 0) {
    return (
      <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] overflow-hidden rounded-xl glassmorphic shadow-2xl flex items-center justify-center">
        <p className="text-muted-foreground">Loading slideshow...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] overflow-hidden rounded-xl glassmorphic shadow-2xl">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          )}
        >
          <Image
            src={slide.illustrationUrl}
            alt={slide.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint={slide.aiHint}
            className="brightness-75"
            priority={index === 0} // Prioritize loading the first slide image
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4 md:p-6">
            <h3 className="text-xl md:text-3xl font-orbitron font-bold text-primary-foreground mb-2 holographic-text !bg-clip-text !text-transparent" style={{filter: 'none'}}>
              {slide.title}
            </h3>
            <p className="text-sm md:text-base text-primary-foreground/90 max-w-xs md:max-w-md">
              {slide.description}
            </p>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-primary-foreground rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-primary-foreground rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1.5 md:space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              "w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-primary-foreground/50",
              index === currentIndex ? "bg-primary scale-125" : "bg-primary-foreground/50 hover:bg-primary-foreground/75"
            )}
          />
        ))}
      </div>
    </div>
  );
}

