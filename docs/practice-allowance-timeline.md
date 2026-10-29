# Rolling allowance timeline

Free accounts keep the existing 50-question rolling 12-hour allowance. A generated set reserves its questions immediately; that batch returns 12 hours after creation, regardless of answer/completion time. This change explains the existing rule; it does not change enforcement, prices or passes.

`practice_access_status` now returns `asOf`, `windowHours`, and an ordered `releases` array (`at`, `questions`) from the same active, owner-bound allocations used to calculate `remaining`. Only the existing service-role API can execute it. Guest lifetime limits and Pro unlimited access are unchanged; neither receives recurring release entries.

The dashboard shows current availability and three milestones: the next 1 slot back, next 10 slots back, and full 50-slot capacity. A partial allowance also distinguishes the next playable 10-question set from the next 10 returning slots. If fewer than 10 are pending, it says so instead of inventing a date. Over-cap historical Pro usage is accounted for before any free capacity is promised.

At zero capacity, Dashboard and MCQ setup show the next practice time and a link to the existing Pro page. The UI refreshes via the existing access hook at the next release, after generation, on focus/online, and through its background refresh. Expired or inconsistent snapshots never grant local capacity; the UI requests a server refresh.

Validation: deterministic milestone tests; disposable PostgreSQL quota/concurrency/ownership/idempotence/expiry/grant tests; full audit and production build; light/dark desktop/mobile browser checks at 40 available and at the cap; Pro navigation and unlimited state. Browser fixtures are fictional; production verification must separately confirm the read-only RPC extension and deployed bundle.

Deployment: apply `20261029023808_allowance_release_timeline.sql` before the UI. The extension is backward compatible with the old UI; rollback can restore the previous UI without removing the extra metadata or altering allocation records.
