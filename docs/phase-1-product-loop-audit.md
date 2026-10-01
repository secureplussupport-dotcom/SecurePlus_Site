# Phase 1 product-loop and technical audit

Audit date: **1 October 2026 (Asia/Kuala_Lumpur)**. Source baseline: **`16854a5a29deeaaf4b72f388ee60a3ec10b14e3e`**, branch `main`.

Scope: read-only inspection, authenticated database SELECTs, pure in-memory replays of existing functions, and existing repository checks. This document is the only task-authored file. No application behavior, content tags, schema, migrations, production records, or UI were changed. Build output is generated verification output, not a product edit.

Authority: the entire `docs/secureplus-rebrand-master-plan.md` was read. Especially relevant: product loop lines 128–158; practice and entitlements 317–359; mastery requirements 361–579; measurement 581–604; phase boundaries 631–659; acceptance 691–738. The specific Phase 1 request overrides the master plan's suggestion to tag the pilot now: this report proposes a pilot model but does **not** apply tags or implement a new calculator.

Evidence notation: `path:line–line` refers to the audited repository baseline. **DB-1…DB-5** identify authenticated live read results recorded below; database observations do not have repository line numbers. **Replay** means executing current pure functions with synthetic data, not observing a signed-in production session. UI findings are source inspection, not screenshot or browser verification.

## 1. Executive summary

**SecurePlus has question-level adaptive ranking and linked learning content, but does not yet have the concept-level Diagnose → Understand → Strengthen → Prove loop in the approved plan.** The primary blocker is evidence integrity and content mapping, not homepage copy.

1. The complete effective bank inspected contains **395 MCQs and 88 PBQs**. All have valid chapter-aligned objective codes, difficulty, and explanations. **Zero** have canonical primary/secondary concept metadata. MCQs have topic strings; PBQs do not have a `topic` field. “Missing metadata” should therefore mean **concept metadata**, not missing objective codes across this published bank.
2. Supabase is connected in this audit. The live attempt table has only ten columns. Selected answer, topic, difficulty, timing, intervention/review source, content version, and algorithm version are absent. A replay shows an unseen Business Continuity question's score falling from **32 locally to 8 after cloud serialization/reload**, solely because topic is lost.
3. An isolated miss on **m032 (RTO)** recommends `risk-resilience-governance` first and `resilience-assets-physical` second. The corresponding 18-card weak-area deck includes **none of RTO, RPO, MTTR**. There is no MTD card in the 313-card collection. This is a reproducible mapping failure.
4. The original m032 can be retried immediately; it scores **146** in chapter repair versus **14** for the other direct RTO question m635. A correct immediate retry clears the latest-miss flag. There is no concept proof state or requirement for distinct scenarios and delayed evidence.
5. Free learners' MCQ explanations are Pro-gated; the free Deep Dive is one Domain 2 lesson, while all four Domain 1 lessons are locked. Baseline free PBQ access is only p001. Exam Mode can request 100% PBQs. Each conflicts with approved Phase 3 requirements.
6. Live deployment drift is material: the database coin function charges **30 / 150** for PBQ / exam voucher; the checked-in UI and SQL specify **50 / 70**. The live attempts table lacks the session-summary columns the checked-in server endpoint writes. These are verified schema/function differences; no purchase or session-write request was made.
7. `npm run build`, the full `npm run audit` chain, and document whitespace verification pass. Passing structural audits does not establish concept correctness, end-to-end learning improvement, or a deployed browser state.

Recommendation: execute Phase 2 as a reviewed RTO-cluster foundation followed by bank-wide coverage and shadow evaluation. Keep the existing learner selection unchanged until the new system meets replay and persistence gates. Treat “Proven” and “Mastered” as product hypotheses with explicit evidence rules, not validated educational outcomes.

## 2. Current architecture

### 2.1 Content sources and precedence

There is no single database table containing the full published MCQ bank. The effective catalog is a deterministic merge of source code, captured admin publications, editorial patches, live overrides, and role-visible PBQ database rows.

| Order | Operation | Exact evidence |
|---|---|---|
| 1 | MCQ raw + imported literals; remove low-quality IDs. PBQ base + imported literals; remove low-quality IDs. | `src/App.jsx:12345–12346`, `src/App.jsx:16039–16044` |
| 2 | `mergePublishedSnapshot`: merge payloads by ID and remove captured `disable` rows. | `src/data/sy0701PublishedSnapshot.js:1834–1841` |
| 3 | Remove editorially retired IDs. MCQ legacy study-note enhancement precedes editorial review and wrong-feedback completion. PBQ review precedes runtime enhancement. | `src/App.jsx:12345`, `src/App.jsx:16039–16043` |
| 4 | Within editorial review: base review → published review → second-pass patch → concise-explanation patch. MCQ final spread preserves other fields; PBQ converts old selection formats and constructs option/step feedback. | `src/data/sy0701EditorialReview.js:369–391`, `src/data/sy0701PbqReview.js:101–134` |
| 5 | Fetch active `question_overrides`. Live disable deletes the ID. Captured identity/kind/action/timestamp matches only update order, preventing stale payload reapplication. Other active upserts spread over reviewed content, subject to retirement exclusion. | `src/App.jsx:16197–16233`, `src/App.jsx:33678–33695` |
| 6 | Fetch `pbqs`, normalize row/payload/appQuestion, then merge into PBQ bank. Local reviewed content wins over absent/old remote update timestamps (cutoff **2026-09-05T13:32:13Z**) while preserving remote `is_pro`; newer remote records win. Nonlocal active IDs are appended. | `src/App.jsx:16068–16125`, `src/App.jsx:16190–16194`, `src/data/sy0701PublishedSnapshot.js:1817–1832`, `src/App.jsx:33482–33491` |

**Important distinctions:** live override upserts do not use the PBQ timestamp cutoff; an uncaptured active override can supersede editorial metadata. `isCapturedOverride` tests identity and timestamp, not payload equality. In this audit all 56 live overrides also had identical payloads to the snapshot, verified separately. Live `pbqs` merging happens after override application and can supersede a same-ID PBQ override. Remote filtering checks editorial retirement; it is not the same as consulting every live disable. Test conflicts explicitly before adding another publication layer.

The current authoritative learning content is the **effective merged bank**, not raw literals, old snapshots, or raw remote payloads in isolation. A future canonical mapping must bind to the effective question revision. Live fetch failure leaves local content available; Pro fallback is explicitly recognized when remote rows are fewer than the local bank (`src/App.jsx:33697–33720`, `src/App.jsx:33487–33491`). This makes DB-only inventory counts misleading.

### 2.2 Whole-bank metadata census

Method: use `scripts/lib/read-authored-bank.mjs:1–73` to read literals/snapshot and execute the existing enhancement functions; apply active/disabled filters and editorial functions used by the application; normalize both live PBQ rows with the production adapter and apply `preferReviewedPbq`. All live overrides match the captured snapshot, so their content is already represented; their ordering does not change metadata counts. Audit the **effective** records, not only the imported source.

| Field / property | MCQ, denominator 395 | PBQ, denominator 88 | Meaning |
|---|---:|---:|---|
| Stable question `id` | 395 | 88 | IDs survive editorial retirement in history |
| `ch` | 395 | 88 | String domain number 1–5, called “chapter” by the app |
| `objective` valid in `SY0701_OBJECTIVES` and prefix matches `ch` | 395 | 88 | One scalar objective, not a reviewed multi-concept mapping |
| `topic` nonempty | 395 | 0 | Free-text labels on MCQ; PBQ `cat` is not a canonical topic ID |
| `difficulty` in easy/medium/hard | 395 | 88 | Used in ranking, not calibrated question difficulty |
| Main `exp` / `explanation` | 395 | 88 | Explanation availability in data differs from tier access in UI |
| Canonical `primaryConceptId` | 0 | 0 | No current concept evidence |
| `secondaryConceptIds` array | 0 | 0 | No current role weights or step-level concept mappings |
| `concepts` | 0 | 0 | Acronym metadata does not substitute for concepts tested |
| `editorialReviewed` runtime flag | 0 | 88 | MCQs have review-map coverage, not this flag; do not interpret zero as unreviewed content |

Combined: **483/483 consistent objective/chapter records; 0/483 canonical concept mappings; 0/483 satisfying both the planned objective-and-concept contract.** Existing editorial audit covers all 28 objective groups across the banks, which does not establish every sub-bullet or adequate scenario diversity.

MCQ fields additionally include `q`, `opts`, zero-based `correct`, `wrongFeedback`, optional `acronyms`, `beyondTextbook`, `source`. PBQ fields include `type`, `cat`, `title`, `scenario`, `question`, evidence (`logData`, `currentConfig`, `codeBlock`, `diagram`, `hint`), answer structures (`choices/options`, `correct`, `items`, `correctOrder`, `blanks`, `selectionOptions`, legacy targets/mapping), `explanation`, `wrongFeedback`, `optionFeedback`, `selectionFeedback`, `syllabusDomain`, and optional remote metadata. See normalization `src/App.jsx:16068–16116` and review conversion `src/data/sy0701PbqReview.js:106–134`.

Objects and JSONB can technically carry new concept fields; spreading objects is not a supported concept model. There is no validated canonical catalog, role distinction, mapping version, or algorithm consumer. PBQ nested `appQuestion` is preserved but arbitrary top-level payload fields are not automatically normalized. A new mapping must be verified through every serializer and admin publication path.

Flashcards: **313 cards / 29 sets**. Cards have ID, acronym/term, expansion, meaning, topic, optional example/type; flattened records inherit set ID/type/title, `objectiveCodes`, chapter ID/title. Defaults can assign a whole chapter's objectives to a set; those are broad associations, not card-specific evidence (`src/data/sy0701AcronymFlashcards.js:14–74`, `src/data/sy0701AcronymFlashcards.js:720–730`). Lessons: **32**, with body, aliases, comparisons, traps, checks, sources; separate profiles provide objective arrays, title, summary, keywords and domain from the **first objective** (`src/data/sy0701DeepDiveMap.js:173–184`).

### 2.3 Authenticated database evidence ledger

Read-only Supabase MCP queried project `uscaqeymulsaeqxjvbfq`, “SecurePlus - Comptia Security+ Practice Platform”. No learner identifiers or individual histories were exported. These observations are a point-in-time snapshot, not a claim that the remote schema cannot change.

| Evidence | Read and result |
|---|---|
| **DB-1: schema/catalog** | `information_schema.columns` for `attempts`, `pbqs`, `question_overrides`; `list_tables` for public schema. Attempts has `id,user_id,question_id,question_type,title,domain,chapter,correct,score,created_at`. No concept/session/timing columns. No canonical concept/mastery tables in public table listing. |
| **DB-2: all published records** | Read all `question_overrides` content fields and all `pbqs` rows, excluding override author/user columns. 56 active overrides: 49 MCQ upserts, 2 MCQ disables, 5 PBQ upserts; all snapshot signatures and payloads match. Two PBQ rows: p003 (4.9) and p017 (5.2), both `is_pro=true`, updated 2026-09-30 at 13:02:34 UTC. No additional DB-only PBQ IDs. Effective counts remain 395/88. |
| **DB-3: aggregate history** | Grouped `attempts` by question type: **861 MCQ + 71 PBQ = 932**. Zero missing chapter/domain. 8 PBQ rows have scores, 0 MCQ rows do. Latest MCQ timestamp 2026-09-30 12:55:39.093604 UTC; latest PBQ 2026-07-18 15:13:14.676729 UTC. No session-summary question types present. Counts are not active-user or learning-effectiveness metrics. |
| **DB-4: ownership/access policies** | `pg_policies`: attempts authenticated SELECT/INSERT require `auth.uid() = user_id`; INSERT validates field lengths/score range, not answer correctness. PBQ anon SELECT requires `is_pro=false`; authenticated SELECT additionally allows Pro/trial/subscription or owned coin unlock, with separate admin policy. Active question overrides readable by anon/authenticated. |
| **DB-5: deployed coin function** | `pg_get_functiondef` for `purchase_cipher_coin_item`: PBQ cost 30, exam-pass cost 150; takes requested resource ID, checks ownership/balance, writes unlock/ledger if invoked. **Only definition read, never invoked.** No preferred p014/p018/p033 list or p001 exclusion inside this deployed function. The repository server chooses IDs before calling it. |

Reproduction queries (SELECT only):

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_schema='public'
  and table_name in ('attempts','pbqs','question_overrides')
order by table_name, ordinal_position;

select question_type, count(*) as attempts,
  count(*) filter (where chapter is null or chapter='') as missing_chapter,
  count(*) filter (where domain is null or domain='') as missing_domain,
  count(*) filter (where score is not null) as scored,
  min(created_at) as earliest, max(created_at) as latest
from public.attempts group by question_type;

select question_kind,question_id,action,payload,status,sort_order,updated_at
from public.question_overrides;
select id,title,type,domain,is_pro,payload,updated_at from public.pbqs;
select tablename,policyname,roles,cmd,qual,with_check from pg_policies
where schemaname='public'
  and tablename in ('attempts','pbqs','question_overrides','cipher_coin_unlocks');
select pg_get_functiondef(p.oid)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='purchase_cipher_coin_item';
```

Coverage limitation: management-authenticated reads can see role-restricted records; they do not prove what each guest/free/Pro browser receives under RLS. No production learner session, browser rendering, live API mutation, PostHog ingestion, or deployed frontend asset comparison was performed.

## 3. Current product-loop flow

Structured sequence, with breakpoints:

1. **Choose:** signed-in MCQ defaults to Smart Review and 10 questions; filtering/ranking selects individual questions. **Break A:** no concept queue, intervention state, or transfer requirement (`src/App.jsx:24997–25046`, `src/App.jsx:25080–25128`).
2. **Diagnose:** submit creates a per-question correctness record, selected display index, topic and chapter. **Break B:** concept roles and misconception evidence absent; cloud serialization drops topic/selection (`src/App.jsx:25211–25217`, `src/App.jsx:1615–1658`).
3. **Understand:** show answer verdict and, for Pro, explanation/wrong-option feedback. On completion, compute chapter misses and heuristic lesson matches. **Break C:** core explanations locked for free; recommendation tier not shown before navigation (`src/App.jsx:25251–25263`, `src/App.jsx:25788–25835`, `src/App.jsx:24054–24081`).
4. **Strengthen:** dashboard chapter repair, heuristic chapter flashcards, and lesson links exist. **Break D:** recommendation does not maintain a curated concept graph; RTO deck misses the target cards; post-set screen has no direct refreshed flashcard action (`src/App.jsx:657–696`, `src/App.jsx:24118–24144`, `src/App.jsx:25623–25733`).
5. **Retry:** exact-set retry, missed-question review, or chapter Smart Review. **Break E:** immediate original retry is possible despite a future SM-2 due date; no guaranteed fresh concept scenario (`src/App.jsx:25245–25246`, `src/App.jsx:1989–2008`).
6. **Prove:** later correctness affects latest-question status, SM-2 interval, raw accuracy and readiness. **Break F:** no concept confidence, unresolved contradiction, sticky recovery, transfer/retention distinction, or concept-state transition (`src/App.jsx:1889–1917`, `src/App.jsx:1360–1399`, `src/App.jsx:24108–24135`).
7. **Reload:** load newest 1,000 cloud attempts and rebuild ranking. **Break G:** incomplete evidence cannot reproduce local topic scores, exam contribution, or intervention history (`src/App.jsx:1641–1653`, `src/App.jsx:33883`, `src/App.jsx:33951`).

The system links activities but does not record a durable causal chain from miss → recommendation → completed intervention → independent retest → retained improvement.

## 4. Gap matrix

Severity: **Critical** blocks trustworthy concept mastery; **High** breaks the approved loop or entitlement contract; **Medium** degrades measurement/control. Phase assignments follow the approved sequence, not permission to implement during this audit.

| Area | Intended behavior | Current behavior | Evidence | Severity | Phase that should fix it |
|---|---|---|---|---|---|
| Concept taxonomy | Reviewed primary/secondary concepts | 0/483 mapped; valid objectives do exist | §2 census; `src/App.jsx:12345`, `src/App.jsx:16039–16043` | Critical | 2 |
| Durable evidence | Replay identical across devices | Topic, selected answer, version/source omitted | `src/App.jsx:1615–1658`; DB-1 | Critical | 2 |
| Answer identity | Stable distractor/misconception reference | Selected index follows shuffled options, no durable option identity | `src/App.jsx:1242–1260`, `src/App.jsx:25214` | High | 2 |
| Concept transfer | Schedule variant plus delayed original | Original dominates; same-concept other-topic question not recognized | `src/App.jsx:1989–2008`; §5 replay | Critical | 2 |
| Sticky/proof state | Varied, delayed, contradiction-aware evidence | Latest correct can clear weak flag immediately | `src/App.jsx:2077–2098` | Critical | 2 |
| RTO cards | RTO plus related support | 18-card deck omits target metrics | `src/App.jsx:657–696`; §5 | High | 2 mapping, 3 presentation |
| Lesson precision | Canonical section-level mapping | Objective/topic/token heuristics | `src/lib/deepDiveRecommendations.js:93–176` | High | 2 |
| Core explanations | Available regardless of tier | Pro-only | `src/App.jsx:25251`, `src/App.jsx:25826–25835` | High | 3 |
| Post-set plan | 1–3 concepts, evidence/state, lesson, cards, retest | Score, retry, chapter evaluation; no concept plan | `src/App.jsx:25623–25733` | High | 3 |
| Signed-in MCQ | One CTA, 10–30, collapsed customization | Sizes up to 50, two launch CTAs, exposed controls | `src/App.jsx:25046`, `src/App.jsx:25449–25466`, `src/App.jsx:25505–25580` | High | 3 |
| Competency | Coverage/confidence + concept aggregation | Raw attempts and heuristic readiness | `src/App.jsx:1360–1399`, `src/App.jsx:24261–24289` | High | 2 projection, 3 UI |
| Free PBQs | Exactly p035/p033/p223/p094/p017 | p001 preview; separate coin unlocks | `src/App.jsx:229–232`, `src/App.jsx:26150–26163` | High | 3 |
| Free Deep Dives | All Domain 1, no baseline Domain 2 | One Domain 2 preview, Domain 1 locked | `src/App.jsx:30808`, `src/App.jsx:31275–31283` | High | 3 |
| Exam composition | PBQ ≤ floor(total × .30) everywhere | Slider permits 100%; generation trusts state | `src/App.jsx:26691–26721`, `src/App.jsx:26949–26964` | High | 3 |
| Cloud deployment drift | Deployed contracts match repo | Session columns absent, coin costs differ | DB-1/5; `server/attempts/submit.js:87–102`, `supabase/cipher-coins.sql:565–566`, `supabase/cipher-coins.sql:663–665` | High | 2 prerequisite reconciliation; 3 access |
| Coin catalog | Purchasable active published PBQs | 21 retired IDs eligible, p223–p226 missing | `server/economy/pbq-catalog.js:1–25`; §8 | High | 3, prerequisite before entitlement rollout |
| Explainability/control | Per-recommendation reason + dismiss/postpone/report | Some lesson reason text; rank reasons discarded; no durable preferences | `src/App.jsx:2043–2053`, `src/App.jsx:24054–24081` | Medium | 2 contract, 3 UI |
| Measurement | Join intervention with retest and state | Feature events lack chain IDs and versions | `src/App.jsx:25082`, `src/App.jsx:25226`, `src/App.jsx:31421–31433` | High | 2 shadow, 3 loop, 5 landing |

## 5. RTO/RPO/MTD/MTTR trace

### 5.1 Existing content inventory

Search was over the effective banks, flattened cards, lesson bodies and profile metadata, using whole metric acronyms and expanded names. Mentions in distractors/explanations are **not** proof of primary concept coverage.

| Item | Existing role | Evidence |
|---|---|---|
| m032, Domain 5 / 5.2 / easy / Business Continuity | Direct RTO interpretation; distractors contrast RPO and MTTR | `src/data/sy0701EditorialReview.js:33`, `src/data/sy0701SecondPassReview.js:393`, `src/data/sy0701ConciseExplanations.js:36` |
| m635, Domain 5 / 5.2 / easy / Business Impact Analysis | Another RTO identification scenario; different topic string from m032 | `src/data/sy0701EditorialReview.js:336`, `src/data/sy0701ConciseExplanations.js:348` |
| m088, Domain 5 / 5.2 / Business Continuity | RPO and recoverable version interval | `src/data/sy0701EditorialReview.js:79`, `src/data/sy0701ConciseExplanations.js:92` |
| m196, Domain 5 / 5.2 / Risk Management | Direct MTD distinction; contrasts RTO/RPO/MTTR | `src/data/sy0701EditorialReview.js:178`, `src/data/sy0701ConciseExplanations.js:192` |
| m086, Domain 5 / 5.2 / Business Continuity | BIA question; RTO/RPO occur in explanation, not as the main answer | `src/data/sy0701EditorialReview.js:78`, `src/data/sy0701ConciseExplanations.js:90` |
| p211, Domain 3 / 3.4 | Combined resilience design involving RTO, RPO, immutable retention; one whole-question correctness result | `src/data/sy0701PbqReview.js:9` |
| Standalone RTO card | `sy0701-acronym-risk-governance-business-rto-recovery-time-objective` | `src/data/sy0701AcronymFlashcards.js:645` |
| Standalone RPO card | `sy0701-acronym-risk-governance-business-rpo-recovery-point-objective` | `src/data/sy0701AcronymFlashcards.js:644` |
| Standalone MTTR card | `sy0701-acronym-risk-governance-business-mttr-mean-time-to-repair-recover` | `src/data/sy0701AcronymFlashcards.js:636` |
| Standalone MTD card | **Absent** from the 313-card active collection | Full flattened-card census; builder `src/data/sy0701AcronymFlashcards.js:720–730` |
| `resilience-assets-physical` | Actual RTO/RPO/MTTR comparison table and RTO/RPO application check; Domain 3 canonical profile | `src/data/conceptDeepDivesStudyGuide.js:347–396`, `src/data/sy0701DeepDiveMap.js:153` |
| `risk-resilience-governance` | Profile title/keywords include RTO/RPO; body centers on risk, resilience architectures, calculations and assurance | `src/data/sy0701DeepDiveMap.js:168`, `src/data/conceptDeepDives.js:465–518` |
| `forensics-recovery` | Profile includes RPO keyword/definition; supporting recovery material, not a dedicated four-metric comparison | `src/data/sy0701DeepDiveMap.js:158`, `src/data/conceptDeepDives.js:729` |

No dedicated primary-MTTR MCQ was found in the effective bank; it appears in contrasts. No explicit MTD lesson/card coverage was found in active lessons/profiles/cards. Existing RTO variants are two relatively similar identification tasks, not sufficient by themselves to promise varied scenario proof.

`buildDeepDiveFlashcards` can generate metric cards `resilience-assets-physical:table-1-0`, `:table-1-1`, `:table-1-2`, plus its application check, but the weak deck uses `SY0701_ACRONYM_CARDS`, not these generated lesson cards (`src/lib/deepDiveStudy.js:13–72`, `src/App.jsx:662`). Do not count helper-generated cards as cards automatically delivered to the learner.

Practice generator creates RTO/RPO keyword and comparison questions for the resilience lesson and RPO keyword practice for forensics. The UI slices to **three** generated questions (`src/App.jsx:31298`); generator takes the first three keywords plus up to three table questions (`src/lib/deepDiveStudy.js:90–100`, `src/lib/deepDiveStudy.js:141–142`). Consequently the risk lesson's visible practice is risk register/SLE/ALE, not RTO/RPO, and the resilience comparison questions including MTTR are outside the displayed first three. This is an additional Understand → Prove break.

### 5.2 Concrete synthetic replay

Scenario: signed-in learner, no other history/stars, m032 wrong at `2026-10-01T00:00:00Z` (08:00 Kuala Lumpur), original RPO distractor selected. Runtime shuffling means the stored `selected` value is the **display index**, not a stable original option ID.

1. **Save.** Immediate record is `qid,correct,selected,title,ch,domain,topic,difficulty,mcq,createdAt`. For m032: chapter 5, Business Continuity, easy, false. React adds this immediately. Cloud writes only owner/question/type/title/domain/chapter/correct/score; server supplies timestamp. No RTO concept state or secondary evidence is written. Normal Supabase users do not also get a durable `att:` local fallback (`src/App.jsx:25214–25217`, `src/App.jsx:34333–34342`).
2. **Feedback.** Pro sees RTO explanation and selected wrong-option explanation; free sees verdict, correct-choice marking and upgrade copy instead of detailed explanation. An RPO choice is not retained as durable RTO-vs-RPO misconception evidence.
3. **Set completion.** Score ring, answer list, same-set retry and new-quiz action appear. A miss produces Chapter 5 evaluation with Business Continuity focus; Pro sees up to three weak chapters and their first matched lesson. Free sees up to two matched lesson cards plus Pro evaluation promotion. There is no “one RTO learning signal,” state, retest date, direct refreshed flashcard link, or targeted concept action (`src/App.jsx:25252–25263`, `src/App.jsx:25623–25733`).
4. **Deep Dive.** Existing `getDeepDiveRecommendations([m032],{limit:2})` returns:
   - `risk-resilience-governance`, **188.5**, title “Risk Management, RTO, RPO, and Audits,” objective 5.2/5.5, matched RTO/RPO.
   - `resilience-assets-physical`, **103**, title “High Availability, Backups, Recovery, and Physical Security,” objective 3.4/4.2/1.2, matched RTO/RPO.
   Both are locked to free under current rules. Recommendation cards omit tier status; the destination handles the lock. The first lesson's profile fits the objective while the second contains the useful metric comparison.
5. **Flashcards.** On dashboard/Cipher weak-area generation, context is Chapter 5 + `Business Continuity`. Executing the existing builder selects, in order: **BCP, BIA, BPA, COOP, Governance, Data Owner, Vendor Risk Assessment, Supply Chain Risk, ALE, ARO, CIS, CSF, CTF, EF, GDPR, HIPAA, ISMS, ISO**. RTO/RPO/MTTR are absent; MTD is unavailable. This is not a hand-curated RTO graph. For Pro, an explicit assistant deck can also take precedence over recomputation as later attempts change (`src/App.jsx:33571–33576`).
6. **Associations.** RPO joins through same-topic questions and lesson text; MTD/m635 have different topic strings, and p211 belongs to Chapter 3. No explicit RTO→RPO/MTD/MTTR relationship exists. Supporting concepts cannot be labeled accurately as supporting versus directly weak because neither concept state nor relationship type is represented.
7. **When original repeats.** Same-set retry is immediate and resets results without reshuffling questions. Missed-review mode only considers latest-missed questions. Chapter repair adds direct-miss/focus bonuses. At the miss timestamp, m032 scores **64 + 42 + 10 + 24 + 6 = 146**, though its SM-2 due date is the next day. Due date is a bonus signal, **not an eligibility gate**.
8. **When another RTO question appears.** m635 is eligible when its chapter/topic/difficulty filter permits and its ranking makes the requested set. In this chapter repair replay it scores **8 unseen + 6 chapter = 14**. m088 (RPO, same topic) gets **24 focus + 13 unseen-focus + 6 chapter = 43**. m196 (MTD, other topic) gets **14**. No guarantee places m635 into the next few sets. In normal Smart Review without chapter-repair options m032 scores 52 before other history signals.
9. **Competency change.** Miss increments raw attempt totals/incorrect count. Correct retries count like any other correct attempt in chapter accuracy. Question-latest readiness deduplicates IDs but replaces the old result with the newest. An immediate correct m032 at 00:01 results in SM-2 repetitions 1, interval 1 day, ease ~2.18, latest correct true, next due 2026-10-02 00:01 UTC; the weak counter clears for m032. No transfer or retention proof is established.
10. **After cloud reload.** Exact-question misses, streaks, chapter statistics and due dates can be rebuilt from retained rows. Topic history cannot. In a second replay with wrong m032+m086 and unseen m088, ordinary ranking returns **32, topicAccuracy 0** locally; after `toSupabaseAttempt` → `fromSupabaseAttempt`, it returns **8, topicAccuracy 1**. The default 1 means no matching topic evidence, not demonstrated mastery. Dashboard topic recovery still works by looking up missed question IDs in the current bank; this does not restore historical topic attribution in the ranker.

**Memorization versus understanding:** currently indistinguishable. Shuffling answers changes position, not the scenario. No repeat independence, intervention completion, concept transfer, delayed-proof requirement, or contradiction state is persisted. A score increase is not evidence that the learner understood the concept.

## 6. Data-model gaps

### 6.1 Every attempt field and what survives

| Path | Fields produced / stored | Loss or limitation |
|---|---|---|
| MCQ practice | `qid,correct,selected,title,ch,domain,topic,difficulty,mcq,createdAt` | No per-question response time, source/session ID, concepts, versions or repeat marker; title truncated to 60 characters. `src/App.jsx:25214` |
| Diagnostic | MCQ fields above plus `diagnostic:true` | Diagnostic flag is dropped by cloud writer. `src/App.jsx:33151–33162` |
| Standalone PBQ | `qid,correct,score,partCorrectCount,partCount,type,title,ch,domain,pbq` | Score is part-correct fraction where parts exist; may be undefined otherwise. No selected answer, individual part result, topic, difficulty, timestamp or duration on emitted object. Saved on Done/Next, not merely on Check. `src/App.jsx:26552–26556`, `src/App.jsx:34497–34512` |
| Exam MCQ/PBQ | `qid,correct,selected,title,ch,domain,topic,difficulty,mcq,pbq,exam,timeSpentSeconds,createdAt` | Topic is MCQ topic or PBQ type; selected index does not capture ordering/fill answers. No per-part evidence or partial score. Title ≤80 chars. `src/App.jsx:26819–26835` |
| Local attempt store | Saves the received object unchanged under `att:<email>`, newest first, capped at 1,000 | Undefined fields disappear in JSON; no device sync; errors swallowed. Missing standalone-PBQ timestamp falls back to “now” during calculations. `src/App.jsx:115–137`, `src/App.jsx:1883–1886` |
| Supabase write | `user_id,question_id,question_type,title,domain,chapter,correct,score` | `createdAt` is **not** sent; database `created_at` is insertion time, not original occurrence time. Original guest/import chronology lost. `src/App.jsx:1628–1638` |
| Supabase read | Selects `question_id,question_type,title,domain,chapter,correct,score,created_at`, newest 1,000 | Produces `qid,correct,title,ch,domain,createdAt`; PBQ adds `pbq:true,type:row.domain,score`; every non-PBQ type becomes `mcq:true`. DB attempt ID/owner omitted. MCQ score omitted. PBQ original simulator `type` is incorrectly replaced with category stored in `domain`. `src/App.jsx:1615–1653` |
| Achievement session endpoint | Attempts insert with `user_id,question_id:session:…,question_type:session_…,title,domain,chapter,correct,score,session_type,duration_seconds,questions_count`; DB ID/time defaults | Live table lacks last three columns (DB-1); schema-error path is HTTP 409. No write attempted to verify response. If migrated as-is, generic reader would misclassify session summaries as MCQs. `server/attempts/submit.js:81–102`, `server/attempts/submit.js:162–169`; proposed schema `supabase/achievements.sql:21–24` |

**Across devices:** correctness/question/chapter/category survive if insert succeeds; selected answer, topic, difficulty, diagnostic/exam flag, exam response time and PBQ part counts do not. Concepts tested, review source and algorithm version are never part of ordinary persisted attempts. Normal MCQ response time is never collected. Local practice-session objects hold question options, drafts, results and session context for resume, but are not cloud evidence (`src/App.jsx:25150–25165`).

Daily challenge MCQ stores only `qid,correct,selected` in component results; the shown path awards daily activity without calling the normal attempt saver. Daily PBQ likewise records minimal local component results (`src/App.jsx:22786–22808`, `src/App.jsx:23001–23009`). Deep Dive checks store component results and local best percentage, not standard attempts (`src/App.jsx:31412–31444`). Thus “every answer” is not yet a uniform evidence contract.

### 6.2 Reliability, trust and historical reconstruction

- React history updates before the remote write; default save errors warn but do not reject or queue retries. Refresh can lose an apparently saved result (`src/App.jsx:1656–1662`, `src/App.jsx:34333–34342`). There is no stable client event ID/idempotent insertion.
- The 1,000-row ceiling truncates lifetime spacing and streak evidence. Client replays must not be the canonical long-term projection.
- RLS enforces ownership, not correctness. Client-supplied correctness/score can inform convenience UX, but must not become trusted mastery/rewards without validation. Session endpoint clamps client scores; it does not grade answer evidence (`server/attempts/submit.js:81–99`; DB-4).
- Storing only the selected display index would still be insufficient after adding a column: persist stable option IDs or original-option identity plus content revision; do not reconstruct old choices using today's shuffled bank (`src/App.jsx:1242–1260`).
- PBQ fraction (0–1) and session percent (0–100) use the same nominal score column. Define score scale and partial-credit semantics before interpreting either as concept evidence.
- Past rows can be mapped to current reviewed questions as **inferred legacy mapping** with provenance. They cannot recover selected distractors, historical concepts, response time, intervention, or original occurrence timestamps. Do not backfill invented values or promote legacy-only history to Proven.
- Flashcard `mastered`, review count and last review can sync independently; these are self-ratings, not quiz mastery (`src/App.jsx:1754–1787`). Deep Dive completion and best scores use browser-wide localStorage keys and do not establish a user-owned intervention ledger (`src/App.jsx:31269–31273`, `src/App.jsx:31393–31405`).

## 7. Algorithm gaps

### 7.1 Current exact ranking rules

Plain language: add urgency for missed, overdue, starred and weak-topic questions; prefer some unseen content; reduce recently successful repetitions; adjust difficulty against chapter accuracy; then greedily diversify topics. It is a question priority system, not a probability of concept understanding.

All additions below are summed, then sorted descending by score and lexicographically by question ID (`src/App.jsx:1940–2008`).

| Signal | Exact weight / threshold | After cloud history reload |
|---|---|---|
| Explicit direct-missed request | +64 | Reconstructed from latest missed IDs for chapter/missed paths; request itself not persisted |
| Latest answer wrong | +42 | Yes |
| Consecutive wrong answers for same qid | +min(28, streak × 10) | Yes, within loaded history |
| Due question | +20 + min(18, overdue days × 2) | Yes, using DB insertion time |
| Starred | +16 | Yes, separate starred table (`src/App.jsx:1719–1751`) |
| Focus topic | +24; reason says “related concept” | Rebuilt from current question topics in chapter review, not a concept relation |
| Focus chapter | +6 | Yes when requested |
| Topic accuracy | At least 2 attempts and accuracy <.75: +(1−accuracy) ×24 | **No** for reloaded rows with missing topic |
| Chapter accuracy | At least 3 MCQ attempts and accuracy <.72: +(1−accuracy) ×12 | Yes |
| Time since seen | >7 days: +min(14,(days−7) ×.8) | Yes, timestamp caveat |
| Unseen | +13 if focus-topic, otherwise +8 | Yes; unknown question history beyond 1,000 rows may look unseen |
| Recently correct | <2 days: −30 | Yes |
| Many repetitions, latest correct | history length >3: −min(15,(length−3) ×3) | Yes; ignores scenario independence |
| Hard with weak chapter | ≥3 attempts and chapter accuracy <.6: −12 | Yes |
| Medium with weak chapter | ≥3 attempts and accuracy <.7: +4 | Yes |
| Hard with strong chapter | chapter accuracy ≥.8: +5 | Yes; no-history chapter defaults to 1 and also gets this bonus |
| Beyond-textbook, not starred | −10 | Yes, current bank attribute |

Topic key is `chapter::topic`; focus matching is exact topic string, while diversity counts just topic string. Accuracy is cumulative over loaded MCQ attempts, not recency-weighted or distinct-question-weighted. No primary/secondary concept, response time, prior lesson/card intervention, sticky state, selected distractor, or set-count signal is consumed.

SM-2 variant (`src/App.jsx:1889–1917`): initial repetitions 0, interval 0, ease 2.5, due epoch; correctness maps to quality **4**, incorrectness **2**. Quality <3 resets repetitions to 0 and interval to 1 day. Correct repetitions 1/2 schedule 1/6 days; later interval is rounded previous interval × prior ease, minimum 1. Ease updates by `max(1.3, ease + .1 − d × (.08 + d × .02))`, `d=5−quality` (correct change 0, miss −.32). Due time is answer time + interval ×24h. No scheduling version, persisted queue, timezone/calendar-day boundary, upper interval cap, or minimum proof delay exists.

Diversity (`src/App.jsx:2011–2053`): requested count clamped to pool size; no duplicate ID within a set. Topic cap is 2 for sets ≤3, otherwise max(2,ceil(count×.35)); hard cap max(1,floor(count×.35)); beyond cap max(1,floor(count×.10)). **Three passes relax caps:** first all, second drops topic/hard constraints, third drops beyond limit. They are soft fill preferences, not hard guarantees. Random mode shuffles with `sort(()=>Math.random()-.5)` then uses the same diversity picker. There is no exact-repeat, concept-share, blueprint or remediation-share hard cap.

Other important thresholds: question “weak” means latest incorrect; “due” means scheduled timestamp passed (`src/App.jsx:2077–2098`). Dashboard priority = missed question count×30 + extra consecutive misses×12 + (100−chapter accuracy), selecting chapters with at least one latest miss (`src/App.jsx:24118–24135`). Cipher uses missed count×30 + accuracy deficit, omitting the repeated-miss term (`src/App.jsx:27933–27949`). MCQ ordinary sizes 10–50; missed/starred review up to 50; chapter repair clamp can yield 1+ (`src/App.jsx:25046–25133`).

Readiness is a separate heuristic: latest result per question; knowledge = accuracy×min(1, distinct count/20), chapter coverage = covered/5, practice = distinct/60 capped 100, application = PBQs/5×55 + exam questions/20×45 capped 100; overall weights **45/20/20/15%**, labels at **25/45/65/80** (`src/App.jsx:1360–1399`). The `exam` flag loss removes the exam contribution after cloud reload. Chapter bars instead use **all** attempts, with colors ≥75/≥50 (`src/App.jsx:24108–24115`, `src/App.jsx:24273–24285`). Neither is the intended confidence-aware competency.

### 7.2 Content matching rules and failure modes

Deep Dives (`src/lib/deepDiveRecommendations.js:7–184`): limit 1–4 (default 2); search question topic/stem/title/explanation/options. Objective match +90; curated topic regex hint +max(18,54−14×position); same canonical domain +12; up to four matching keyword/alias phrases +24 then +10 each; token overlap +min(20,2.5×overlap); full profile title substring +30. Evidence question counted when score >15; useful recommendation requires evidence and total ≥28. Sort by total score, evidence count, study order; otherwise choose first-miss-domain lessons by study order. Reason text uses first two terms/topics.

Risks: all options, including distractors, contribute; phrase matching uses substring inclusion, so `RTO` can match `RTOS`; broad objectives and aliases can outscore the actually useful comparison section; dominant repeated misses inflate a lesson's total. Missing vocabulary creates false negatives; fallback can recommend a generic lesson without strong concept evidence. This is partly curated **topic-to-lesson hints**, not curated question/concept-to-content mappings.

Weak cards (`src/App.jsx:656–696`): chapter filter first; topic substring +80; topic phrase anywhere in card +32; **each** matching token +9; term-type card +4. All positive scores plus fallback ordered by score then topic fill **18** distinct IDs. No stop-word removal, objective matching, aliases or concept graph. Generic “business”/“continuity” can pull BPA/COOP while a correct RTO card lacks those topic tokens. Term bonus makes some unrelated cards positive even without a text match. Cross-domain support is excluded before scoring.

## 8. UI and entitlement gaps

### 8.1 Surface inventory and supported loop stages

| Surface | What exists | Missing / misleading | Loop support and evidence |
|---|---|---|---|
| Signed-in MCQ setup | Smart default, due/weak/new question counts, mode cards, unfinished/missed/starred queues, two Start buttons, visible filters/count presets | Not concept counts; 40/50 allowed; custom controls not collapsed; no sparse-concept explanation | Diagnose / partial Strengthen. `src/App.jsx:25340–25466`, `src/App.jsx:25505–25580` |
| Set completion | Score, answered-state review, retry/new quiz, heuristic Deep Dive links, Pro weak chapter evaluation | No 1–3 concept states/reasons, card action, targeted concept CTA or retest expectation; free evaluation promotion | Diagnose / partial Understand. `src/App.jsx:25623–25733` |
| Smart Review | Miss/due/starred prioritization and chapter repair with topic diversity | Reasons computed but dropped when returning question list; no dismiss/postpone, concept evidence inspection or sticky recovery | Partial Strengthen, insufficient Prove. `src/App.jsx:1940–2053`, `src/App.jsx:25080–25133` |
| Signed-in homepage | Readiness hero, accuracy/questions/streak/PBQ stats, weak chapter card with lesson/card/review actions, saved cards | No highest-priority concept plan, due/sticky timeline, confidence drill-down, durable recent-work plan; weak status can arise from one miss despite repeated-miss copy | Partial Diagnose/Understand/Strengthen. `src/App.jsx:24085–24144`, `src/App.jsx:24214–24369` |
| Chapter competency | Expandable raw accuracy bars; readiness lab has explicit not-official-pass-prediction caveat | One attempt can show precise percentage; missing concepts/coverage/confidence/retention, unattempted chapters omitted | Raw Diagnose only. `src/App.jsx:24258–24289` |
| Curated flashcards | User-starred deck; Pro Cipher deck; standalone sets; synced self-rating and random saved decks | “Curated” means several different things; automatic deck not concept-mapped; no supporting-vs-weak labels or evidence chain; explicit deck may become stale | Recall Strengthen, not proof. `src/App.jsx:31907–31943`, `src/App.jsx:33571–33576` |
| Deep Dive recommendations | Matched terms/topics, domain/objective/minutes, direct navigation; lesson checks and completion | Lock only at destination; no concept mapping/version, section targeting, recommendation outcome or mastery update | Partial Understand. `src/App.jsx:24054–24081`, `src/App.jsx:31340–31444` |

Existing states suitable for eventual authentic visuals: question verdict/miss list (Diagnose), real resilience comparison table (Understand), current review/card screen with honestly described heuristic selection (Strengthen). There is **no existing concept-level before/after spaced-proof state** suitable for the promised Prove visual. Do not relabel the accuracy ring as proof.

### 8.2 PBQ access and duplication inventory

Approved baseline is exactly **p035, p033, p223, p094, p017**; all five exist in the effective 88-question bank. Titles: network terminology, TLS lifecycle, network attack evidence, alert tuning, risk response. Current baseline is **p001 only**; earned coin unlocks are separate. In DB-2 only p017 of the proposed five is a `pbqs` row, and it is currently Pro. The other four still exist through the local/snapshot bank; absence in `pbqs` is not absence from the product.

| Check / path | Current rule and inconsistency | Evidence |
|---|---|---|
| Shared preview helper | Only id p001, no `is_pro` lookup | `src/App.jsx:229`, `src/App.jsx:361` |
| Bank normal/keyboard/starred cards | Pro OR p001 OR coin-owned | `src/App.jsx:25983`, `src/App.jsx:26150–26163` |
| Parent signed-in launch | Free non-p001 non-owned redirects to coins | `src/App.jsx:34900` |
| Random PBQ | Chooses without entitlement filter, relies on parent; can send free learner to coins | `src/App.jsx:25954–25964` |
| Guest bank / preview CTA | Only p001 launches; others signup. Preview can fall back to local p001 | `src/App.jsx:34456–34464`, `src/App.jsx:34719` |
| Deep Dive related PBQ | Repeats Pro/preview/coin predicate, chapter-first fallback can select locked item | `src/App.jsx:34443–34455` |
| Active PBQ resolver | Any matching `livePbqBank` record accepted before guarded local fallback; live bank already includes local paid content | `src/App.jsx:33483–33485`, `src/App.jsx:34766–34773` |
| Remote serializer / SQL | `is_pro` defaults from preview helper when not supplied; DB policy uses stored `is_pro`, tier/trial/subscription/unlock, not five-ID list | `src/App.jsx:16184`, `supabase/cipher-coins.sql:795–832`; DB-4 |
| Local coin selection | First p014,p018,p033 then random non-p001 non-owned bank | `src/App.jsx:232`, `src/App.jsx:1000–1010` |
| Server coin selection | Another first-three list plus hard-coded catalog; excludes p001 by omission | `server/economy/pbq-catalog.js:1–25`, `server/economy/coins-action.js:133–153` |
| Checked-in coin SQL | Additional candidate catalog, preferred list and p001 exclusions | `supabase/cipher-coins.sql:569–652` |
| Live coin SQL | Older requested-ID implementation, costs 30/150 instead of repository 50/70 | DB-5; `src/App.jsx:230`, `supabase/cipher-coins.sql:565–566`, `supabase/cipher-coins.sql:663–665` |
| Exam generation | Pro or voucher entry; generated pool not filtered by individual unlock predicate | `src/App.jsx:26695–26710` |

No independent question-ID URL launcher was found in the inspected navigation; direct/in-app entry still needs a shared launch guard. The resolver is a client enforcement gap, not evidence of a tested public exploit. All bundled question content is already in the frontend; RLS over `pbqs` alone cannot make that bundle confidential.

Server catalog comparison: **21 retired/absent IDs** remain purchasable candidates: p201–p210 and p212–p222. **Four published IDs missing** from that catalog: p223,p224,p225,p226. The first three p014,p018,p033 still exist; future p033 baseline-free status must remove it from paid random selection. Preserve previously earned access while separating baseline and earned entitlements.

### 8.3 Deep Dive and related gates

`FREE_DEEP_DIVE_PREVIEW_ID="web-social-dns-attacks"` (Domain 2) is the only baseline free lesson (`src/App.jsx:30808`, `src/App.jsx:31275–31283`). Open-card and incoming recommendation requests both consult `isLockedDeepDive`; completion filtering and initial expanded domain also depend on the special ID (`src/App.jsx:31329–31330`, `src/App.jsx:31340–31370`, `src/App.jsx:31753–31758`). Recommendations have no tier argument and cannot show access before navigation (`src/App.jsx:24054–24081`).

The four currently canonical Domain 1 lessons are `keys-passwords-encryption`, `pki-email-trust`, `security-foundations-controls`, `crypto-modes-pqc-transition`. Phase 3 must derive access from profile domain, not hard-code this inventory. Existing multi-domain lessons use first objective for canonical domain, so preserve an explicit editorial owner-domain decision.

Additional inconsistencies: MCQ Smart Review works for signed-in free users despite promotional copy grouping it with Pro (`src/App.jsx:239`, `src/App.jsx:25000`). Cipher weak-card controls require Pro and library hides the assistant deck for free (`src/App.jsx:28061–28083`, `src/App.jsx:31929`), but dashboard generation/forwarding and `openSet` lack equivalent checks (`src/App.jsx:24140–24143`, `src/App.jsx:24307–24319`, `src/App.jsx:34421–34426`, `src/App.jsx:32103–32105`). Core answer explanations must be ungated under the approved plan; targeted-deck tier policy needs a single explicit decision.

### 8.4 Exam Mode composition

Default total 20 / PBQ 2; total choices 10/20/30/40/50; PBQ slider 0…total with “100% PBQ” endpoint. Changing total preserves rounded previous ratio, clamped only to total (`src/App.jsx:26638–26670`, `src/App.jsx:26691–26693`, `src/App.jsx:26949–26964`).

Generation shuffles non-enrichment eligible PBQs and MCQs separately, takes requested counts, places PBQs first, and does not refill shortages or validate floor(total×.30). Saved-session restore trusts saved counts/questions (`src/App.jsx:26707–26721`, `src/App.jsx:26734–26741`). Start analytics uses requested total/PBQ counts; completion uses actual question count (`src/App.jsx:26850`). Timer uses requested total×72 seconds. No trusted generation/composition validator exists in the inspected endpoint; session summary accepts counts/scores, not the actual question manifest (`server/attempts/submit.js:77–102`). Phase 3 must validate actual generated composition and resumed sessions as well as controls.

## 9. Analytics gaps

This is a source instrumentation inventory. Existing PostHog event ingestion, funnels, retention or conversion totals were not queried or claimed. `capture` is a no-op without configured token; manual pageview disabled, autocapture enabled, identification stores tier/provider (`src/lib/analytics.js:3–34`). Feature call sites do not prove delivered events.

| Journey | Existing event names | Evidence / limitation |
|---|---|---|
| Entry and signup | `landing_full_mcq_bank_clicked`, `landing_signup_cta_clicked`, `signup_form_viewed`, `signup_started`, `signup_completed`, `signup_email_confirmation_required`, `app_viewed` | `src/App.jsx:23242–23431`, `src/App.jsx:24678–24682`, `src/App.jsx:33817`; signup event not authoritative Auth count |
| Daily/diagnostic | `landing_daily_drill_started`, `landing_daily_question_answered`, `landing_daily_drill_completed`, `landing_daily_drill_mcq_cta_clicked`, `daily_challenge_started`, `daily_question_answered`, `daily_streak_completed`, `diagnostic_question_answered`, `diagnostic_completed` | `src/App.jsx:22795–22849`, `src/App.jsx:23074–23094`, `src/App.jsx:33166`, `src/App.jsx:34358` |
| MCQ/review | `mcq_quiz_started`, `mcq_question_answered`, `mcq_quiz_completed`, `mcq_missed_review_started`, `mcq_starred_review_started`, `mcq_chapter_smart_review_started`, `mcq_completed_question_reviewed` | `src/App.jsx:25082–25131`, `src/App.jsx:25208–25239`; starts have mode/source but completion lacks session ID/mode |
| Guest carryover | `guest_smart_review_save_clicked`, `guest_smart_review_imported` | `src/App.jsx:25268`, `src/App.jsx:33596` |
| Lessons | `concept_deep_dive_opened`, `smart_review_lesson_opened`, `concept_deep_dive_locked_clicked`, `concept_deep_dive_completion_toggled`, `concept_deep_dive_practice_answered`, `concept_deep_dive_practice_completed`, `deep_dive_add_weak_topic_clicked`, `deep_dive_related_pbq_clicked` | `src/App.jsx:31283–31433`, `src/App.jsx:34437–34448`; routed successful open emits library-source opened plus smart-review opened; lock path emits locked event only |
| Cards | `cipher_assistant_flashcards_started`, `flashcards_set_opened`, `flashcards_acronym_rated`, `flashcards_ten_cards_completed`, `flashcards_random_set_generated`, `flashcards_random_set_saved`, `flashcards_guest_review_set_imported`, `question_star_toggled` | `src/App.jsx:28075`, `src/App.jsx:32099`, `src/App.jsx:32201–32248`, `src/App.jsx:33631`, `src/App.jsx:34374` |
| PBQ/exam | `pbq_locked_clicked`, `pbq_preview_started`, `pbq_started`, `pbq_random_practice_started`, `pbq_question_answered`, `exam_mode_started`, `exam_mode_completed`, `exam_report_card_printed`, `exam_retake_incorrect_started` | `src/App.jsx:25951–25963`, `src/App.jsx:26162–26271`, `src/App.jsx:26721`, `src/App.jsx:26850`, `src/App.jsx:27053–27073`; entry paths differ and completion lacks actual PBQ count |
| Explainability/reporting | `cipher_assistant_review_started`, `cipher_assistant_choice_selected`, `question_report_opened`, `question_report_submitted` | `src/App.jsx:28056`, `src/App.jsx:28121`, `src/App.jsx:34399`, `src/App.jsx:28475`; question reporting is not a structured mapping-correction workflow |

Proposed measurement contract for Phase 2/3 (names are recommendations, not current events): `learning_signal_recorded`, `recommendation_shown`, `recommendation_accepted/dismissed/postponed/mapping_reported`, `intervention_started/completed`, `concept_retest_scheduled/answered`, `concept_state_changed`, `personalised_set_started/completed`, `custom_practice_expanded`, `adaptive_shadow_compared`. Include pseudonymous user ID through existing identify, `attempt_id`, `session_id`, `recommendation_id`, canonical concept IDs/role, question revision, mapping/algorithm/config version, source, access status, exact-repeat/fresh-scenario classification, observed delay, requested/actual composition, state/confidence before/after, and machine-readable reason codes. Do not send full answers, emails, or lesson bodies as analytics properties.

Measure full loop adoption, recommendation acceptance, intervention-to-retest rate, distinct-question/time-to-Proven, relapse, exact-repeat share, content diversity and chapter coverage. Compare cohorts carefully; a retention difference is not causal evidence of educational benefit. Baseline landing/signup/SEO metrics and seven-day retention remain **not measured in this Phase 1 source/database audit**. Obtain dated aggregate PostHog and Search Console baselines before Phase 4/5 messaging and Phase 6 SEO changes; do not invent zero values for unavailable baselines.

## 10. Risks and dependencies

- **Content readiness:** objective coverage is strong structurally, but concept coverage/scenario independence is unestablished. m032+m635 alone cannot support a robust RTO proof ladder; MTD/MTTR content needs editorial work.
- **Deployment drift:** DB-1/5 contradict checked-in migration/setup files. Reconcile actual schema/function versions before designing deployment/backfill. Do not run all old SQL blindly: coin economy and existing rewards may change.
- **Mixed attempt types:** deploying achievement columns without fixing the reader can make `session_practice/session_exam` synthetic IDs count as MCQ question history. Keep session summaries distinct or explicitly excluded.
- **Reward integrity:** current client correctness and self-reported session summary are not server-graded. The new projection must not trust client mastery fields, and shadow mode must never change coins, tier, badges or exam access.
- **Historical limits:** 932 live rows lack concept versions/selected options. Historical shadow analysis can inspect coverage/ranking, not retrospectively validate missing interventions or independent learning.
- **Entitlement inconsistency:** local bundled content, remote RLS, UI gates and multiple catalogs differ. Test every launch path; policy lookup alone is not enforcement.
- **False precision:** raw accuracy, self-rated flashcard mastery and heuristic readiness are different measures. Do not blend them into a confident concept percentage.
- **Static-test limits:** four existing lesson checks cover Wi-Fi/PKI/SIEM/risk, not the complete RTO loop (`scripts/audit-deep-dives.mjs:279–301`). Several audits assert current legacy strings, including signed-in 50-question controls (`scripts/audit-launch.mjs:259`). Update intentional contracts when their phase arrives, not now.
- **Monolithic integration:** catalog and ranking functions reside in a large `src/App.jsx`. Extract pure modules with behavior-preserving tests before changing logic. Avoid unrelated refactors.
- **Working-tree preservation:** pre-existing modified `.gitignore` and untracked `android/`, `audit_artifacts/`, `capacitor.config.json`, `docs/google-play-android.md`, `output/`, `review_exports/` were outside scope and must remain unstaged.

## 11. Exact Phase 2 change set

Phase 2 means the **mastery foundation and shadow validation**, per master plan lines 643–648. It does not ship the Phase 3 UI/access changes or Phase 5 rebrand. The following is an implementation-ready proposal requiring editorial review and decisions in §14, not an implemented algorithm.

### 11.1 Work packages and acceptance gates

| Order | Concrete change | Completion gate |
|---|---|---|
| P2.0 | Record actual DB baseline; separate ordinary answers from session summaries; establish one immutable question revision/mapping lookup after current merge precedence | Local/live schema differences explicitly resolved in reviewed migration plan; retired IDs remain referentially valid; no live write in audit |
| P2.1 | Add canonical concept catalog, relationship types, question/content mapping schema and editorial validation | Unique IDs, valid objectives/domain/topic, reviewed primary mapping, no duplicate secondary role, no dangling references; all publication/adapter paths preserve metadata |
| P2.2 | Pilot RTO/RPO/MTD/MTTR/BIA mappings and add missing editorial content/variants | Mapping fixture shows direct and supporting evidence separately; no metric inferred from mere mention; fresh-scenario shortage surfaced |
| P2.3 | Add append-oriented attempt evidence and intervention records; stable option/part identity, idempotency, offline retry, occurrence/receipt timestamps | Same evidence survives reload on a second device; no duplicate evidence from retry/resume; trusted grading and ownership checks pass |
| P2.4 | Add pure deterministic, versioned calculator and scheduler with reason codes and configuration | Synthetic replay suite passes; replay order stable; unmapped/unreviewed/legacy evidence cannot silently establish proof |
| P2.5 | Add per-user concept-state projection and concept-weighted competency query with evidence confidence/coverage | Projection recomputes identically from immutable evidence; objective gaps cannot be hidden by easy/repeated items |
| P2.6 | Expand reviewed mappings across all active MCQs and learning content; PBQ granularity limited to supported grading | 395/395 active MCQs have reviewed primary concepts before their evidence affects mastery; report updated bank counts if content changes; PBQ-level versus step-level precision declared |
| P2.7 | Run shadow calculator/scheduler, persist comparison metrics under separate version, inspect false flags/repetition/coverage | Existing visible sets/rewards/access unchanged; founder/editor sign off on reason samples and rollout gates before Phase 3 |

### 11.2 Proposed pilot model

Stable IDs: `recovery.rto`, `recovery.rpo`, `recovery.mtd`, `recovery.mttr`, `continuity.bia`; topic `business-continuity-metrics`; exam scope `sy0-701`; mapping version `sy0701-concepts-v1`; algorithm `concept-mastery-v1`; configuration version separate. Keep ID semantics independent of chapter number: p211 applies recovery targets in objective 3.4 while MCQs use 5.2. Define domain as official exam domain, existing `ch` as legacy domain alias; introduce a separate chapter ID only if the product truly needs another hierarchy level.

| Question | Proposed primary | Secondary / editorial constraint |
|---|---|---|
| m032 | recovery.rto | RPO/MTTR are distractor contrasts, not automatically secondary evidence. Chosen distractor may support reviewed misconception tag. |
| m635 | recovery.rto | Same caution; check whether wording is independently varied enough relative to m032. |
| m088 | recovery.rpo | Backup-frequency/application relation; do not debit RTO. |
| m196 | recovery.mtd | RTO is useful contrast; reviewer must establish whether necessary to solve before assigning secondary evidence. |
| m086 | continuity.bia | RTO/RPO explanation mentions are supporting content only. |
| p211 | Reviewed recovery-design concept or explicit coarse multi-concept mapping | Combined whole-choice scoring cannot locate which requirement failed; do not fabricate separate RTO/RPO/WORM mistakes. |

Proposed graph: RTO↔RPO `commonly_confused_with`; RTO↔MTTR `contrasts_with`; RTO↔MTD `contrasts_with`; BIA→recovery targets `prerequisite_for`; RTO/RPO/MTD/MTTR→business-continuity-metrics `part_of`; RPO↔backup-frequency `applied_with`. Each edge has direction, editorial weight, review status and version. **Edges select supporting material; only observed tested concepts receive mastery evidence.** Map existing metric cards and resilience comparison section to the canonical IDs; add reviewed MTD material and varied scenarios before attempting full proof.

### 11.3 Version-one calculation/scheduling contract to implement

State rules follow the approved hypotheses, not an invented scientific score: first miss → Learning signal; second distinct-question miss → Needs attention; miss after a completed intervention or repeated later-set miss → Sticky; ≥2 distinct post-repair correct scenarios → Improving; additional delayed success with no unresolved contradiction → Proven; later spaced success → Mastered. Lapse reverses/defers promotion; sticky history persists and requires more varied/spaced recovery. Related-concept selection does not change that concept's evidence state (master plan 454–510).

Implement configurable values for primary/secondary weights, difficulty/quality multipliers, exact-repeat discount/window, minimum distinct scenarios, proof/maintenance delays, sticky recovery requirements, contradiction resolution, baseline confidence/coverage, next-set eligibility, and normal versus Smart Review remediation/repeat/concept/hard caps. Keep exact numerical defaults explicitly provisional and reviewable in one config file. No requirement in the master plan fixes exact delays or percentages for these parameters; §14 resolves them.

Scheduling must produce **two distinct tasks** after a miss: transfer variant and original recall. Track `eligible_after_at` and `eligible_after_set_index`, completed intervention and content revision. Exact retry can remain available voluntarily but must not independently establish Proven. If a concept has too few eligible variants, emit `insufficient_variant_coverage`; do not silently fill with unrelated material and imply transfer. In shadow mode do not enforce new selections on learners.

Return contracts:

- Evidence: stable event/attempt/session IDs, graded question revision, primary/secondary mapping snapshot, answer/part result, accuracy, source, occurrence/receipt times, optional response time and review linkage.
- State: concept ID, estimate, confidence/effective sample size, distinct questions/scenarios, state, misses/lapses/sticky history, last intervention/test, next eligible check, mapping/algorithm/config version, unresolved contradictions.
- Recommendation: ID, direct or supporting role, concept/content IDs, reason codes plus evidence IDs, priority, next eligible time/set, access metadata, version.
- Session plan: selected IDs/revisions, reason per selection, requested/actual composition, eligibility exclusions/shortage reason, deterministic seed/config version.

## 12. Recommended migrations and affected files

**Recommendations only. No migrations were created or run.** Names below describe logical changes, not preassigned timestamped migration filenames.

| Logical migration / model | Required structure / invariants |
|---|---|
| Catalog and mapping versions | Concepts, question revisions, question-concept roles, content-concept links, typed concept relationships; reviewed status, objective arrays, immutable version IDs; no mutable current mapping used to rewrite old evidence silently |
| Attempt evidence extension or new evidence table | UUID event ID, owner, question revision/type, session ID, source, stable selected option/part evidence, concept snapshot/reference, mapping version, occurrence/receipt timestamps, optional response milliseconds, intervention/recommendation linkage, grading/provenance; unique owner+client-event ID; append/correction events rather than in-place correctness rewrite |
| Separate session summaries | Session ID, source/mode, requested/actual composition, started/completed time, duration, manifest/config; exclude from MCQ histories; avoid depending on currently absent achievement columns without migration |
| Intervention and schedule ledger | Owner+concept/content/recommendation, started/completed/skipped/postponed events, review eligibility time/set count, reason/version; completion is intervention evidence, not automatic positive mastery |
| Concept projection | Unique owner+concept+algorithm/config version, state/confidence/counters, last processed evidence cursor, due fields; rebuildable cache, not sole truth |
| Access and validation | Ownership RLS for exposed learner tables; server-derived owner and authoritative grading; client cannot award itself mastery/rewards; reviewed catalog read policy; indexes on owner/time, owner/concept/due and question revision |

Migration rollout: additive schema → compatibility reader/writer → idempotent evidence ingestion → explicitly labeled legacy import → shadow projection → compare → controlled cutover in a later phase. Preserve old rows and rollback to existing reader/selector without deleting new evidence. Determine actual applied migrations first; SQL files in this repository are setup intentions, not proof of live deployment.

| Existing / proposed path | Phase 2 responsibility |
|---|---|
| `src/App.jsx:1615–1658`, `src/App.jsx:1883–2053`, `src/App.jsx:25211–25217`, `src/App.jsx:26552–26556`, `src/App.jsx:26819–26835`, `src/App.jsx:34333–34358` | Replace scattered serialization/evidence entry points with shared adapter; extract pure ranker as baseline for comparison; preserve visible behavior during shadow |
| `src/data/sy0701EditorialReview.js`, `src/data/sy0701PbqReview.js`, `src/data/sy0701PublishedSnapshot.js`; `src/App.jsx:16068–16233` | Mapping preservation, question revision and override validation at final publication boundary |
| `src/data/sy0701AcronymFlashcards.js`, `src/data/conceptDeepDivesStudyGuide.js`, `src/data/sy0701DeepDiveMap.js` | Reviewed canonical mappings and missing pilot content; objective profile does not alone specify tested concepts |
| `src/lib/deepDiveRecommendations.js`, `src/lib/deepDiveStudy.js` | Shadow canonical recommendation selector, section/card links, practice variant inventory; retain explicit heuristic fallback provenance |
| Proposed `src/data/learningConcepts.js`, `src/data/learningMappings.js`, `src/lib/learningEvidence.js`, `src/lib/conceptMastery.js`, `src/lib/reviewScheduler.js`, `src/lib/learningConfig.js` | Separate reviewed data, pure calculator, scheduler, adapter and versioned configuration; names proposed, files do not yet exist |
| `api/attempts.js`, `server/attempts/submit.js`, proposed server evidence endpoint | Keep summary and per-answer ingestion distinct; enforce idempotency/ownership/grading and protect trusted projections |
| `supabase/schema.sql`, `supabase/achievements.sql`, new reviewed migrations | Reconcile DB baseline and add evidence/projection models; do not unconditionally apply unrelated reward setup |
| `scripts/audit-editorial.mjs`, `scripts/audit-deep-dives.mjs`, `scripts/audit-qbank.mjs`, `scripts/lib/read-authored-bank.mjs`, proposed replay/persistence audits | Effective-bank mappings, remote normalization, immutable replay and shadow verification |
| `src/lib/analytics.js` and ingestion/selection call sites | Versioned shadow/loop event contract; no marketing experiment in Phase 2 |

Deferred **Phase 3** affected paths: MCQ/setup/results/dashboard/DeepDive/Flashcards/ExamMode components in `src/App.jsx`; shared entitlement module to replace p001 and preview-ID rules; `server/economy/pbq-catalog.js`, `server/economy/coins-action.js`, `supabase/cipher-coins.sql`, PBQ RLS; trusted exam generator/manifest validator. Include current test assertions when changing those contracts. Deployed coin-cost mismatch should be triaged before that rollout, without silently changing the economy in a mastery migration.

## 13. Verification plan

### 13.1 Completed in Phase 1

| Command / check | Exact outcome |
|---|---|
| `npm run build` | **PASS, exit 0**. Vite 8.1.0; 152 modules; reported build 475ms. `dist/assets/main-Bfv92kCm.js` 3,586.34 kB / gzip 1,000.68 kB. Existing warning: some chunks >500 kB; not resolved in documentation-only scope. |
| `npm run audit` | **PASS, exit 0**, all eight chained audits executed. |
| `audit:launch` | “Launch/security audit passed with no structural errors.” |
| `audit:coins` | “Cipher welcome grant audit passed.” This did not compare deployed coin function prices. |
| `audit:engagement` | “Engagement audit passed.” Daily streak today/yesterday/missing-day rules checked. |
| `audit:seo` | “SEO audit passed with no structural errors.” 18 pages / 18 sitemap URLs. |
| `audit:pwa` | “PWA/mobile readiness audit passed with no structural errors.” |
| `audit:deep-dives` | Pass: 32 lessons, 106 sections, 171 structurally checked generated questions, 313 cards / 29 sets, 28 objective groups, four recommendation checks, 14 enrichment-labeled lessons, 113 references / 99 distinct URLs. These counts are not factual/learning-effectiveness certification. |
| `audit:editorial` | Pass: 395 active MCQs (397 reviewed, 2 admin disables), 88 PBQs, 32 lessons, 171 generated questions; 44 retired MCQs / 21 retired PBQs; 56 captured overrides and p003/p017 adapter checks. |
| `audit:qbank:strict` | “Audit passed with no structural errors.” MCQ 395 (508 base, 105 imported, 201 hidden); PBQ 88 (100 base, 22 imported, 17 hidden). Final counts also reflect snapshots/retirement. |
| Whole-bank runtime census | **PASS, exit 0**: metadata counts in §2; checked all 56 remote override payloads and both remote PBQs; no uncaptured override or DB-only PBQ. |
| Pure RTO and cloud-roundtrip probes | **PASS, exit 0** as probes, exposing deficiencies rather than accepting desired behavior: lesson scores 188.5/103; incorrect 18-card composition; question scores 146/43/14/14; topic reload 32→8; immediate retry clears latest miss. |
| Read-only authenticated Supabase inspection | **Successful** DB-1…DB-5. Verified schema, content, aggregate history, RLS and deployed function definition. No INSERT/UPDATE/DELETE/DDL or purchase call. |
| `git diff --check` and `git diff --cached --check` | **PASS, exit 0** before commit; staged scope restricted to this document. |

No existing build/audit command failed. Do not misreport observed deployment and product gaps as passing feature tests: the existing checks do not cover them. Search/path lookup corrections during inspection are not application-test failures.

Reproducing pure probes without modifying source: load source with `readFileSync`, import helpers from `scripts/lib/read-authored-bank.mjs`, build filtered reviewed arrays, and evaluate the existing contiguous pure function blocks (`getAttemptDate` through `buildMcqPracticePool`; `tokenizeLearningText` through `buildCipherWeakFlashcardSet`; `fromSupabaseAttempt`/`toSupabaseAttempt`) in a Node in-memory harness. Use the exact synthetic history and timestamp in §5.2, pass `now` explicitly, and import `getDeepDiveRecommendations`. No real account is needed and nothing should call `onSave` or a Supabase mutation. For the census, additionally normalize DB-2 PBQs with `readPbqDatabaseAdapters().normalize` and apply `preferReviewedPbq`; exclude snapshot-disabled IDs because `readAuthoredBank` deliberately includes them for editorial checks.

### 13.2 Required Phase 2 tests before learner-visible cutover

1. **Mapping/precedence:** every active MCQ reviewed, valid primary and optional secondary; retired IDs retained historically; snapshot → editorial → live override → newer PBQ conflict cases; invalid/unreviewed mapping cannot affect mastery; unknown concept and missing content link fail closed to legacy selection.
2. **Persistence:** same canonical evidence/state across device reload; shuffled choice identity, PBQ part identity, occurrence/receipt distinction, guest import, network retry/idempotency, concurrent insert, >1,000 events, mapping/algorithm revision replay; session summaries excluded.
3. **Learning states:** first miss; second distinct miss; immediate memorized retry; fresh transfer; delayed retention; unresolved later contradiction; completed intervention then miss; sticky recovery; Proven/Mastered lapse; insufficient coverage; related supporting concept unchanged; out-of-order and duplicate events.
4. **Scheduler:** time and set-count conditions; fresh variant/original task separation; hard repeat/concept/difficulty/remediation caps; cold start/blueprint balance; short pools with explicit shortage; deterministic replay; retired or entitlement-ineligible candidates excluded appropriately.
5. **Trust/ownership:** two test users cannot read/write each other's evidence/state; authenticated caller cannot forge owner, correctness, projection, entitlement or reward; server checks authoritative revision/answer; append-only corrections audited.
6. **Shadow:** compare old/new recommendations and coverage on synthetic and permissioned historical data, log version/reasons, inspect false-positive and false-negative examples, count unnecessary repeats, confirm identical learner-visible sets/rewards while shadow runs.
7. **Observability:** verify actual event ingestion and join IDs; schema/function deployment checks; error/retry monitoring and rollback tested.

Phase 3 adds UI/browser evidence at desktop/mobile widths and keyboard/reduced-motion checks, all guest/free/Pro/earned access entry paths, exact five free PBQs, all Domain 1/no baseline Domain 2–5 lessons, always-available answer explanation/diagnosis, 10–30 enforcement (including alternate starts/resume), and exam cap on actual manifests after count changes/direct state manipulation. These are future verification gates, not completed Phase 1 tests.

Production status: live **database reads** verified; frontend runtime, checkout transactions, HTTP session writes, browser screenshots and deployed bundle state **not verified**. A pushed documentation commit does not establish a production release, and no behavior change is claimed.

## 14. Open decisions requiring founder input

The approved five PBQs, Domain 1 Deep Dive access, 10–30 ordinary MCQ range and 30% exam PBQ cap are **already decided**. Do not reopen them. Resolve these remaining choices before foundation rollout:

1. **Proof evidence budget:** what minimum number of independently authored scenarios and meaningful delay will you accept for Proven/Mastered? Recommendation: keep counts/delays in versioned config, start conservatively, and require enough editorial variants before enabling either label. Do not tune merely to make the dashboard look encouraging.
2. **Free personalised remediation:** should free accounts get the canonical weak/supporting flashcard deck, or only diagnosis, core explanation and targeted MCQs? Current dashboard/Cipher gates disagree. A paid intervention must still leave a useful free next action; otherwise acquisition copy promises a loop the free funnel cannot complete.
3. **Guest PBQ policy:** the plan fixes signed-in baseline access but says guest previews “where applicable.” Which of the approved five should guests preview, and how much interaction is included? p001 must not survive as a stale baseline exception.
4. **Legacy history:** recommendation is to retain raw rows, label reconstructed mappings as legacy/inferred and require new varied/delayed evidence for proof. Confirm that honest low-confidence states are preferable to preserving inflated apparent mastery.
5. **Editorial ownership and pilot scope:** who approves primary/secondary tags and scenario independence, and who authors MTD/MTTR coverage? The bottleneck is reviewed concept coverage, not writing a more elaborate score formula.
6. **Intervention completion:** define completion separately for opening a lesson, finishing guided steps, answering a check and self-rating cards. Only an explicitly defined completed intervention should influence sticky recovery requirements; none alone proves mastery.
7. **Reward/economy reconciliation:** confirm the intended deployed 50/70 coin prices versus observed 30/150 and how to handle existing unlocks. Resolve via a separate reviewed deployment, not hidden inside mastery work. Decide whether the legacy “domain_master” single-perfect-session achievement should remain distinct from concept mastery.
8. **Shadow release gates:** assign owners and acceptance bounds for bad mappings, excessive repeat share, insufficient coverage and missing events; decide the minimum observation window. Historical data without intervention/version evidence cannot answer all of these questions.
9. **Chapter semantics and public percentage:** recommendation is to keep the current five domains as the reporting level initially and show insufficient/provisional evidence until representative concept coverage exists. Confirm before adding another chapter hierarchy or publishing precise competency percentages.

No learning-effectiveness, pass-rate, conversion or defensibility claim is established by this audit. The concrete Phase 2 deliverable is trustworthy, replayable concept evidence plus reviewed content links and a shadow scheduler; the later positioning should follow demonstrated behavior.
