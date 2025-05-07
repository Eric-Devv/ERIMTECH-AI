
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { PricingSection } from '@/components/landing/pricing-section';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 md:space-y-10">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </div>
  );
}

