# SEO page set

All HTML is committed and works on a static host without running a build. These are the intended production URLs, pending deployment and the Vercel primary-domain correction in REVIEW_NOTES.md.

| Page | URL |
| --- | --- |
| Homepage | https://devjohn.site/ |
| Projects | https://devjohn.site/projects.html |
| About | https://devjohn.site/about/ |
| Pricing | https://devjohn.site/pricing/ |
| Services | https://devjohn.site/services/ |
| Business websites | https://devjohn.site/services/web-development/ |
| E-commerce | https://devjohn.site/services/ecommerce-development/ |
| Custom software | https://devjohn.site/services/custom-software-development/ |
| WhatsApp automation | https://devjohn.site/services/whatsapp-automation/ |
| Kenya | https://devjohn.site/web-developer-kenya/ |
| Uganda and Tanzania | https://devjohn.site/web-developer-east-africa/ |
| Nigeria | https://devjohn.site/web-developer-nigeria/ |
| International clients | https://devjohn.site/international-clients/ |
| FAQ | https://devjohn.site/faq/ |
| Contact | https://devjohn.site/contact/ |
| Privacy | https://devjohn.site/privacy/ |
| Custom error page (noindex) | https://devjohn.site/404.html |

## Editing and building

- `src/pages.json`: page metadata, breadcrumbs, schema type and include flags.
- `src/content/`: main content, one HTML fragment per page.
- `src/partials/`: common head, navigation and footer.
- `src/site.mjs`: the shared personal location constant, origin and entity facts.
- `src/pricing.json` and `src/projects.json`: canonical package and project facts used in schema. If John's rates or projects change, update the visible content and these facts together.
- `pages.css` and `pages.js`: additions for the new pages, plus the shared footer utility styles. `style.css` is unchanged. `script.js` retains the original components, with shared mobile-menu accessibility and resize fixes.
- `scripts/timezones.mjs`: calculates and verifies winter/summer offsets, then generates the static overlap graphic and text table.

Run `npm run build`, then `npm run check`. Node 18 or newer is required; there are no package dependencies. Commit the source and generated HTML, sitemap and text exports together. The build deliberately never writes the homepage or Projects page. Their manually maintained shells must be kept aligned when shared partials change.

The PNG and ICO assets are committed. `scripts/render-assets.py` is an optional regeneration tool using Pillow and local copies of the site's Space Grotesk and Outfit fonts. It is not part of the site build or deployment.

## Validation

Results are recorded in [QA_RESULTS.json](QA_RESULTS.json) and [REVIEW_NOTES.md](../REVIEW_NOTES.md). `scripts/browser-check.cjs` is an optional browser QA runner using an existing Playwright installation. Set `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` for tools outside the project. It is not a production dependency.

## Tasks for John

1. Add devjohn.site as a domain property in Google Search Console with DNS verification. Submit https://devjohn.site/sitemap.xml and request indexing for Home, About, Pricing and Contact. Repeat in Bing Webmaster Tools.
2. Use the same identity and site link on LinkedIn, GitHub and other public profiles: “Dev John | John Mwaura, Web and Software Developer”. Add a GitHub profile README linking to the site.
3. Add an ABC Systems founder or team mention linking to https://devjohn.site/about/.
4. Ask past clients for permission before adding a “Website by Dev John” footer credit linking to the site.
5. Set devjohn.site as the primary Vercel domain and redirect www to it. After deploying, verify that dev-john.vercel.app permanently redirects to devjohn.site, including project and folder paths.
6. Ask clients for genuine public recommendations, such as LinkedIn or Google Business Profile reviews where applicable.
7. Review REVIEW_NOTES.md, confirm the unresolved business terms and approve or remove any copy you disagree with.
8. Review Search Console after two to four weeks, especially the queries “Dev John” and “John Mwaura”.

Also validate key pages in Schema Markup Validator and Google's Rich Results Test. FAQ schema does not imply Google FAQ rich-result eligibility. Lighthouse scores and actual production routing still need a post-deployment check.
