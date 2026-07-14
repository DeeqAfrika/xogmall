"use client";

import { PaperPlaneTilt } from "@phosphor-icons/react";
import type { FormEvent } from "react";
import { brand } from "@/config/brand";

export function SupportRequestForm() {
  function submitSupportRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const topic = String(formData.get("topic") || "Support request").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const reference = String(formData.get("reference") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Topic: ${topic}`,
      `Transfer reference: ${reference || "Not provided"}`,
      "",
      "Message:",
      message,
    ].join("\n");

    if (!brand.supportEmail) return;
    window.location.href = `mailto:${brand.supportEmail}?subject=${encodeURIComponent(`${brand.name} support - ${topic}`)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form id="support" onSubmit={submitSupportRequest} className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-7">
      <div>
        <p className="eyebrow">Support request</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Ask {brand.name} for support</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          {brand.supportEmail ? `Share the details below and your email app will open with a prepared message to ${brand.name} support.` : "The approved support email must be configured before this form can send a message."}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" name="name" autoComplete="name" required />
        <TextField label="Email address" name="email" type="email" autoComplete="email" required />
        <TextField label="Phone number" name="phone" type="tel" autoComplete="tel" />
        <label>
          <span className="text-sm font-semibold text-ink">Support topic</span>
          <select name="topic" className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100">
            <option>Transfer support</option>
            <option>Payout availability</option>
            <option>Agent support</option>
            <option>Becoming an agent</option>
            <option>Complaint or feedback</option>
          </select>
        </label>
      </div>

      <div className="mt-4">
        <TextField label="Transfer reference" name="reference" />
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-ink">How can we help?</span>
        <textarea
          name="message"
          required
          rows={6}
          className="mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100"
        />
      </label>

      <button type="submit" disabled={!brand.supportEmail} className="focus-ring mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
        <PaperPlaneTilt size={18} weight="bold" />
        Prepare support email
      </button>
    </form>
  );
}

function TextField({
  label,
  name,
  type = "text",
  autoComplete,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-sm font-semibold text-ink">{label}{required ? " *" : ""}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100"
      />
    </label>
  );
}
