# IndexNow

The root file `15e442b4ff7e07be5b8e8b4d36c3bb6d.txt` verifies ownership. Keep it deployed with the site; its contents must match its filename without `.txt`. The key is intentionally served publicly, and requires no environment variable or browser JavaScript.

Before submitting:

1. Deploy the key file and updated pages through the usual deployment process.
2. Make `devjohn.site` the primary domain in Vercel. It currently redirects to `www.devjohn.site`, while the sitemap and canonical URLs use `devjohn.site`. Confirm `https://devjohn.site/15e442b4ff7e07be5b8e8b4d36c3bb6d.txt` returns HTTP 200 directly and contains the key.
3. Preview the request with `npm run indexnow` (all 16 sitemap URLs).
4. For the initial submission, run `npm run indexnow -- --submit --all`.

After publishing added, updated or deleted pages, submit only those URLs:

```sh
npm run indexnow -- --submit https://devjohn.site/about/ https://devjohn.site/services/
```

Omit `--submit` to preview any request. Explicit URLs support deleted pages that have already been removed from the sitemap. They must use the configured site origin and cannot contain fragments. The command checks the live key before posting and stops on redirects, missing files or mismatched contents. It does not run during builds or on visitors' page loads. For future deployment automation, invoke it after a successful production deployment with the URLs changed by that deployment.

The shared endpoint is `https://api.indexnow.org/indexnow`. Participating search engines share submissions, so there is no need to submit separately to every engine. HTTP 200 means received; 202 means received with key validation pending. Neither guarantees indexing or ranking. Do not repeatedly submit unchanged URLs or immediately retry a 429 response.

Protocol and response details: [official IndexNow documentation](https://www.indexnow.org/documentation).
