"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useEffect, useRef } from 'react';

const testimonials = [
  {
    name: "Nova Stargazer",
    role: "Lead Innovator, FutureTech Corp",
    avatar: "https://picsum.photos/100/100?random=3",
    aiHint: "professional woman",
    testimonial: "ERIMTECH AI has transformed our workflow. The code generation is unbelievably fast and accurate. It's like having a genius developer on call 24/7.",
    rating: 5,
  },
  {
    name: "Jax Cyberion",
    role: "CEO, Quantum Leap Solutions",
    avatar: "https://picsum.photos/100/100?random=4",
    aiHint: "tech ceo",
    testimonial: "The AI chat interface is incredibly intuitive, and the URL analysis feature saves us hours of research time. A true game-changer for our team.",
    rating: 5,
  },
  {
    name: "Lyra Spectra",
    role: "Creative Director, HoloDesign Studios",
    avatar: "https://picsum.photos/100/100?random=5",
    aiHint: "creative director",
    testimonial: "Image and video analysis capabilities are phenomenal. ERIMTECH AI helps us unlock new creative possibilities. The futuristic design is also a huge plus!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-animation-visible');
             const cards = entry.target.querySelectorAll('.testimonial-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('scroll-animation-visible');
              }, index * 150);
            });
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
    <section ref={sectionRef} className="w-full py-12 md:py-24 lg:py-32 scroll-animation">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm holographic-text !bg-clip-text !text-transparent">User Stories</div>
          <h2 className="text-3xl font-orbitron font-bold tracking-tighter sm:text-5xl">Hear From Our Trailblazers</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Discover how innovators and creators are leveraging ERIMTECH AI to redefine what's possible.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glassmorphic testimonial-card scroll-animation hover:shadow-primary/20 transition-shadow duration-300 flex flex-col">
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4 border-2 border-primary">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.aiHint} />
                    <AvatarFallback>{testimonial.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-orbitron font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-foreground/90 mb-4 flex-grow">&ldquo;{testimonial.testimonial}&rdquo;</p>
                <div className="flex items-center mt-auto">
                  {Array(testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                  {Array(5 - testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i + testimonial.rating} className="h-5 w-5 text-muted-foreground" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
