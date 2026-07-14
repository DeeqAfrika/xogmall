import { Footer } from "./Footer";
import { Header } from "./Header";
import { RateBanner } from "./RateBanner";
import { getActiveRate } from "@/lib/rates";

export async function PublicPageShell({ children }: { children: React.ReactNode }) {
  const rate = await getActiveRate();

  return (
    <>
      <RateBanner rate={rate} />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
