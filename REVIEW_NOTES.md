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

To be completed with final QA results. No production deployment or search console submission is part of this repository task.
