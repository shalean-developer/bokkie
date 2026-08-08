# GSC Crawled – currently not indexed audit (2026-08-08)

Google Search Console reported four URLs in this state:

1. `https://www.bokkiecleaning.co.za/blog/10-essential-deep-cleaning-tips-for-every-home`
2. `https://www.bokkiecleaning.co.za/blog/airbnb-cleaning-checklist`
3. `https://bokkiecleaning.co.za/booking/service/office/details`
4. `https://bokkiecleaning.co.za/dashboard/bookings`

## Decisions

- The two `www` blog URLs are legacy-host variants. Keep the blog content indexable on the canonical apex host and permanently redirect `www.bokkiecleaning.co.za/*` to `bokkiecleaning.co.za/*`.
- `/booking/service/office/details` is transactional and already inherits `noindex` metadata from `app/booking/service/[type]/layout.tsx`. Keep it out of the sitemap.
- `/dashboard/bookings` is authenticated/private and already inherits `noindex` metadata from `app/dashboard/layout.tsx`. Keep it out of the sitemap.

No content deletion is required for this four-URL group.
