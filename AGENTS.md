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

- The UI remains a disconnected demo using src/lib/demo-data.ts and page-local indicators; keep future real-data integration explicit to avoid silently mixing sources.
- App shell (sidebar + header) is AppShell wrapped around <Outlet /> in __root.
- Territorial contracts live in territory.contracts.ts, internal RPCs in territory.functions.ts, and server access/guards in territory.server.ts; separate boundaries to keep access code out of browser bundles.
- Keep territorial RPCs fail-closed with no transport and no environment-triggered activation until schema discovery and read-access authorization are approved; keys alone never permit access.
- Integrate Neon only through its managed connector with request-time server-only secrets; no direct PostgreSQL client or browser credentials because the connector owns the connection string.
- Do not expose mutation RPCs until verified server-side authentication, authorization and explicit mutation approval exist; the write guard remains unconditional meanwhile.
