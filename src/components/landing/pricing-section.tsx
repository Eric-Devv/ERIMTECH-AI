"use client";
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Package, Brain, Server, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const pricingPlans = [
  {
    title: "Explorer",
    price: "Free",
    period: "",
    description: "Dive into AI capabilities. Great for personal use and exploration.",
    features: [
      "Access to Standard AI Chat Model",
      "Basic File Analysis (Text)",
      "Limited Daily Usage",
      "Community Support",
    ],
    cta: "Start Exploring",
    href: "/signup?plan=explorer",
    popular: false,
    icon: <Package className="h-6 w-6" />,
  },
  {
    title: "Innovator",
    price: "$19",
    period: "/month",
    description: "Enhanced features for frequent users and small projects.",
    features: [
      "Access to Advanced AI Chat Model",
      "Full File Support (Images, Audio)",
      "Code Generation & Explanation Tools",
      "Increased Daily Usage Limits",
      "Standard Support",
    ],
    cta: "Choose Innovator",
    href: "/signup?plan=innovator",
    popular: true,
    icon: <Brain className="h-6 w-6" />,
  },
  {
    title: "Visionary",
    price: "$49",
    period: "/month",
    description: "For power users and developers needing full capabilities.",
    features: [
      "Access to Premium AI Chat Model",
      "All Innovator Features",
      "Video Summarization Tools",
      "Developer API Access",
      "Highest Usage Limits",
      "Priority Support",
    ],
    cta: "Become a Visionary",
    href: "/signup?plan=visionary",
    popular: false,
    icon: <Server className="h-6 w-6" />,
  },
];

export function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            entry.target.querySelectorAll('.pricing-card-item').forEach((card, index) => {
              (card as HTMLElement).style.animationDelay = `${index * 0.1}s`;
              card.classList.add('animate-fadeInUp');
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
    <section id="pricing" ref={sectionRef} className="w-full py-12 md:py-16 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl font-orbitron font-bold tracking-tight sm:text-4xl xl:text-5xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
            Flexible Plans for Every Need
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
            Choose the plan that best suits your journey with ERIMTECH AI.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={cn(
                "pricing-card-item flex flex-col rounded-xl border transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2",
                plan.popular ? 'border-primary shadow-primary/30' : 'border-border/30',
                "bg-card/50 backdrop-blur-lg" 
              )}
              style={{ opacity: 0 }} 
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-semibold rounded-full shadow-lg flex items-center z-10">
                  <Zap className="h-4 w-4 mr-1.5" /> Most Popular
                </div>
              )}
              <CardHeader className="pb-4 pt-8 text-center">
                <div className="inline-block p-3 bg-primary/10 rounded-full mx-auto mb-3 border border-primary/20">
                  {React.cloneElement(plan.icon, { className: "h-7 w-7 text-primary" })}
                </div>
                <CardTitle className="text-2xl font-orbitron">{plan.title}</CardTitle>
                <div className="flex items-baseline justify-center mt-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-md text-muted-foreground ml-1">{plan.period}</span>}
                </div>
                <CardDescription className="pt-2 min-h-[60px] text-sm">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow py-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2.5 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </CardContent>
              <CardFooter className="pt-6 mt-auto">
                <Link href={plan.href} className="w-full">
                  <Button 
                    size="lg" 
                    className={cn(
                        "w-full text-base py-3 font-semibold transition-all duration-300 ease-in-out transform hover:scale-105",
                        plan.popular ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Card className="inline-block p-6 glassmorphic">
            <CardHeader className="p-0 mb-3">
               <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="font-orbitron text-xl">Enterprise Solutions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-muted-foreground mb-4">
                Need custom features, higher limits, or dedicated support? We offer tailored solutions for large organizations.
              </p>
              <Link href="/contact?subject=EnterpriseSolution">
                <Button variant="outline" size="lg">Contact Sales</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
