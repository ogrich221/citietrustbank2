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
- tsconfig keeps noPropertyAccessFromIndexSignature, noUncheckedIndexedAccess and exactOptionalPropertyTypes off — existing transfer/portal code relies on looser typing.
- Wire address fields and required-address validation are shared across both transfer entry points to keep recipient-bank details consistent; older demo records may omit addresses.
- Banking workspace pages are explicitly demonstrations, not live banking or secure staff access; do not treat browser profile selection as authorization.
- Use the shared back control for workspace navigation so backward steps retain form details and display the bank watermark.
