
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
// import { TestimonialsSection } from '@/components/landing/testimonials-section'; // Already removed
// import { CallToActionSection } from '@/components/landing/cta-section'; // Removed as cta-section.tsx was likely deleted


export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 md:space-y-10">
      <HeroSection />
      <FeaturesSection />
      {/* <TestimonialsSection /> */}
      {/* <CallToActionSection /> */}
    </div>
  );
}

