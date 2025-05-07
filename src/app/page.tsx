import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { CallToActionSection } from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-16 md:space-y-24 lg:space-y-32 overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CallToActionSection />
    </div>
  );
}
