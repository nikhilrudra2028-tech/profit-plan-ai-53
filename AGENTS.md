<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use generated Cloud Auth and its pathless authenticated layout for personal routes; keep the marketing route public to separate private UI from crawlable content.
- Store complete plan input and result snapshots in owner-scoped Cloud rows; RLS is the authoritative access boundary.
- Keep versioned deterministic crop estimates in a shared pure module with unit tests so demonstration figures remain reproducible and explainable.
- Maintain a single root account-state subscriber for identity changes and clear cached private queries before sign-out to prevent stale private UI.
- Capture password recovery before root auth initialization and expose it through account state; reset pages must not add competing auth subscribers.
- Merge FarmButton variant and caller classes with the shared cn helper so responsive visibility and control overrides resolve consistently.
