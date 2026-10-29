# Website Acquisition Verification — 2026-10-29

- Nine browser-contract behavioral tests pass: consent refusal/erasure, stable visitor/first-source retention, raw attribution compatibility, disallowed ad-ID removal, real consent updates, exact-authority validation, issue plus OAuth attach flow, network failure continuation and blocked storage. The source-history case verifies first campaign A, activation campaign B, unchanged after an internal OAuth redirect.
- Repository TypeScript check passes. Repository format/lint checks for changed sources pass.
- Production build passes. Global additionally runs all 6,262 static pages and both AI FAQ index/route parity checks. Domestic includes the standalone /app-attribution route in the production build.
- Real Chromium smoke verifies the standalone continuation page renders, the capability query is removed from the browser address, and a lookalike/untrusted authority displays the invalid-link state with no continuation controls. A mocked Global browser flow confirms that Allow posts context and resumes only at the fixed authority callback; production requests were intercepted locally.
- External OAuth bridge requests are mocked in browser smoke; no production token, production account binding, live GA4/Rybbit delivery, native deep-link redemption or ad-platform match is claimed.

The first overseas build was interrupted by a local dev/build output collision; its generated output was preserved outside the worktree, and a clean isolated production rebuild passed. Generated caches and browser-session files are not part of the PR.
