# App acquisition through the existing browser login

## Outcome

The domestic website continues using its existing Rybbit destination. Downloads remain direct installer links. After download, the App opens its ordinary console OAuth login in the system browser. The console reads the website Cookie and combines the browser-observed visitor with the authenticated global userUid. No acquisition database, redemption API, extra website route or acquisition deep link is needed.

## Website contract

- Only after analytics_storage is granted, reuse/create a random UUID visitor_id, remember the first consented source and emit acquisition_visit / download_click to existing Rybbit. identify(visitor_id) applies only while allowed. Existing anonymous history is not promised to merge automatically.
- Cookie sealos_acquisition_v1 is UTF-8 JSON encoded as unpadded Base64URL: version=1, realm=china, visitor_id, all four consent fields; optional source, platform_ids, sea_attr. Its decoded payload is at most 1800 UTF-8 bytes. No userUid, login token or authorization secret is included.
- Write only on HTTPS sealos.run / www.sealos.run, Domain=sealos.run; Path=/; Secure; SameSite=Lax; Max-Age=2592000. Never write from console or tenant subdomains. Root/www can reuse an existing valid shared visitor and first source.
- analytics_storage defaults unspecified. The optional unchecked checkbox changes analytics permission only, never advertising permission. Rejection/withdrawal clears newly-owned visitor/source localStorage and the shared Cookie. Cross-tab stored denial wins over historical grants; source writes cannot trigger storage loops.
- Capture only source/medium/campaign from bounded campaign labels. Reject emails, phone-like values, control characters and URLs as labels. Landing/referrer omit credentials, search and fragment. First source survives later navigation. Source overflows are omitted, never break download/login.
- Browser GA client ID and Rybbit user ID (maximum 128 characters) are optional aliases, not App installation identities. sea_attr is preserved byte-for-byte only with ad_storage, ad_user_data and ad_personalization granted and a supported version; maximum 512 encoded characters; omit if it would exceed the Cookie budget. Existing overseas URL decoration is unaffected.
- Existing consented website events carry visitor_id, surface=website and source. SDK loading late may queue up to 32 events; withdrawal clears pending events and clears the SDK identity set by this observer.

## Limits and dependencies

The console must implement the same Cookie schema and emit visitor_linked with a verified userUid during the existing OAuth login. The App keeps its own stable installation identity and uses that same userUid after login. Cookie data supplies marketing context only, never proof of identity.

Matching requires the same browser profile, surviving Cookie and consent. A different browser, cleared Cookie or denied permission yields unknown attribution; do not fingerprint or block login. Root and www have separate consent localStorage: withdrawal is synchronized across tabs of the same origin, while cross-origin consent changes require a shared consent manager.

## Verification

Behavior tests cover unknown/denied consent, withdrawal and cross-tab stale grants, UTF-8/size bounds, official-host scope, first touch, source redaction, advertising gates, browser aliases, actual checkbox behavior, and direct download preservation. Typecheck, focused lint/format and production build verify integration. No new /app-attribution page or acquisition issue/redeem endpoint is introduced.
