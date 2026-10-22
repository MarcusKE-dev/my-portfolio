# Review notes for John

## Audit (21 October 2026)

- The tracked crawler file is already `robots.txt` in lowercase. No rename is needed or possible from `Robots.txt`.
- The existing Projects page already uses John Mwaura and Dev.John. No Marcus identity text was found in its visible branding. The GitHub handle remains MarcusKE-dev as supplied.
- All listed PDFs, styles, scripts, images and both existing pages are present. There were no favicon files, root hosting configuration, redirects or header rules.
- `.gitignore` excludes `.netlify`. Local `.netlify/state.json` records a Netlify site and `.netlify/netlify.toml` is generated local CLI state. This does not establish current production hosting.
- Live HTTP headers identify Vercel. `https://devjohn.site/projects.html` returns 308 to `https://www.devjohn.site/projects.html`, which returns 200 without dropping `.html`. The requested canonical origin remains https://devjohn.site. Change Vercel's primary domain to devjohn.site and redirect www to it. This is a dashboard/domain setting, not something to override blindly in repository code.
- The homepage viewport deliberately disables pinch zoom. It is preserved as requested. New pages permit zoom and use 16px inputs on phones.

## Facts and unpublished terms

The new copy uses the supplied facts, homepage service/pricing/stack/principles and existing project descriptions. Generic planning advice and example workflows describe possibilities, not completed projects, contractual promises or included features. No new client results, ratings, testimonials, international project history or service levels are asserted.

Please confirm before publishing any additional terms:

- Delivery times and how deadlines are agreed.
- Deposits, payment schedules, revisions, cancellations and refunds.
- Maintenance scope, ongoing support, hosting and domain costs.
- Preferred payment methods for overseas clients and invoicing currency arrangements.
- Whether Kenya or Nairobi (or another location) should be the public personal location. The shared build constant uses Kenya; ABC Systems remains Nairobi as supplied.
- Any prior projects in Uganda, Tanzania, Nigeria, USA, Canada or UK. None are claimed.

## Form compatibility

The Contact form retains the homepage Web3Forms endpoint, public access key, subject, botcheck and all named fields and option amounts. Its visible range punctuation and option values use “to” instead of forbidden en dashes. Keyboard semantics are added progressively on new pages. Homepage form behaviour and source remain unchanged. The inherited script's success message contains an exclamation mark and check mark; the new-page enhancement presents the same success meaning in plain text.

## Deployment and validation

- The old `dev-john.vercel.app` homepage returns 200 and has the same byte length and content as this repository. A host-conditional 301 preserving the path is included in `vercel.json`. It only takes effect after deployment to that Vercel project. No production deployment or search console submission was performed.
- Vercel configuration uses committed HTML with no build command, preserves `.html` URLs, and enables trailing slashes for folder pages. File extensions are exempt from the trailing-slash redirect. Vercel uses root `404.html` for unmatched static routes. See [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json) and [custom 404 documentation](https://vercel.com/kb/guide/custom-404-page).
- The live www redirect must be reversed in Vercel's domain settings before expecting requested canonicals to match production responses. No www rule was added that might loop against that dashboard redirect.
- On any alternative host, check directory indexes, the `.html` Projects URL, and an actual HTTP 404 status with the custom page. Local Netlify state is not evidence that its production pretty-URL setting applies.
- Generated pages, sitemap and plain-text exports are committed. Run `npm run build` after editing `src/`. The builder never writes `index.html` or `projects.html`; their shells need the same manual partial update if navigation/footer content changes later.

## AI and search expectations

- Content, consistent facts, question-and-answer sections, readable HTML and crawler access are the main work. No AI provider has confirmed that it ranks sites using `llms.txt`. It is an inexpensive extra, not a ranking lever. Google explicitly says it has no positive or negative effect on Google Search visibility.
- The brief's Google FAQ rich-result note is now outdated. Google discontinued FAQ rich results in May 2026 and removed the documentation in June. FAQPage remains here as structured questions and answers, without a rich-result promise. See [Google's documentation updates](https://developers.google.com/search/updates).
- Google-Extended does not control inclusion or ranking in Google Search. It controls Gemini training and grounding uses. Other provider tokens have their own purposes, so “all AI tokens only control training” would be inaccurate. These tokens are allowed as requested; John can change individual entries to `Disallow: /` later. See [Google crawler documentation](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers).
- Brand search changes can take weeks and rankings cannot be guaranteed. Check the key pages in [Schema Markup Validator](https://validator.schema.org/) and [Google Rich Results Test](https://search.google.com/test/rich-results). JSON parsing and internal graph checks do not replace vocabulary validation or Google's eligibility rules.

## Content decisions that need review

- No factual claims outside the authorised material were added. Preparation advice and hypothetical uses are labelled as suggestions or possibilities. They do not assert past client work or package inclusion.
- Time-zone comparisons are additional derived facts requested by the brief, checked with `scripts/timezones.mjs` and the runtime's IANA/Intl data for January and July 2026. A normal Kenyan 09:00 to 17:00 day has one shared hour with Eastern working hours in summer, none in winter, and no Pacific overlap in either season. The copy corrects the brief's broader American-morning assumption and does not publish support hours.
- The initial About page kept the icon strip static. At John’s request, the follow-up restores the original two marquee rows moving in opposite directions. Reduced-motion users get static rows without duplicate chips. Hanging cards retain their static entrance.
- The check script permits “Solutions” only within the verified client name “Dalo Plumbing Solutions”. It still rejects it as a filler noun.
- The default share image and icons were rendered in the site's palette with Space Grotesk and Outfit using Pillow. Assets are committed; optional regeneration does not add a browser library or a production build dependency.
- Prices in both currencies are published starting points, not claims about current exchange rates. The comparison table marks only explicitly listed features as included.

## Existing homepage issues left unchanged by scope

- The homepage has pre-existing claims about project count, retention and Lighthouse scores. They were not copied into new pages or new schema, and were not independently substantiated.
- The existing UWAZI GitHub button points to `#`. No source repository URL was invented, and new project links use its real live platform.
- Homepage custom selects still lack keyboard semantics, the page lacks a skip link and main landmark, and several muted labels use `--text3`. These were left alone under the restricted homepage edit list. New pages have accessibility additions.
- The existing shared script uses smooth anchor scrolling even under reduced motion. New pages intercept local anchor clicks with reduced-motion-aware scrolling; homepage behaviour is unchanged.

- Schema.org marks the generic ProfessionalService type as deprecated. It is retained as explicitly requested and the same node also has type Service, which makes provider and serviceType valid properties. The stable business ID is unchanged. See [ProfessionalService](https://schema.org/ProfessionalService) and [provider](https://schema.org/provider).

## QA

- `npm run build` generates 15 new pages without writing the existing homepage or Projects page.
- `npm run check`: 3,261 assertions, zero failures, zero warnings across 17 pages. This includes exact form parity after normalising only range punctuation.
- Browser matrix: all 17 pages opened in dark and light at 360, 768, 1024 and 1440 CSS pixels (136 renders). No horizontal page overflow, broken local images or JavaScript page errors.
- Keyboard pass: page Tab traversal, skip links, menu open/close, Escape focus restoration and custom select selection. New-page mobile targets were measured at least 44 by 44 CSS pixels.
- Reduced motion: no running animations on inner pages. With motion enabled, both circle theme directions were exercised on all 16 inner pages.
- Contact success tested with an intercepted Web3Forms response. No real test enquiry was delivered. The endpoint, access key, subject, botcheck and named fields match the homepage after the documented punctuation change.
- Pricing table scrolls inside its own container. Local unknown paths return HTTP 404 with the custom page in the test server. Production routing still needs checking after deployment.
- Real font files for Outfit, Space Grotesk and JetBrains Mono were served locally during browser checks. External tech-icon requests were intentionally blocked to exercise their existing letter fallback. Live CDN and production network performance were not measured.
- Visual review used captured pages in both themes, with phone and desktop screenshots and the full requested viewport matrix. Shared footer headings and tap sizes were corrected to stay consistent across pages.
- Important text token contrast: dark muted text on the card background is 5.34:1; light muted text on white is 8.18:1. Blue links are 8.00:1 on black and 5.86:1 on the light background. New form boundaries use the same readable token; focus rings remain blue. Decorative separators and the logo dot are not used to convey required text.
- The initial SEO release preserved `style.css` and `script.js`. The follow-up keeps `style.css` unchanged and updates the shared mobile menu logic in `script.js`, including focus, inert state and closing on desktop resize.
- Lighthouse is not installed in the environment. No scores are claimed. New pages use no framework or extra browser library, reserve image space and use small WebP portraits. Measure real mobile scores after deployment.
- Schema Markup Validator and Google Rich Results Test were not run. Local JSON parsing/reference checks pass; run the external validators on the deployed key pages.
- See `docs/QA_RESULTS.json` for the compact results and `docs/SEO_PAGES.md` for every page URL, editing instructions and all eight follow-up tasks.


## Mobile navigation and About follow-up

John requested the shared mobile menu repair and restoration of the two moving technology rows. All services now opens `/services/` consistently. The homepage mobile About, Pricing and Contact links open their dedicated pages.

The drawer follows the measured header height, keeps its links inside the viewport and scrolls on short screens. Shared keyboard handling covers the homepage as well as inner pages. Resizing to desktop closes the menu and releases the page scroll lock. The About technology rows reuse the original left/right marquee animations, with static rows for reduced motion.

Validation: 170 page/theme/viewport layouts, including 320px-high screens, passed. Keyboard focus, real All services navigation, desktop resizing, opposite icon-row movement at 360/768/1024/1440px, and reduced motion passed without JavaScript page errors. The static check passes 3,257 assertions with zero failures or warnings. The earlier 3,261 total reflects homepage anchor checks before the mobile links were changed to dedicated pages.

Follow-up menu text contrast was checked on Home, Services, Contact and About in both themes, including the current Contact button. The lowest measured ratio was 5.80:1.
