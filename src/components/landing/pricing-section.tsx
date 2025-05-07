
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';

const pricingPlans = [
  {
    title: "Explorer",
    price: "Free",
    period: "",
    description: "Begin your journey into the future of AI. Perfect for individuals.",
    features: [
      "Limited Daily Prompts",
      "Basic AI Chat",
      "Standard File Support",
      "Community Access",
    ],
    cta: "Start Exploring",
    href: "/signup?plan=explorer",
    popular: false,
  },
  {
    title: "Innovator",
    price: "$29",
    period: "/month",
    description: "Unlock more power and features. Ideal for professionals and small teams.",
    features: [
      "Increased Daily Prompts",
      "Advanced AI Chat",
      "Full File Support (Images, Audio)",
      "Code Generation & Explanation",
      "Priority Support",
    ],
    cta: "Choose Innovator",
    href: "/signup?plan=innovator",
    popular: true,
  },
  {
    title: "Visionary",
    price: "$99",
    period: "/month",
    description: "For pioneers pushing the boundaries. Full access to all capabilities.",
    features: [
      "High-Volume Prompts",
      "All Innovator Features",
      "Video Summarization",
      "Developer API Access",
      "Early Access to New Features",
      "Dedicated Support",
    ],
    cta: "Become a Visionary",
    href: "/signup?plan=visionary",
    popular: false,
  },
];

export function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-animation-visible');
            const cards = entry.target.querySelectorAll('.pricing-card');
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
    <section id="pricing" ref={sectionRef} className="w-full py-12 md:py-16 bg-background scroll-animation">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-3 text-center mb-8 md:mb-10">
          <h2 className="text-3xl font-orbitron font-bold tracking-tighter sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            Choose the plan that’s right for you. Start for free or unlock advanced capabilities.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={`flex flex-col glassmorphic pricing-card scroll-animation hover:shadow-primary/15 transition-shadow duration-300 ${plan.popular ? 'border-2 border-primary shadow-primary/10' : 'border-border'}`}>
              {plan.popular && (
                <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold rounded-full shadow-md flex items-center">
                  <Zap className="h-3 w-3 mr-1" /> Popular
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-orbitron">{plan.title}</CardTitle>
                <div className="flex items-baseline pt-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>}
                </div>
                <CardDescription className="pt-1 min-h-[40px] text-sm">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow py-3">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Link href={plan.href} className="w-full">
                  <Button size="lg" className="w-full text-base" variant={plan.popular ? 'default' : 'outline'}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
         <p className="text-center text-muted-foreground mt-8 text-sm">
            Need a custom enterprise solution? <Link href="/contact" className="text-primary hover:underline font-medium">Contact Sales</Link>.
          </p>
      </div>
    </section>
  );
}
