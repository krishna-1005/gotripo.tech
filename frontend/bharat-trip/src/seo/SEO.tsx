import { Helmet } from "react-helmet-async";
import { SITE_URL, DEFAULT_OG_IMAGE } from "./seo-routes";

interface SEOProps {
  /** Page title — pass the full title for homepage, or a short title for other pages */
  title?: string;
  /** Meta description */
  description?: string;
  /** Canonical URL path (e.g., "/about") */
  canonicalPath?: string;
  /** Open Graph type (default: "website") */
  ogType?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Whether to add noindex meta tag */
  noindex?: boolean;
  /** Additional structured data (JSON-LD) */
  structuredData?: Record<string, unknown>;
}

/**
 * Reusable SEO component using react-helmet-async.
 *
 * Use this in individual page components when you need
 * custom/dynamic SEO data (e.g., trip details page with
 * dynamic title). For static routes, the AutoSEO component
 * handles everything automatically.
 *
 * @example
 * ```tsx
 * <SEO
 *   title="My Custom Page Title"
 *   description="A custom description for this page"
 *   canonicalPath="/custom-page"
 * />
 * ```
 */
export function SEO({
  title = "GoTripo – Group Trip Planning & Travel Expense Split App",
  description = "Plan group trips with friends, split expenses, manage itineraries, and collaborate easily with GoTripo.",
  canonicalPath = "/",
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  structuredData,
}: SEOProps) {
  // Ensure canonical URL matches sitemap exactly:
  // Homepage: https://gotripo.tech (no trailing slash)
  // Other pages: https://gotripo.tech/explore-india (no trailing slash)
  const canonicalUrl =
    canonicalPath === "/"
      ? SITE_URL
      : `${SITE_URL}${canonicalPath}`;
  const fullTitle = title.includes("GoTripo") ? title : `${title} | GoTripo`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="GoTripo" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
