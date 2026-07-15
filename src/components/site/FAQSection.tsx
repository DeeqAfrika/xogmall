import { Plus } from "@phosphor-icons/react/dist/ssr";
import { getSiteContentValues } from "@/lib/site-content";

const customerQuestions = [
  { question: "What is today's Hogmall rate?", answer: "The currently active GBP to USD rate is displayed at the top of this page and is published by an authorised admin." },
  { question: "Is the calculator amount final?", answer: "No. It is a mathematical estimate using the displayed rate and does not represent an offer, fee, payout, or guaranteed amount." },
  { question: "Which countries does Hogmall focus on?", answer: "Supported countries and service availability will be published after approval." },
  { question: "Where are the service terms?", answer: "Approved service and legal terms have not yet been supplied. The placeholder legal pages are not operative and must be replaced before launch." },
  { question: "How do I contact support?", answer: "The approved support email and telephone number are awaiting configuration. The contact form remains disabled until an address is supplied." },
];

const businessQuestions = [
  { question: "How can my business apply to become an agent?", answer: "Use the agent onboarding page to create a private account and submit an individual or limited-company application for admin review." },
  { question: "Where is the agent portal?", answer: "The approved agent portal link is not shown until NEXT_PUBLIC_AGENT_PORTAL_URL is configured." },
  { question: "Can Hogmall add multiple branches to the locator?", answer: "Yes. Admin users can add, edit, draft, and publish multiple agent addresses for the public agent locator, including contact details, opening hours, and map coordinates." },
  { question: "What responsibilities do agents have?", answer: "Approved agent terms and responsibilities must be supplied by Hogmall before an appointment or signature is requested." },
  { question: "Can B2B partners request content or rate updates?", answer: "Approved Hogmall admins can update daily rates and selected public content in the admin area. Compliance-sensitive legal policy text should be reviewed before publication." },
  { question: "Are the downloadable agent forms final?", answer: "No. They are clearly marked workflow placeholders and must be replaced with approved Hogmall documents before launch." },
];

export async function FAQSection() {
  const content = await getSiteContentValues(["faq.customerIntro", "faq.businessIntro"]);

  return (
    <section className="bg-sky-soft py-14 sm:py-16">
      <div className="container-shell">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">Frequently asked questions</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <FAQGroup title="For customers" intro={content["faq.customerIntro"]} questions={customerQuestions} />
          <FAQGroup title="For agents and B2B partners" intro={content["faq.businessIntro"]} questions={businessQuestions} />
        </div>
      </div>
    </section>
  );
}

function FAQGroup({
  title,
  intro,
  questions,
}: {
  title: string;
  intro: string;
  questions: { question: string; answer: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-red-100 bg-white">
      <div className="border-b border-line p-5 sm:p-6">
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{intro}</p>
      </div>
      {questions.map(({ question, answer }) => (
        <details key={question} className="group border-b border-line last:border-b-0">
          <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm px-5 py-4 text-left text-sm font-semibold text-ink sm:px-6">
            {question}
            <Plus aria-hidden="true" size={16} weight="bold" className="shrink-0 text-brand transition-transform group-open:rotate-45" />
          </summary>
          <p className="px-5 pb-5 text-sm leading-6 text-muted sm:px-6">{answer}</p>
        </details>
      ))}
    </div>
  );
}
