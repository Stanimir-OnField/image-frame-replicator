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

## Architecture rules
- All data access goes through query options in `src/lib/api.ts` (mock resolvers today); swap `request()` for fetch to the Rails REST API later — keeps UI untouched by backend migration.
- Routing uses TanStack Router (not React Router) and Tailwind + shadcn (not Bootstrap) — fixed by the platform stack.
- Producer dashboard and customer account share `PanelLayout`; messaging uses one `Messenger` component — avoid duplicated page-specific UI.
