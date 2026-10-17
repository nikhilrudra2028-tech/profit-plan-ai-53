# FarmProfit: working MVP in place

## Keep the existing identity
Preserve FarmProfit’s colors, fonts, farm photography, public landing page, and existing buttons. Update public Login and Get Started links to lead into the real app rather than the current sample planner.

## Sign-in and personal area
- Add a branded `/login` page with email sign-in/signup and a prominent Continue with Google option using the supported integration.
- Send signed-in users to `/dashboard`; provide sign-out and password recovery.
- Require sign-in for `/planner`, `/dashboard`, and saved plan history/details. Keep `/` public and preserve existing public sections.
- Check and report actual provider settings; do not describe Google as active unless configuration is verified.

**Question before authentication implementation:** Do you need user profile data such as a name, avatar, or preferences? Without profiles, use built-in account information only; plans still belong to each account.

## Farm planning and persistence
- Reuse the six existing farm inputs with validation and loading/error states.
- Replace fixed sample outputs with deterministic, explicitly labeled heuristic estimates. Compare crops by investment, revenue, profit, ROI, and risk using farm inputs and visible assumptions, not purported live market prices.
- Allow saving a generated plan and opening it from dashboard/history. Include empty and failure states.
- Keep the disclaimer about yield, market prices, weather, and input costs alongside results.

## Technical approach
- No backend is currently connected. Enable Lovable Cloud for real accounts and durable plan storage, subject to its activation approval; no domain purchase or paid upgrade.
- Use the generated authentication integration and protected route layout. Keep `/auth` compatible with the integration while exposing the requested `/login` page.
- Store farm inputs and complete result snapshots in an owner-scoped table with explicit grants and row-level access policies. Add profiles and an automatic signup trigger only if requested.
- Keep calculations in a small shared module with concrete unit tests; avoid secret-backed AI APIs for this phase.

## Verification and handoff
Test calculations and owner-only permissions, then exercise sign-in → profile → generate → save → history → reopen → sign-out. Check desktop and mobile layouts. Report anything blocked by provider settings, account confirmation, permissions, or Cloud activation, with exact testing steps.