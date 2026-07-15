import { AgentSection } from "@/components/site/AgentSection";
import { CommunityStorySection } from "@/components/site/CommunityStorySection";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { HeroSection } from "@/components/site/HeroSection";
import { HowItWorks } from "@/components/site/HowItWorks";
import { getActiveRate } from "@/lib/rates";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rate = await getActiveRate();

  return (
    <>
      <Header />
      <main>
        <HeroSection rate={rate} />
        <CommunityStorySection />
        <HowItWorks />
        <AgentSection />
      </main>
      <Footer />
    </>
  );
}
