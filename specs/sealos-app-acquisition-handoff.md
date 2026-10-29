# Website to Sealos App Acquisition Handoff

Approved scope: [labring/sealox#584](https://github.com/labring/sealox/issues/584), with phase-one delivery through [#581](https://github.com/labring/sealox/issues/581). This PR implements the website owner only; native redemption, OAuth persistence and downstream event collection are companion changes.

## Behavior and ownership

- The website owns a random visitor ID and first/last source snapshots only after an actual analytics permission. A download-page checkbox and the continuation page provide a deliberate analytics-only choice. Advertising permission is never manufactured.
- Existing tracker Consent Mode updates take precedence over the stored choice. An unknown or declined choice sends neither visitor ID, source, raw attribution nor platform aliases. Declining clears the new local identity/source keys and does not block login or opening Sealos.
- New acquisition_visit and download_click events carry visitor_id for future joins. A download click is not an installation. Existing GA cookie IDs and an explicitly identified Rybbit user may be handed off as aliases when allowed; getUserId is not assumed to expose Rybbit's anonymous server identity. Previously uninstrumented histories cannot be recovered by the new ID.
- First source is retained as source, the latest website touch as last_source and the latest qualified non-direct touch as activation_source. Internal OAuth bridge navigation does not replace a campaign. Landing/referrer query strings and fragments are not forwarded. Existing sea_attr is forwarded byte-for-byte only when its schema is supported and its ad identifiers are allowed; otherwise it is omitted rather than rewritten under an existing hash.
- The unlocalized /app-attribution page has a tracker-free HTML layout and no-referrer policy. A one-time capability is removed from the address bar before subsequent navigation. The original capability survives React StrictMode effect replay, and a single pending POST is reused.
- The only accepted authority is the site's configured exact public-cloud origin. Reject credentials, path/query overrides and lookalike hosts. There is no caller-supplied return URL.

## Cross-repository contract

OAuth bridge URL: /app-attribution?handoff=<short-capability>&authority=<configured-origin>.

POST /api/auth/oauth2/code/attribution on that authority with version:1, handoff, consent and the permitted visitor_id / sea_attr / source / activation_source / last_source / platform_ids. Consent has analytics_storage, ad_storage, ad_user_data and ad_personalization, each granted/denied/unspecified. Source uses source, medium, campaign, landing_page, referrer and an ISO8601 timestamp.

After the POST finishes or fails (five-second bound), navigate only to the fixed authority /api/auth/oauth2/code/attribution?handoff=<same-capability> GET. The authentication backend owns browser-cookie validation and continuation of the exact original OAuth request. Website failure cannot create an account binding or block normal authentication.

The explicit open-App action POSTs the same permitted context without handoff to /api/marketing/acquisition/issue. A successful raw JSON response contains code and ISO8601 expires_at. Only a bounded unexpired code produces zcode://sealos/acquisition?code=...&authority=.... No OAuth access/refresh token, PKCE verifier, account ID or installation secret enters the website. Declining opens the existing plain App link directly.

## Verification and rollout

Run node --test scripts/test-acquisition-handoff.mjs for the complete website-side request contract, consent, first-source retention, raw attribution compatibility, exact-origin validation, storage failure and failed-network continuation. Typecheck and build with each repository's existing commands. Browser smoke verifies the standalone bridge renders, strips capability query parameters and rejects an untrusted authority without contacting it.

Merge/release with the companion authentication backend and native App support. Validate once in China and once in Global using a real browser download, App first open, browser OAuth, trusted account binding and later deployment/payment queries. A passing website test or HTTP response does not prove a production account binding or advertising conversion.

Known limit: first-time users who have not consented have no persistent visitor history. Granting permission later starts observed linkage; it does not retroactively recover missing events. Global GTM event-tag configuration and each destination's query evidence remain operational acceptance work. No sGTM, ad platform secret or production consent declaration is deployed by this PR.
