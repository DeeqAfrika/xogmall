import { AboutSection } from "@/components/site/AboutSection";
import { AgentLocatorSection } from "@/components/site/AgentLocatorSection";
import { AgentSection } from "@/components/site/AgentSection";
import { EastAfricaSection } from "@/components/site/EastAfricaSection";
import { FAQSection } from "@/components/site/FAQSection";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { HeroSection } from "@/components/site/HeroSection";
import { HowItWorks } from "@/components/site/HowItWorks";
import { RateBanner } from "@/components/site/RateBanner";
import { ReceiveMethods } from "@/components/site/ReceiveMethods";
import { TrustSafetySection } from "@/components/site/TrustSafetySection";
import { getActiveRate } from "@/lib/rates";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rate = await getActiveRate();

  return (
    <>
      <RateBanner rate={rate} />
      <Header />
      <main>
        <HeroSection rate={rate} />
        <ReceiveMethods />
        <HowItWorks />
        <EastAfricaSection />
        <AgentSection />
        <AgentLocatorSection />
        <AboutSection />
        <TrustSafetySection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
