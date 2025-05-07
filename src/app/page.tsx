import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { CallToActionSection } from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 md:space-y-5 lg:space-y-6">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CallToActionSection />
    </div>
  );
}
