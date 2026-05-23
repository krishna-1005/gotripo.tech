/**
 * Central SEO configuration for all routes.
 *
 * This file is the SINGLE SOURCE OF TRUTH for:
 * 1. Sitemap generation (Vite plugin reads this at build time)
 * 2. Per-page meta tags (AutoSEO component reads this at runtime)
 *
 * When you add a new public page, add it here and it will automatically:
 * - Appear in sitemap.xml on next build
 * - Get proper title, description, OG tags, and Twitter cards
 */

export const SITE_URL = "https://gotripo.tech";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/gotripo-final-logo.png`;

export interface SEORouteConfig {
  /** Route path (must match react-router path, no trailing slash) */
  path: string;
  /** Page title — appended with " | GoTripo" automatically */
  title: string;
  /** Meta description for search engines */
  description: string;
  /** Sitemap priority (0.0 - 1.0) */
  priority: number;
  /** Sitemap change frequency */
  changefreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  /** Whether to include this route in sitemap.xml */
  includeInSitemap: boolean;
  /** Open Graph type (default: "website") */
  ogType?: string;
  /** Custom OG image URL (falls back to default) */
  ogImage?: string;
  /** Whether to add noindex meta tag */
  noindex?: boolean;
}

export const seoRoutes: SEORouteConfig[] = [
  // ─── Core Pages ──────────────────────────────────────────────
  {
    path: "/",
    title: "GoTripo – Group Trip Planning & Travel Expense Split App",
    description:
      "Plan group trips with friends, split expenses, manage itineraries, and collaborate easily with GoTripo.",
    priority: 1.0,
    changefreq: "weekly",
    includeInSitemap: true,
    ogType: "website",
  },
  {
    path: "/explore-india",
    title: "Explore India – Discover Amazing Destinations",
    description:
      "Explore top destinations across India. Find hidden gems, popular tourist spots, and plan your next adventure with GoTripo.",
    priority: 0.9,
    changefreq: "weekly",
    includeInSitemap: true,
  },
  {
    path: "/community",
    title: "Travel Community – Share Your Trip Experiences",
    description:
      "Join the GoTripo travel community. Share photos, stories, and reviews from your trips. Get inspired by fellow travelers.",
    priority: 0.8,
    changefreq: "daily",
    includeInSitemap: true,
  },
  {
    path: "/collaborate",
    title: "Collaborate – Plan Trips Together in Real-Time",
    description:
      "Collaborate with friends and family to plan trips together. Share itineraries, vote on destinations, and split expenses in real-time.",
    priority: 0.8,
    changefreq: "monthly",
    includeInSitemap: true,
  },
  {
    path: "/weekend-trips",
    title: "Weekend Trips – Quick Getaway Ideas Near You",
    description:
      "Discover weekend trip ideas and quick getaways. Find short trips, weekend destinations, and plan your perfect weekend escape.",
    priority: 0.8,
    changefreq: "weekly",
    includeInSitemap: true,
  },

  // ─── Planner Pages ───────────────────────────────────────────
  {
    path: "/trip-type",
    title: "Choose Your Trip Type – Solo, Group, or Family",
    description:
      "Select your trip type and let GoTripo create a personalized travel plan. Choose from solo trips, group adventures, family vacations, and more.",
    priority: 0.7,
    changefreq: "monthly",
    includeInSitemap: true,
  },
  {
    path: "/planner-single",
    title: "Trip Planner – Plan Your Single Destination Trip",
    description:
      "Plan your perfect single-destination trip with GoTripo's AI-powered planner. Get personalized itineraries, budget estimates, and travel tips.",
    priority: 0.7,
    changefreq: "monthly",
    includeInSitemap: true,
  },
  {
    path: "/planner-multi",
    title: "Multi-Destination Planner – Plan Multi-City Trips",
    description:
      "Plan multi-city and multi-destination trips effortlessly. Create connected itineraries across multiple destinations with GoTripo.",
    priority: 0.7,
    changefreq: "monthly",
    includeInSitemap: true,
  },

  // ─── Yatra Module ────────────────────────────────────────────
  {
    path: "/yatra",
    title: "Yatra – Sacred Pilgrimages & Spiritual Journeys",
    description:
      "Plan your sacred yatra with GoTripo. Discover pilgrimages, spiritual journeys, temple tours, and plan every detail of your divine trip.",
    priority: 0.8,
    changefreq: "weekly",
    includeInSitemap: true,
  },
  {
    path: "/yatra/shop",
    title: "Yatra Shop – Pilgrimage Essentials & Travel Gear",
    description:
      "Shop for yatra essentials, pilgrimage supplies, and travel gear. Everything you need for your spiritual journey, delivered to your door.",
    priority: 0.6,
    changefreq: "weekly",
    includeInSitemap: true,
  },

  // ─── Business Pages ──────────────────────────────────────────
  {
    path: "/pricing",
    title: "Pricing – Affordable Plans for Every Traveler",
    description:
      "Explore GoTripo pricing plans. From free trip planning to premium features — find the perfect plan for your travel needs.",
    priority: 0.7,
    changefreq: "monthly",
    includeInSitemap: true,
  },
  {
    path: "/about",
    title: "About GoTripo – Our Story & Mission",
    description:
      "Learn about GoTripo's mission to make group trip planning easy and fun. Meet the team behind the platform.",
    priority: 0.6,
    changefreq: "monthly",
    includeInSitemap: true,
  },
  {
    path: "/careers",
    title: "Careers at GoTripo – Join Our Team",
    description:
      "Explore career opportunities at GoTripo. Join our growing team and help make group travel planning better for everyone.",
    priority: 0.5,
    changefreq: "monthly",
    includeInSitemap: true,
  },

  // ─── Legal Pages ─────────────────────────────────────────────
  {
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "Read GoTripo's privacy policy. Learn how we collect, use, and protect your personal data.",
    priority: 0.3,
    changefreq: "yearly",
    includeInSitemap: true,
  },
  {
    path: "/terms",
    title: "Terms of Service",
    description:
      "Read GoTripo's terms of service. Understand the terms and conditions for using the GoTripo platform.",
    priority: 0.3,
    changefreq: "yearly",
    includeInSitemap: true,
  },
  {
    path: "/cookies",
    title: "Cookie Policy",
    description:
      "Read GoTripo's cookie policy. Learn how we use cookies and tracking technologies on our platform.",
    priority: 0.3,
    changefreq: "yearly",
    includeInSitemap: true,
  },

  // ─── Auth ────────────────────────────────────────────────────
  {
    path: "/auth",
    title: "Sign In or Create Account",
    description:
      "Sign in to your GoTripo account or create a new one. Start planning your group trips today.",
    priority: 0.4,
    changefreq: "monthly",
    includeInSitemap: true,
    noindex: false,
  },

  // ─── Protected / Dynamic Routes (NOT in sitemap) ────────────
  {
    path: "/dashboard",
    title: "Dashboard – Your Trips & Activity",
    description:
      "View your trip dashboard. Manage upcoming trips, track expenses, and see your travel activity.",
    priority: 0,
    changefreq: "daily",
    includeInSitemap: false,
    noindex: true,
  },
  {
    path: "/profile",
    title: "Your Profile",
    description: "View and edit your GoTripo profile.",
    priority: 0,
    changefreq: "monthly",
    includeInSitemap: false,
    noindex: true,
  },
  {
    path: "/settings",
    title: "Settings",
    description:
      "Manage your GoTripo account settings, preferences, and notifications.",
    priority: 0,
    changefreq: "monthly",
    includeInSitemap: false,
    noindex: true,
  },
  {
    path: "/results",
    title: "Trip Results",
    description: "View your AI-generated trip itinerary and recommendations.",
    priority: 0,
    changefreq: "daily",
    includeInSitemap: false,
    noindex: true,
  },
  {
    path: "/trip-details",
    title: "Trip Details",
    description: "View detailed information about your planned trip.",
    priority: 0,
    changefreq: "daily",
    includeInSitemap: false,
    noindex: true,
  },
  {
    path: "/trips",
    title: "Your Trips",
    description: "View and manage all your planned trips.",
    priority: 0,
    changefreq: "daily",
    includeInSitemap: false,
    noindex: true,
  },
  {
    path: "/collaborative-trip",
    title: "Collaborative Trip",
    description: "Plan and manage your collaborative trip with friends.",
    priority: 0,
    changefreq: "daily",
    includeInSitemap: false,
    noindex: true,
  },
  {
    path: "/passport",
    title: "Your Travel Passport",
    description:
      "View your GoTripo travel passport with achievements and travel stats.",
    priority: 0,
    changefreq: "monthly",
    includeInSitemap: false,
    noindex: true,
  },
  {
    path: "/cart",
    title: "Shopping Cart",
    description: "Review items in your cart before checkout.",
    priority: 0,
    changefreq: "never",
    includeInSitemap: false,
    noindex: true,
  },
  {
    path: "/checkout",
    title: "Checkout",
    description: "Complete your purchase securely.",
    priority: 0,
    changefreq: "never",
    includeInSitemap: false,
    noindex: true,
  },
  {
    path: "/orders",
    title: "Your Orders",
    description: "View your order history and track deliveries.",
    priority: 0,
    changefreq: "daily",
    includeInSitemap: false,
    noindex: true,
  },
];

/**
 * Normalizes a pathname by stripping trailing slashes.
 * Ensures "/explore-india/" matches "/explore-india" in the config.
 */
export function normalizePath(pathname: string): string {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

/**
 * Helper to find SEO config for a given pathname.
 * Normalizes trailing slashes before matching.
 * Supports exact matches only (dynamic routes like /yatra/:id
 * won't match and will use defaults).
 */
export function findSEORoute(pathname: string): SEORouteConfig | undefined {
  const normalized = normalizePath(pathname);
  return seoRoutes.find((route) => route.path === normalized);
}

/**
 * Returns routes that should be included in the sitemap.
 */
export function getSitemapRoutes(): SEORouteConfig[] {
  return seoRoutes.filter((route) => route.includeInSitemap);
}
