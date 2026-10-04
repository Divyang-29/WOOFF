import HeroSection from './HeroSection/HeroSection';
import CertificatesSection from './CertificatesSection/CertificatesSection';
import ProductShowcase from './ProductShowcase/ProductShowcase';
import CleanIngredientsSection from './CleanIngredientsSection/CleanIngredientsSection';
import ComparisonSection from './ComparisonSection/ComparisonSection';
import BrandReelsSection from './BrandReelsSection/BrandReelsSection';
import DiscoverySection from './DiscoverySection/DiscoverySection';
import BenefitsSection from './BenefitsSection/BenefitsSection';
import TestimonialsSection from './TestimonialsSection/TestimonialsSection';

export default function HomePage() {
  return (
    <div className="w-100">
      <HeroSection />
      <CertificatesSection />
      <ProductShowcase />
      <CleanIngredientsSection />
      <DiscoverySection />
      <BenefitsSection />
      <ComparisonSection />
      <BrandReelsSection />
      <TestimonialsSection />
    </div>
  );
}
