const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
const customerPortalUrl = process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL?.trim() ?? "";
const agentPortalUrl = process.env.NEXT_PUBLIC_AGENT_PORTAL_URL?.trim() ?? "";

export const brand = {
  name: "Xogmall",
  legalName: "Xogmall", // TODO(XOGMALL): replace with the approved legal company name.
  shortName: "Xogmall",
  websiteUrl: siteUrl,
  customerPortalUrl,
  agentPortalUrl,
  contactEmail: "", // TODO(XOGMALL): add the approved public contact email.
  supportEmail: "", // TODO(XOGMALL): add the approved support email.
  telephone: "", // TODO(XOGMALL): add the approved public telephone number.
  registeredAddress: "", // TODO(XOGMALL): add the approved registered address.
  companyNumber: "", // TODO(XOGMALL): add the verified company registration number.
  primaryColour: "", // TODO(XOGMALL): replace after brand colours are approved.
  secondaryColour: "", // TODO(XOGMALL): replace after brand colours are approved.
  sourceCurrency: "GBP",
  payoutCurrency: "USD",
  supportedCountries: [] as string[], // TODO(XOGMALL): populate only after approval.
  regulatoryNotice: "Regulatory and service information will be added after approval by Xogmall.",
  logo: {
    full: "/brand/xogmall-logo.png",
    white: "/brand/xogmall-logo-white.png",
    icon: "/brand/xogmall-icon.png",
  },
} as const;

export const launchPlaceholder = "Approved Xogmall content is required before launch.";
