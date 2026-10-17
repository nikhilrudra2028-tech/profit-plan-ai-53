# FarmProfit MVP

- [x] Recheck current build/runtime status, hosted auth settings, and public end-to-end behavior; preserve design and paid settings.

- [x] Use authenticated account name/email only; no extra profiles, avatars, or preferences.
- [x] Verify hosted settings: Google and email enabled, signups allowed, email confirmation required, anonymous signups disabled.
- [x] Add branded login/signup/reset and session-aware navigation.
- [x] Protect planner, dashboard, and saved history while retaining public landing.
- [x] Add owner-scoped persistent farm plans and transparent calculations.
- [x] Verify 10 calculation tests, signed-out protection, owner policies/grants, anonymous empty reads, clean database linter, and public mobile layouts.
- [x] Fix reset-link initialization race using the existing root account state; recheck invalid recovery and public flows without runtime errors.
- [ ] Verify signed-in generate/save/reopen/delete/sign-out on desktop and mobile — blocked until the user creates an account; no auth users exist.
- [ ] Verify actual Google sign-in — requires the user's Google interaction.
- [ ] Verify two-account RLS isolation with persisted rows — blocked until real accounts exist.
- [x] Explain account testing requirements and completed work.