import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import fs from "fs";
import {
  getSitemapRoutes,
  SITE_URL,
  seoRoutes,
  DEFAULT_OG_IMAGE,
  type SEORouteConfig,
} from "./src/seo/seo-routes";

/**
 * Custom Vite plugin to generate sitemap.xml at build time.
 * Reads routes from src/seo/seo-routes.ts (single source of truth).
 * When you add a new route to seo-routes.ts with includeInSitemap: true,
 * it will automatically appear in sitemap.xml on next build.
 */
function generateSitemapPlugin(): Plugin {
  return {
    name: "generate-sitemap",
    apply: "build",
    generateBundle() {
      const routes = getSitemapRoutes();
      const today = new Date().toISOString().split("T")[0];

      const urls = routes
        .map(
          (route: SEORouteConfig) => `  <url>
    <loc>${route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`
        )
        .join("\n");

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: sitemap,
      });
    },
  };
}

/**
 * Custom Vite plugin to generate route-specific HTML files at build time.
 * Reads routes from src/seo/seo-routes.ts. For each public route (except root "/"),
 * it creates a directory in dist/ and writes an index.html file with updated SEO tags.
 * This guarantees Googlebot gets the correct canonical and meta tags immediately.
 */
function generatePrerenderedHTMLPlugin(): Plugin {
  return {
    name: "generate-prerendered-html",
    apply: "build",
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist");
      const indexPath = path.join(outDir, "index.html");

      if (!fs.existsSync(indexPath)) {
        console.warn("[Prerender] index.html not found in build output, skipping HTML generation.");
        return;
      }

      const htmlContent = fs.readFileSync(indexPath, "utf-8");
      console.log(`[Prerender] Starting HTML pre-rendering for ${seoRoutes.length} routes...`);

      for (const route of seoRoutes) {
        // Skip root "/" because the main index.html handles the homepage.
        if (route.path === "/") {
          continue;
        }

        // Only pre-render public routes included in sitemap (or not explicitly excluded).
        if (!route.includeInSitemap) {
          continue;
        }

        const canonical = `${SITE_URL}${route.path}`;
        const title = route.title.includes("GoTripo") ? route.title : `${route.title} | GoTripo`;
        const desc = route.description;
        const ogImage = route.ogImage || DEFAULT_OG_IMAGE;

        // Replace tags in index.html content
        let customizedHtml = htmlContent;

        // 1. Replace <title>
        customizedHtml = customizedHtml.replace(/<title>[^<]*<\/title>/g, `<title>${title}</title>`);

        // 2. Replace description
        customizedHtml = customizedHtml.replace(/<meta name="description" content="[^"]*"\s*\/?>/g, `<meta name="description" content="${desc}" />`);

        // 3. Replace canonical URL
        customizedHtml = customizedHtml.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/g, `<link rel="canonical" href="${canonical}" />`);

        // 4. Replace OG URL, Title, Description, Image
        customizedHtml = customizedHtml.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/g, `<meta property="og:url" content="${canonical}" />`);
        customizedHtml = customizedHtml.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/g, `<meta property="og:title" content="${title}" />`);
        customizedHtml = customizedHtml.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/g, `<meta property="og:description" content="${desc}" />`);
        customizedHtml = customizedHtml.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/g, `<meta property="og:image" content="${ogImage}" />`);

        // 5. Replace Twitter URL, Title, Description, Image
        customizedHtml = customizedHtml.replace(/<meta name="twitter:url" content="[^"]*"\s*\/?>/g, `<meta name="twitter:url" content="${canonical}" />`);
        customizedHtml = customizedHtml.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/g, `<meta name="twitter:title" content="${title}" />`);
        customizedHtml = customizedHtml.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/g, `<meta name="twitter:description" content="${desc}" />`);
        customizedHtml = customizedHtml.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/g, `<meta name="twitter:image" content="${ogImage}" />`);

        // 6. Handle noindex if specified
        if (route.noindex) {
          if (customizedHtml.includes('name="robots"')) {
            customizedHtml = customizedHtml.replace(/<meta name="robots" content="[^"]*"\s*\/?>/g, `<meta name="robots" content="noindex, nofollow" />`);
          } else {
            customizedHtml = customizedHtml.replace("</head>", `  <meta name="robots" content="noindex, nofollow" />\n  </head>`);
          }
        }

        // Determine where to write the file (e.g. dist/explore-india/index.html)
        const relativeRoutePath = route.path.replace(/^\/+/, "");
        const routeDir = path.join(outDir, relativeRoutePath);

        // Create folder recursively and write index.html
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, "index.html"), customizedHtml, "utf-8");
        console.log(`[Prerender] Generated: ${relativeRoutePath}/index.html`);
      }

      console.log("[Prerender] HTML pre-rendering completed successfully!");
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    generateSitemapPlugin(),
    generatePrerenderedHTMLPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
});
