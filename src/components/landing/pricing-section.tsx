
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
      "5 Free Prompts/Day",
      "Basic AI Chat",
      "Limited File Support",
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
      "200 Prompts/Day",
      "Advanced AI Chat",
      "Full File Support (Images, Audio)",
      "Code Generation & Explanation",
      "Priority Support",
    ],
    cta: "Become an Innovator",
    href: "/signup?plan=innovator",
    popular: true,
  },
  {
    title: "Visionary",
    price: "$99",
    period: "/month",
    description: "For pioneers pushing the boundaries. Full access to all capabilities.",
    features: [
      "Unlimited Prompts",
      "All Innovator Features",
      "Video Summarization",
      "Developer API Access",
      "Early Access to New Features",
      "Dedicated Support Channel",
    ],
    cta: "Join the Visionaries",
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
    <section id="pricing" ref={sectionRef} className="w-full py-8 md:py-10 bg-background scroll-animation">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-3 text-center mb-8">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm holographic-text !bg-clip-text !text-transparent">Access Tiers</div>
          <h2 className="text-3xl font-orbitron font-bold tracking-tighter sm:text-5xl">Choose Your Path to the Future</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Flexible plans designed to scale with your ambitions. Start for free or unlock advanced capabilities.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={`flex flex-col glassmorphic pricing-card scroll-animation hover:shadow-primary/25 transition-shadow duration-300 ${plan.popular ? 'border-2 border-primary shadow-primary/20' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full shadow-lg flex items-center">
                  <Zap className="h-3 w-3 mr-1" /> Popular
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-orbitron">{plan.title}</CardTitle>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold holographic-text !bg-clip-text !text-transparent">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                </div>
                <CardDescription className="pt-2 min-h-[60px]">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={plan.href} className="w-full">
                  <Button size="lg" className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
         <p className="text-center text-muted-foreground mt-6 text-sm">
            Need a custom solution for your enterprise? <Link href="/contact" className="text-primary hover:underline">Contact Sales</Link>.
          </p>
      </div>
    </section>
  );
}

