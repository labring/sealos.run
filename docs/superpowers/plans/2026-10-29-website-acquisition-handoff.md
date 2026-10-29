# Website Acquisition Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Approved implementation and PR creation require no additional execution interview.

**Goal:** Implement the website portion of #584 using the approved OAuth bridge and one-time acquisition API.
**Architecture:** The website owns consent-gated visitor/source state. The authority owns capabilities and trusted account persistence. A tracker-free bridge posts bounded context and resumes a fixed authority path.
**Tech Stack:** Existing Next.js, React and TypeScript; Node's built-in test runner through the existing TypeScript compiler.

### Task 1: Context and request contract

- [x] Add the consent-aware acquisition-handoff module and the behavioral request tests.
- [x] Cover unknown/denied permission, retained first source, raw sea_attr, platform aliases, exact origins, timeouts and blocked storage.
- [x] Run node --test scripts/test-acquisition-handoff.mjs and keep the actual output.

### Task 2: Browser integration

- [x] Add the global observer, explicit download choice, standalone bridge/continuation page and download continuation links.
- [x] Keep all third-party analytics out of the capability-bearing route.
- [x] Preserve the original URL and pending request across effect replay.
- [x] Complete the real-browser smoke and record its external behavior.

### Task 3: Delivery

- [x] Run the repository type/lint/format/build checks and report any failure without masking it.
- [ ] Review the diff for secrets, unrelated files and contract drift; commit only the task files.
- [ ] Push an isolated branch and create a reviewable draft PR linked to #584 and the backend dependency.

Production China/Global OAuth, installation redemption and business conversion acceptance require the companion repositories and configured services; they are not claimed by local website checks.
