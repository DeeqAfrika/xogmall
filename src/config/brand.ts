const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
const customerPortalUrl = process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL?.trim() ?? "";
const agentPortalUrl = process.env.NEXT_PUBLIC_AGENT_PORTAL_URL?.trim() ?? "";

export const brand = {
  name: "Hogmall",
  legalName: "Hogmall Ltd",
  shortName: "Hogmall",
  websiteUrl: siteUrl,
  customerPortalUrl,
  agentPortalUrl,
  contactEmail: "hogmall2@gmail.com",
  supportEmail: "hogmall2@gmail.com",
  telephone: "+44 7538 880330",
  registeredAddress: "77 High Street, Unit 6, London, Brent, NW10 4NS, United Kingdom",
  companyNumber: "09140919",
  fcaReferenceNumber: "710756",
  regulatoryType: "PSD",
  paymentServicesStatus: "Small Payment Institution",
  paymentServicesStatusSince: "4 May 2018",
  companiesHouseUrl: "https://find-and-update.company-information.service.gov.uk/company/09140919",
  fcaRegisterUrl: "https://register.fca.org.uk/s/search?q=710756&type=Companies",
  primaryColour: "#E30613",
  secondaryColour: "#FFFFFF",
  sourceCurrency: "GBP",
  payoutCurrency: "USD",
  supportedCountries: [] as string[], // TODO(HOGMALL): populate only after approval.
  regulatoryNotice: "Hogmall Ltd appears on the Financial Services Register as a Small Payment Institution (firm reference number 710756). Registration does not mean every activity is protected. Money held with a Small Payment Institution is not protected by the Financial Services Compensation Scheme (FSCS).",
  logo: {
    full: "/brand/hogmall-logo.png",
    white: "/brand/hogmall-logo-white.png",
    icon: "/brand/hogmall-icon.png",
  },
} as const;

export const launchPlaceholder = "Approved Hogmall content is required before launch.";
