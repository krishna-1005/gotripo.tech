import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "./SEO";
import { findSEORoute, normalizePath, SITE_URL, DEFAULT_OG_IMAGE } from "./seo-routes";

/**
 * Automatic SEO component that reads the current route
 * and applies the matching SEO configuration from seo-routes.ts.
 *
 * Place this ONCE in your App component. It will automatically:
 * 1. Normalize trailing slashes (redirect /path/ → /path)
 * 2. Set title, description, OG tags, Twitter cards per route
 * 3. Set unique canonical URL per page
 *
 * For pages not in the config (e.g., dynamic routes), it uses defaults.
 * Individual pages can override by rendering their own <SEO> component.
 */
export function AutoSEO() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  // Client-side trailing slash normalization as a safety net.
  // The primary fix is in vercel.json (trailingSlash: false), but
  // this handles cases where users navigate client-side with a trailing slash.
  useEffect(() => {
    if (pathname !== "/" && pathname.endsWith("/")) {
      navigate(normalizePath(pathname) + search + hash, { replace: true });
    }
  }, [pathname, search, hash, navigate]);

  const normalizedPath = normalizePath(pathname);
  const routeConfig = findSEORoute(normalizedPath);

  if (routeConfig) {
    return (
      <SEO
        title={routeConfig.title}
        description={routeConfig.description}
        canonicalPath={routeConfig.path}
        ogType={routeConfig.ogType || "website"}
        ogImage={routeConfig.ogImage || DEFAULT_OG_IMAGE}
        noindex={routeConfig.noindex}
        structuredData={
          routeConfig.path === "/"
            ? {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "GoTripo",
                url: SITE_URL,
                description: routeConfig.description,
                applicationCategory: "TravelApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "INR",
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.8",
                  reviewCount: "150",
                },
              }
            : undefined
        }
      />
    );
  }

  // Default SEO for routes not in the config (dynamic routes, etc.)
  // Uses the normalized path as canonical to prevent duplicates.
  return (
    <SEO
      title="GoTripo – Group Trip Planning & Travel Expense Split App"
      description="Plan group trips with friends, split expenses, manage itineraries, and collaborate easily with GoTripo."
      canonicalPath={normalizedPath}
      noindex={false}
    />
  );
}
