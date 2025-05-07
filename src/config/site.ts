export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter?: string;
    github?: string;
  };
  mainNav: NavItem[];
  footerNav?: NavItem[];
};

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ReactNode; // Or specific icon type if using a library like Lucide
  label?: string;
};

export const siteConfig: SiteConfig = {
  name: "ERIMTECH AI",
  description: "Experience the future with ERIMTECH AI: Advanced Chat, Code Generation, Image Analysis, and more.",
  url: "https://erimtech.ai", // Replace with your actual domain
  ogImage: "https://erimtech.ai/og.jpg", // Replace with your actual OG image URL
  links: {
    // twitter: "https://twitter.com/erimtech",
    // github: "https://github.com/erimtech/erimtech-ai",
  },
  mainNav: [
    {
      title: "Features",
      href: "/#features",
    },
    {
      title: "Pricing",
      href: "/#pricing",
    },
    {
      title: "Docs",
      href: "/developer", // Link to developer page
    },
    {
      title: "Chat",
      href: "/chat",
    },
  ],
  footerNav: [
    {
      title: "Privacy Policy",
      href: "/privacy",
    },
    {
      title: "Terms of Service",
      href: "/terms",
    },
    {
      title: "Contact",
      href: "/contact",
    }
  ]
};
