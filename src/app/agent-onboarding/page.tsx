import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AgentOnboardingAuth } from "@/components/onboarding/AgentOnboardingAuth";
import { AgentOnboardingForm } from "@/components/onboarding/AgentOnboardingForm";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AgentApplication, AgentApplicationDocument } from "@/lib/types";

export const metadata: Metadata = {
  title: "Private Agent Onboarding",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Claims = {
  sub?: string;
};

type UserMetadata = {
  full_name?: string;
};

export default async function AgentOnboardingPage() {
  if (!hasSupabaseEnv()) {
    return (
      <OnboardingShell>
        <SetupNotice />
      </OnboardingShell>
    );
  }

  const supabase = await createClient();
  const [{ data: claimsData }, { data: userData }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getUser(),
  ]);
  const claims = claimsData?.claims as Claims | undefined;
  const userId = claims?.sub ?? userData.user?.id;

  if (!userId) {
    return (
      <OnboardingShell>
        <AgentOnboardingAuth />
      </OnboardingShell>
    );
  }

  const applicationResult = await supabase
    .from("agent_applications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  let application = applicationResult.data as AgentApplication | null;

  if (!application && !applicationResult.error) {
    const userMetadata = userData.user?.user_metadata as UserMetadata | undefined;
    const createDraftResult = await supabase
      .from("agent_applications")
      .insert({
        user_id: userId,
        status: "draft",
        full_name: userMetadata?.full_name?.trim() || "",
        email: userData.user?.email?.trim().toLowerCase() || "",
      })
      .select("*")
      .single();

    if (createDraftResult.data) {
      application = createDraftResult.data as AgentApplication;
    } else if (createDraftResult.error?.code === "23505") {
      const retryResult = await supabase
        .from("agent_applications")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      application = retryResult.data as AgentApplication | null;
    }
  }

  const documentsResult = application
    ? await supabase
      .from("agent_application_documents")
      .select("*")
      .eq("application_id", application.id)
      .order("uploaded_at", { ascending: false })
    : { data: [] };

  return (
    <OnboardingShell>
      <AgentOnboardingForm
        userId={userId}
        userEmail={userData.user?.email ?? application?.email ?? ""}
        initialApplication={application}
        initialDocuments={(documentsResult.data || []) as AgentApplicationDocument[]}
      />
    </OnboardingShell>
  );
}

function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f8fc]">
      <header className="border-b border-line bg-white">
        <div className="container-shell flex min-h-20 items-center justify-between gap-4">
          <Link href="/" aria-label="Hogmall homepage" className="focus-ring rounded-lg">
            <Image src="/brand/hogmall-logo.png" alt="Hogmall" width={4000} height={1928} className="h-auto w-[112px]" priority />
          </Link>
          <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-brand">
            Private link
          </span>
        </div>
      </header>
      <main className="container-shell py-10 sm:py-14">{children}</main>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
      <p className="eyebrow !text-amber-700">Setup required</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Connect Supabase to use private agent onboarding.</h1>
      <p className="mt-4 text-sm leading-6 text-amber-900">
        Add the Supabase environment variables, apply the onboarding migration, enable email signup, and disable email confirmation for the private agent onboarding flow.
      </p>
    </div>
  );
}
