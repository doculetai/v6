# Journey State Map — Design Spec

**Goal:** Document every state a student can be in, every cross-role event, and identify which states have no visual solution in the prototype — to guide what to build next.

**Approach:** Dual-layer map. Layer 1 is the student emotional journey with anxiety peaks marked. Layer 2 is a cross-role event table showing what other roles see at each transition. Layer 3 is the prototype gap analysis with prioritised build order.

**Scope:** Student journey end-to-end. All five supporting roles (Admin, Agent, Sponsor, University, Partner). Partner has no role in the student journey and is omitted from event tables.

---

## Layer 1 — Student emotional journey: every state

### Phase 0 · First session

| State | What student sees | What they can do | Anxiety |
|---|---|---|---|
| `first_session` | Overview, all steps "upcoming", "Begin your application" CTA card at top | Click CTA → setup page | Low — orientation |

**Design note:** No auto-redirect. The student sees the destination before being sent anywhere. The platform feels like it has a plan even before the student does.

---

### Phase 1 · Onboarding

| State | What student sees | What they can do | Anxiety |
|---|---|---|---|
| `onboarding_pending` | Overview with CTA banner pointing to setup | Follow CTA | Low |
| `onboarding_in_progress` | Setup form: school / program / funding type | Fill form, submit | Low |
| `onboarding_complete` | Summary card, step marked done, redirected to Overview | Continue to T1 | Low |

---

### Phase 2 · Phone verification (T1)

| State | What student sees | What they can do | Anxiety |
|---|---|---|---|
| `t1_pending` | Verification page, T1 card as current step | Start verification | Low |
| `t1_verifying` | OTP bottom sheet open | Enter code, resend | Low |
| `t1_complete` | T1 checked off, T2 tier unlocks | Continue to T2 | Low |

---

### Phase 3 · Identity verification (T2) — first anxiety peak

| State | What student sees | What they can do | Anxiety |
|---|---|---|---|
| `t2_pending` | T2 tier card as current step | Start KYC | Medium |
| `t2_in_progress` | Dojah check running, progress indicator | Wait | **High** — "what if it fails?" |
| `t2_failed` | Failure card — precise reason (NIN mismatch / name differs / expired ID) + resubmit action | Correct and resubmit | **Critical** — "Am I locked out?" |
| `t2_manual_review` | "Under manual review" — no action available, no countdown | Wait | **High** — limbo #1 |
| `t2_complete` | T2 checked off, T3 tier unlocks | Continue to T3 | Relief |

**Copy rule for `t2_failed`:** State the failure, name the reason, name the action. Never apologetic. Pattern: `[What failed] · [Why] · [What to do]`. E.g. "Identity check failed · Name on NIN does not match signup name · Update your details and resubmit."

---

### Phase 4 · Banking verification (T3)

| State | What student sees | What they can do | Anxiety |
|---|---|---|---|
| `t3_pending` | T3 tier card as current step | Open T3 | Low |
| `t3_choice` | Two equal choice cards: Connect bank (Mono) vs Upload statement | Choose a path | Low — they are in control |
| `t3_mono_connecting` | Mono OAuth sheet open | Authorise bank | Low |
| `t3_mono_failed` | Error card — bank not supported or connection failed + fallback CTA to upload path | Switch to upload | Medium |
| `t3_mono_complete` | Balance confirmed instantly, T3 done | Continue | Relief |
| `t3_upload_uploading` | Progress bar inline on upload card | Wait | Low |
| `t3_ocr_review` | Extracted data preview: name / account number / bank / balance — all fields editable — confirm before submitting | Review, edit if wrong, confirm | Medium — "is this accurate?" |
| `t3_upload_submitted` | "Under review" state on T3 card | Wait | Medium — limbo #2 |
| `t3_upload_rejected` | Rejection card — admin note shown verbatim — resubmit action + email + bell notification | Resubmit with correct statement | **Critical** |
| `t3_upload_approved` | T3 checked off, Documents step unlocks + email + bell | Continue | Relief |

**Design note on `t3_choice`:** Both options are first-class, presented as side-by-side cards with equal visual weight. No "primary" and "fallback" framing. No dropdown. The student chooses based on preference, not platform hierarchy.

**Design note on `t3_ocr_review`:** Show extracted data before submission. Student must explicitly confirm. If OCR failed, show manual entry fallback with 4 fields and the note: "We could not read this document automatically."

---

### Phase 5 · Documents

| State | What student sees | What they can do | Anxiety |
|---|---|---|---|
| `docs_pending` | Documents page, upload card with requirements | Upload | Low |
| `docs_uploading` | Progress bar inline on upload card | Wait | Low |
| `docs_under_review` | "Under review" badge on document card | Wait | Medium |
| `docs_rejected` | Rejection card — admin note verbatim — resubmit action + email + bell | Resubmit | **Critical** — "Did I lose my spot?" |
| `docs_resubmitting` | Re-upload flow — previous rejection reason still visible for reference | Upload replacement | **High** — navigating failure |
| `docs_approved` | Approved badge on document card | Continue | Relief |

**Copy rule for `docs_rejected`:** Same as T2 failure. State the failure, name the reason, name the action. Never apologetic. The admin note is shown verbatim — exactly as typed. No paraphrasing, no softening. The student is an adult; give them the information.

**Design note:** An approved document is locked from replacement. "This document is already approved. Contact support if you need to replace it." A pending document can be cancelled via "Cancel submission" on the doc card.

---

### Phase 6 · Certificate

| State | What student sees | What they can do | Anxiety |
|---|---|---|---|
| `under_final_review` | Proof page: "Under final review — your proof of funds package is complete. We are preparing your certificate." Journey tracker all green. No action. No countdown. | Nothing — wait | **High** — peak tension. Done everything right, no control. |
| `cert_issued` | Proof page: H1 "Proof of Funds Certificate". Download PDF (desktop primary) + Share (mobile primary: WhatsApp). History tab. | Download / share | **Milestone** — highest positive moment |
| `post_cert_overview` | Overview transforms: H1 "Your proof of funds is verified." Cert card elevated to top. Progress bar removed. | View cert / share | Pride, relief |
| `cert_sharing` | Share sheet: WhatsApp direct share (mobile primary) / Download PDF (desktop primary) / Copy verification URL / Send via Doculet email | Choose share method | Purposeful |

**Design note on `under_final_review`:** This is the hardest state to design. The student has done everything asked of them. They are waiting on an institution. The copy must project institutional composure, not uncertainty. "Under final review" not "Almost there!" No spinner, no progress indicator, no ETA. A firm, calm holding pattern. Like a bank saying "your application is being processed" — the student should feel held, not left hanging.

**Design note on `cert_sharing`:** Certificate sharing priority order for Nigerian mobile context: (1) WhatsApp direct share — `https://wa.me/?text=` intent with the verification URL. Most students will use this. (2) Public verification URL. (3) Download PDF. (4) Doculet sends directly to institution.

---

### Parallel: Sponsor flow

Runs alongside the main journey. Can start at any point after onboarding completes.

| State | What student sees | What they can do | Anxiety |
|---|---|---|---|
| `sponsor_invite_pending` | Invite card on Overview: "Waiting for [Name] to accept" | Resend invite / Cancel | Low-medium |
| `sponsor_committed` | Overview updates: sponsor name + committed amount + funding type label | Continue journey | Relief |
| `sponsor_withdrawn` | Warning card on Overview: "[Name] has withdrawn their commitment. Update your funding." | Choose new funding type | **High** — plan has changed |

---

### Blocked state pattern

Applies to all locked nav items. No item is ever greyed out or unclickable.

| Pattern | What student sees | What they can do |
|---|---|---|
| `blocked_[page]_[reason]` | Blocked state card: what is locked, why, CTA pointing to the prerequisite step | Follow CTA to unblocking step |

Examples:
- Click "Proof of Funds" before verification complete → "Proof of funds is locked · Complete verification first · Go to Verification"
- Click "Documents" before T2 complete → "Documents are locked · Complete identity verification first · Go to Verification"

**Design note:** The blocked card is not an error. It is orientation. The student should understand the sequence, not feel penalised.

---

## Layer 2 — Cross-role event table

### Verification phase

| Event | Student | Admin | Agent | Sponsor | University |
|---|---|---|---|---|---|
| T1 phone verified | T1 checked off, T2 unlocks | — | Student T1 → complete | — | — |
| T2 KYC submitted | "In progress" on T2 card | Manual review queue if flagged | T2 → in progress | — | — |
| T2 fails (name / NIN mismatch) | Failure card — precise reason — resubmit action | — | T2 → failed | — | — |
| T2 flagged for manual review | "Under manual review" — no action | New item: identity review queue | T2 → manual review | — | — |
| T2 approved (auto or manual) | T2 checked off, T3 unlocks | Item resolved | T2 → complete | — | — |
| T3 bank statement uploaded | "Under review" on T3 card | New item: ops queue (FIFO) | T3 → under review | — | — |
| T3 statement rejected by admin | Rejection card — **admin note verbatim** — resubmit + email + bell | Item resolved | T3 → rejected | — | — |
| T3 statement approved by admin | T3 checked off, Documents unlocks + email + bell | Item resolved | T3 → complete | — | — |
| T3 Mono connected | T3 instant complete — no admin step | — | T3 → complete | — | — |

### Documents phase

| Event | Student | Admin | Agent | Sponsor | University |
|---|---|---|---|---|---|
| Document uploaded | "Under review" badge on doc card | New item: ops queue (FIFO) | Doc count updates | — | Doc count on roster |
| Document approved by admin | Approved badge + email + bell | Item resolved | Doc → approved | — | Approved count updates |
| Document rejected by admin | Rejection card — **admin note verbatim** — resubmit + email + bell | Item resolved | Doc → rejected | — | — |
| Student resubmits rejected doc | "Under review" again | New item re-enters queue | Doc → resubmitting | — | — |
| All documents approved | Overview → "under final review"; Proof page updates | Student enters cert-ready state — admin can now issue | All docs → complete | — | Student status → ready |

### Certificate phase

| Event | Student | Admin | Agent | Sponsor | University |
|---|---|---|---|---|---|
| Admin issues certificate | Cert-issued page + email + bell + Overview transforms | Cert record created | Commission entry created (pending) | "Cert issued" badge on student card | Cert ID on student roster |
| Student downloads / shares cert | Sharing sheet opens | — | — | — | — |
| Agent commission paid | — | — | Commission → paid | — | — |

### Sponsor flow

| Event | Student | Admin | Agent | Sponsor | University |
|---|---|---|---|---|---|
| Student sends sponsor invite | Invite card: "Waiting for [Name]" | — | — | Receives invite link by email | — |
| Sponsor registers + commits | Overview updates: sponsor name + committed amount | Sponsorship visible on student record | Sponsor status → committed | Confirmation screen | — |
| Sponsor withdraws commitment | Warning on Overview — update funding CTA | Sees change in sponsorship record | Sponsor → withdrawn | Confirmation of withdrawal | — |

### Three structural insights

**1. Admin is the only role that can unblock the student.** Every rejection, approval, and cert issuance passes through admin. If admin is slow, every student is in limbo — with no visibility into queue position or wait time. This is a deliberate design: no SLA is stated, no ETA is shown. The student should feel held, not given a false promise.

**2. Agent is read-only, but the highest-frequency non-student user.** They have more touchpoints than any other role but zero ability to act. Their value is as a human proxy — they can call the student when they see a rejection before the student even opens the app. The read-only constraint is intentional and must never be violated.

**3. Sponsor and University are nearly invisible during the journey.** They see outcomes (cert issued, doc count) but not process. This is a deliberate trust boundary. It also means they cannot help the student or advocate for them when things stall — which is by design.

---

## Layer 3 — Prototype gap analysis

### Student journey gaps

| State | In prototype? | Gap type |
|---|---|---|
| `first_session` | No — overview shows mid-journey | Missing page state |
| `t1_verifying` | No — tier card only | Missing interaction |
| `t2_failed` | **No** | **Anxiety peak** |
| `t2_manual_review` | **No** | **Limbo state** |
| `t3_choice` | **No** — T3 is a single card, no choice moment | **Key decision point** |
| `t3_ocr_review` | **No** | **Key interaction** |
| `t3_upload_submitted` | **No** | Missing under-review state |
| `t3_upload_rejected` | **No** | **Anxiety peak** |
| `t3_mono_failed` | **No** | Missing error state |
| `docs_rejected` | **No** | **Anxiety peak** |
| `docs_resubmitting` | **No** | Missing recovery flow |
| `under_final_review` | **No** — prototype jumps to cert-issued | **Highest tension state** |
| `post_cert_overview` | **No** — overview still shows stepper | **Milestone moment** |
| `cert_sharing` | Partial — buttons exist, no sheet | Missing flow |
| `sponsor_invite_sent` | **No** | Missing parallel flow |
| `sponsor_committed` | Partial — stats show numbers, no state change | Missing transition |
| `sponsor_withdrawn` | **No** | **Anxiety peak** |
| `blocked_[page]` | **No** | Missing UX pattern used on 4+ nav items |

### Cross-role gaps

| Moment | In prototype? | Gap type |
|---|---|---|
| Admin writes rejection note → appears verbatim on student doc card | No | Bidirectional feedback loop |
| Agent sees student rejection in real-time | No — student detail is static | Agent read-only view state |
| Sponsor sees "Cert issued" badge appear on student card | Partial — sponsor overview is static | State transition |
| University sees cert ID appear on student roster | No | Roster update |

---

## Build priority

**Tier 1 — Prototype first** *(anxiety peaks — design fails here if these are wrong)*
1. `docs_rejected` + `docs_resubmitting` — most common deviation from happy path
2. `under_final_review` — peak tension, zero action, needs careful copy + visual restraint
3. `t3_upload_rejected` — same pattern as docs but within verification
4. `first_session` — first impression, sets trust baseline
5. `blocked_[page]` — pattern used across 4+ nav items, needs one canonical solution

**Tier 2 — Prototype second** *(key decision and milestone moments)*
6. `t3_choice` — Mono vs upload, two equal paths, must feel peer to peer
7. `t3_ocr_review` — student reviews extracted data before submitting
8. `post_cert_overview` — the payoff moment, overview transforms
9. `cert_sharing` — WhatsApp primary on mobile, PDF primary on desktop
10. `sponsor_invite_sent` + `sponsor_committed` — parallel flow affecting Overview

**Tier 3 — Complete for thoroughness**
11. `t2_failed` + `t2_manual_review`
12. `t3_mono_failed`
13. Admin→student rejection note bidirectional loop (shown simultaneously in ops queue + student card)
14. University roster cert ID appearance

---

## What this means for the prototype

The current `sidebar-preview.html` prototype shows a world where everything works. Tier 1 is the world where things don't — and that is the world most students actually live in during their first weeks on the platform. The five Tier 1 states represent approximately 60–70% of real student sessions once the platform is live.

The prototype needs a **state-switcher**: a way to toggle the student into different journey states without rebuilding the page data each time. The current approach (one set of PAGES data per role) works for happy-path pages but cannot represent the same page in multiple states. The next step is to add a student state dimension to the prototype.
