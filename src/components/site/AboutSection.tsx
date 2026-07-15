import Image from "next/image";
import { Briefcase, FirstAid, GraduationCap, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { getSiteContentValues } from "@/lib/site-content";

const moments = [
  { icon: UsersThree, label: "Public rate", text: "One active GBP to USD rate is displayed publicly." },
  { icon: GraduationCap, label: "Calculator", text: "Enter GBP or USD to calculate the other amount." },
  { icon: FirstAid, label: "Agent locator", text: "Only published agent locations appear publicly." },
  { icon: Briefcase, label: "Agent onboarding", text: "Private applications and document uploads for admin review." },
];

const highlights = [
  "Independent Hogmall configuration",
  "Private Supabase data boundary",
  "Admin-controlled publishing",
];

export async function AboutSection() {
  const content = await getSiteContentValues(["about.title", "about.body"]);

  return (
    <section id="about" className="bg-white py-14 sm:py-16">
      <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="rounded-3xl bg-gradient-to-br from-navy via-brand-dark to-brand p-7 text-white shadow-[0_24px_70px_rgba(76,5,8,0.18)] sm:p-9">
          <p className="eyebrow !text-red-200">About Hogmall</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{content["about.title"]}</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-red-100 sm:text-base">
            {content["about.body"]}
          </p>
          <div className="mt-7 grid gap-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold">
                <span className="size-2 rounded-full bg-white/80" />
                {highlight}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <div className="relative min-h-64 overflow-hidden rounded-3xl sm:min-h-72">
            <Image
              src="/images/hogmall-community-connection.png"
              alt="Family members connecting by phone across two homes"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {moments.map(({ icon: Icon, label, text }) => (
              <div key={label} className="min-h-40 rounded-2xl border border-red-100 bg-sky-soft p-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm"><Icon aria-hidden="true" size={24} weight="duotone" /></span>
                <h3 className="mt-5 text-base font-bold text-ink">{label}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
