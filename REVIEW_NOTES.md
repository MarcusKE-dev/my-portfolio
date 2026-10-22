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
- The About page uses one moving signature element, the orbit. Hanging cards retain their design but their entrance swing is static here, and the tech icon strip does not drift. This reconciles the requested pieces with the one-moving-element limit.
- The check script permits “Solutions” only within the verified client name “Dalo Plumbing Solutions”. It still rejects it as a filler noun.
- The default share image and icons were rendered in the site's palette with Space Grotesk and Outfit using Pillow. Assets are committed; optional regeneration does not add a browser library or a production build dependency.
- Prices in both currencies are published starting points, not claims about current exchange rates. The comparison table marks only explicitly listed features as included.

## Existing homepage issues left unchanged by scope

- The homepage has pre-existing claims about project count, retention and Lighthouse scores. They were not copied into new pages or new schema, and were not independently substantiated.
- Existing custom selects lack keyboard semantics, the page lacks a skip link and main landmark, and several muted labels use `--text3`. These were left alone under the restricted homepage edit list. New pages have accessibility additions.
- The existing shared script uses smooth anchor scrolling even under reduced motion. New pages intercept local anchor clicks with reduced-motion-aware scrolling; homepage behaviour is unchanged.

## QA

Final results will be recorded after the browser pass.
