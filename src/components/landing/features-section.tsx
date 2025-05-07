
"use client";
import { Bot, Code, ImageIcon, Mic, Film, Link2, ShieldCheck, Users, TerminalSquare, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

const features = [
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: "Intelligent Chat Assistant",
    description: "Engage in natural conversations, get answers, and brainstorm ideas with our advanced AI.",
  },
  {
    icon: <Code className="h-10 w-10 text-primary" />,
    title: "Code Generation & Explanation",
    description: "Generate code snippets in various languages and understand complex algorithms with ease.",
  },
  {
    icon: <ImageIcon className="h-10 w-10 text-primary" />,
    title: "Image Analysis",
    description: "Upload images to get detailed descriptions, identify objects, and gain insights.",
  },
  {
    icon: <Mic className="h-10 w-10 text-primary" />,
    title: "Audio Transcription",
    description: "Convert speech to text accurately and quickly from various audio sources.",
  },
  {
    icon: <Film className="h-10 w-10 text-primary" />,
    title: "Video Summarization",
    description: "Get concise summaries of long videos, extracting key information efficiently.",
  },
  {
    icon: <Link2 className="h-10 w-10 text-primary" />,
    title: "URL Content Analysis",
    description: "Provide a link and let our AI analyze and summarize web page content for you.",
  },
   {
    icon: <TerminalSquare className="h-10 w-10 text-primary" />,
    title: "Developer API",
    description: "Integrate ERIMTECH AI capabilities into your own applications with our robust API.",
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Admin Panel",
    description: "Manage users, monitor usage, and control features with a comprehensive admin dashboard.",
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: "Secure Authentication",
    description: "Robust and secure user authentication powered by Firebase.",
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
            // Animate children cards with a stagger effect
            const cards = entry.target.querySelectorAll('.feature-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('scroll-animation-visible');
              }, index * 100);
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
    <section id="features" ref={sectionRef} className="w-full pt-6 md:pt-8 lg:pt-10 pb-2 md:pb-3 lg:pb-4 bg-background scroll-animation">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm holographic-text !bg-clip-text !text-transparent">Key Features</div>
          <h2 className="text-3xl font-orbitron font-bold tracking-tighter sm:text-5xl">Unlock a New Dimension of AI</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            ERIMTECH AI is packed with powerful features designed to revolutionize how you interact with artificial intelligence.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="glassmorphic hover:shadow-primary/30 transition-shadow duration-300 feature-card scroll-animation">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                {feature.icon}
                <CardTitle className="text-xl font-orbitron">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div id="features-video" className="mt-10 md:mt-12 scroll-animation">
          <h3 className="text-2xl font-orbitron font-bold tracking-tighter sm:text-3xl text-center mb-6">See ERIMTECH AI in Action</h3>
          <div className="aspect-video rounded-xl overflow-hidden glassmorphic relative">
             <Image
                src="https://picsum.photos/1280/720?random=2"
                alt="ERIMTECH AI Demo Video Thumbnail"
                layout="fill"
                objectFit="cover"
                className="opacity-80 hover:opacity-100 transition-opacity duration-500 cursor-pointer"
                data-ai-hint="ai interface"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <PlayCircle className="h-20 w-20 text-primary-foreground opacity-70 hover:opacity-100 transition-opacity cursor-pointer" />
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
