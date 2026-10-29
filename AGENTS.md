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

- UI-only demo: all data lives in src/lib/demo-data.ts; no DB connection yet (user has an existing Neon DB that must not be altered).
- App shell (sidebar + header) is AppShell wrapped around <Outlet /> in __root.
