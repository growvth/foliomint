import { Navbar } from '@/components/domain/navbar';
import { Footer } from '@/components/domain/footer';
import { PricingPlans } from '@/components/domain/pricing-plans';

export default function UpgradePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-24 sm:py-32">
        <PricingPlans
          heading="Upgrade to Pro"
          description="Compare Free and Pro side by side. Subscribe to unlock unlimited AI parses, custom domains, the blog, advanced analytics, and more."
          proCtaLabel="Upgrade to Pro"
          signInCallbackUrl="/upgrade"
        />
      </main>

      <Footer />
    </div>
  );
}
