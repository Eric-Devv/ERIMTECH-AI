import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
// import { TestimonialsSection } from '@/components/landing/testimonials-section'; // Removed
import { PricingSection } from '@/components/landing/pricing-section';
import { CallToActionSection } from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-10 md:space-y-14 lg:space-y-18 overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      {/* <TestimonialsSection /> */} {/* Removed */}
      <PricingSection />
      <CallToActionSection />
    </div>
  );
}
