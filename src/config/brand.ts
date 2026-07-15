const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
const customerPortalUrl = process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL?.trim() ?? "";
const agentPortalUrl = process.env.NEXT_PUBLIC_AGENT_PORTAL_URL?.trim() ?? "";

export const brand = {
  name: "Hogmall",
  legalName: "Hogmall", // TODO(HOGMALL): replace with the approved legal company name.
  shortName: "Hogmall",
  websiteUrl: siteUrl,
  customerPortalUrl,
  agentPortalUrl,
  contactEmail: "", // TODO(HOGMALL): add the approved public contact email.
  supportEmail: "", // TODO(HOGMALL): add the approved support email.
  telephone: "", // TODO(HOGMALL): add the approved public telephone number.
  registeredAddress: "", // TODO(HOGMALL): add the approved registered address.
  companyNumber: "", // TODO(HOGMALL): add the verified company registration number.
  primaryColour: "#E30613",
  secondaryColour: "#FFFFFF",
  sourceCurrency: "GBP",
  payoutCurrency: "USD",
  supportedCountries: [] as string[], // TODO(HOGMALL): populate only after approval.
  regulatoryNotice: "Regulatory and service information will be added after approval by Hogmall.",
  logo: {
    full: "/brand/hogmall-logo.png",
    white: "/brand/hogmall-logo-white.png",
    icon: "/brand/hogmall-icon.png",
  },
} as const;

export const launchPlaceholder = "Approved Hogmall content is required before launch.";
