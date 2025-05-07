
"use client";
import { Bot, Code, ImageIcon, Mic, Film, Link2, ShieldCheck, Users, TerminalSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useRef } from 'react';

const features = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "Intelligent Chat",
    description: "Engage in natural conversations, get answers, and brainstorm ideas.",
  },
  {
    icon: <Code className="h-8 w-8 text-primary" />,
    title: "Code Generation",
    description: "Generate code snippets and understand complex algorithms.",
  },
  {
    icon: <ImageIcon className="h-8 w-8 text-primary" />,
    title: "Image Analysis",
    description: "Upload images for detailed descriptions and insights.",
  },
  {
    icon: <Mic className="h-8 w-8 text-primary" />,
    title: "Audio Transcription",
    description: "Convert speech to text accurately from various audio sources.",
  },
  {
    icon: <Film className="h-8 w-8 text-primary" />,
    title: "Video Summarization",
    description: "Get concise summaries of long videos, extracting key information.",
  },
  {
    icon: <Link2 className="h-8 w-8 text-primary" />,
    title: "URL Content Analysis",
    description: "Analyze and summarize web page content from a link.",
  },
   {
    icon: <TerminalSquare className="h-8 w-8 text-primary" />,
    title: "Developer API",
    description: "Integrate ERIMTECH AI into your applications with our API.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Admin Panel",
    description: "Manage users, monitor usage, and control features.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Secure Authentication",
    description: "Robust user authentication powered by Firebase.",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-animation-visible');
            const cards = entry.target.querySelectorAll('.feature-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('scroll-animation-visible');
              }, index * 50);
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
    <section id="features" ref={sectionRef} className="w-full py-12 md:py-16 bg-background scroll-animation">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-3 text-center mb-8 md:mb-10">
          <h2 className="text-3xl font-orbitron font-bold tracking-tighter sm:text-4xl">Discover What ERIMTECH AI Can Do</h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            A suite of powerful AI tools at your fingertips, designed for versatility and ease of use.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="glassmorphic hover:shadow-primary/20 transition-shadow duration-300 feature-card scroll-animation flex flex-col">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                {feature.icon}
                <CardTitle className="text-lg font-orbitron">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
