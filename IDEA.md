# website-playground

## 📱 Main Navigation Structure ### Sidebar Navigation (Always Visible) **shadcn/ui Components:** Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton **Framer Motion:** motion.div with layout prop for smooth collapse/expand



Conventions (applies to all flows)
RBAC: Roles = Owner, Manager, Technician, Accountant, Subcontractor, ReadOnly. Use Postgres RLS for tenant + per-record ACL. Use Casbin to express policy (who can transition which state).
State machines (server-guarded):
Quote: Draft → UnderReview → Sent → Viewed → Accepted → Rejected → Expired
Job: Planned → Scheduled → InProgress → Blocked → Completed → Archived
PO: Draft → Ordered → Confirmed → Shipped → Delivered → Inspected → Closed | Claimed
Invoice: Draft → Issued → PartiallyPaid → Paid → Overdue → WrittenOff
Offline-first: PWA + IndexedDB (Dexie/RxDB), tus resumable uploads, TanStack Query persist.
AI agents are assistive (propose → human approves), with full audit logs (EventLog).
UI kit: shadcn/ui (+ Tailwind), Framer Motion (micro-interactions only), TanStack Form stack (react-hook-form + zod), TanStack Table, TanStack Query.
Media: react-dropzone + browser-image-compression + EXIF read.
PDF: server render (Playwright/Chromium).
Drag & drop: dnd-kit.
1) Quote / Offer Creation & Delivery
1.1 Start New Quote
Trigger: User taps “New Quote” (Dashboard or Jobs).
Inputs: Client lookup (search), or create client; optional building/site.
Process:
Command dialog to search Client/Building; or “New Client/Building” forms (zod-validated).
Attach Capture Session (can start now or later).
Initialize Quote: {client_id, building_id, status: Draft}.
Outputs: Quote Draft.
RBAC: Technician+ can create.
Libs: shadcn Dialog, Command; react-hook-form/zod.
1.2 Capture Session (photos, blueprints, notes) — offline-capable
Trigger: From Quote Draft.
Inputs: Photos (camera), PDFs/images (blueprints), voice notes (auto-transcribe), measurements.
Process:
Batch capture; compress and queue uploads (tus).
Extract EXIF GPS, timestamp; allow manual correction.
Voice → text (on-device if offline; cloud when online).
All artifacts linked to quote_id.
Outputs: Media[], Notes[], Measurements[].
AI (Intake Agent): optional pre-processing OCR for blueprint text/markings.
Libs: react-dropzone, browser-image-compression, Web Speech or client recorder.
1.3 Site & Client Details
Inputs: Contact prefs, access info, separate building address, preferred windows.
Process: Validated form; store on Quote + Building.
Outputs: Updated Quote meta.
Edge: Duplicate client detection (email/phone fuzzy match with pg_trgm).
Libs: react-hook-form, zod.
1.4 AI Draft of Line Items (assemblies/kits)
Trigger: User clicks “Propose Line Items”.
Inputs: Capture artifacts + prior quotes + product catalog + kits (parametric rules).
Process:
Intake Agent produces QuoteDraft (zod schema): {lines[], accessories[], labor[], risks[], missing_info[]}.
Show Diff Review: accept/reject per line.
Parametric kits (e.g., frame type, glazing, width/height) auto-calc material + labor.
Outputs: Quote lines staged; missing info checklist.
RBAC: Anyone can request; only Manager/Owner can persist overrides to kit rules.
Libs: LangGraph (tool orchestration), zod.
1.5 Configure Products & Pricing
Inputs: Search catalog, select kits, sizes, finishes, quantities, delivery windows.
Process:
TanStack Table editor with row-level options; min/max constraints.
Real-time price calc (cost + markup rules).
Margin guardrail: if gross_margin < floor, auto-route to UnderReview.
Outputs: Updated totals; status stays Draft or moves to UnderReview.
RBAC: Only Manager+ can approve sub-floor margins.
Libs: TanStack Table; number animation minimal (Framer Motion).
1.6 Internal Approval (optional)
Trigger: Margin, risk, or policy requires review.
Process:
Approver sees diff (who/what changed), comments, approve/reject.
Outputs: UnderReview → Draft (changes requested) or UnderReview → Sent (after next step).
Libs: AlertDialog, Sheet.
1.7 Generate Client-Facing Quote & Send
Inputs: Terms, validity, logo, cover note; visibility flags (hide internal notes).
Process:
Render PDF preview (Playwright).
Create public portal link with read-receipt.
Send via email/SMS (templates DE/FR/IT).
Outputs: Quote Sent; DeliveryEvent{sent}.
State: Sent → Viewed on open; Sent → Expired at validity end.
Libs: email service (Resend/Postmark), SMS (Twilio), PDF (Playwright).
1.8 Client Acceptance / Rejection
Inputs: Client approves in portal (checkboxes, e-sign).
Process:
Acceptance captures signer identity, IP, timestamp.
Rejection prompts reason.
Outputs: Accepted or Rejected.
State: Viewed → Accepted/Rejected.
RBAC: Auto; audit in EventLog.
2) Job Creation, Planning, and Execution
2.1 Convert Accepted Quote → Job
Trigger: Quote Accepted.
Process:
Create Job with carried artifacts (lines, building, contacts).
Initialize tasks: site prep, install, cleanup, QC, handover.
Outputs: Job Planned; tasks scaffolded.
Libs: server action; EventLog entry.
2.2 Schedule & Assignment (constraint-aware)
Inputs: Target window, durations, team skills, certifications, vehicle capacity, travel time.
Process:
Scheduling Agent proposes schedules (option sets).
Conflict detection: overlapping jobs, time-off, cert expiry.
Dispatcher selects; assignments written to Job and personal calendars.
Outputs: Job Scheduled; task assignees set; calendar events pushed.
RBAC: Manager+ confirms schedule.
Libs: Calendar = @fullcalendar/react (resource view) or react-big-calendar; Maps (optional) Mapbox for travel estimates.
2.3 Purchase Orders from Job Scope
Inputs: Accepted lines, on-hand inventory, lead times, supplier SLAs/OTD, prices.
Process:
Procurement Agent proposes PO splits by supplier, delivery dates, alternates if backordered.
User reviews, edits, approves → POs Draft → Ordered.
Outputs: One+ POs; expected deliveries noted.
RBAC: Manager/Owner approves.
Libs: TanStack Table; dnd-kit for splitting lines; supplier score computed server-side.
2.4 PO Tracking & Receiving
Process:
Status flow: Ordered → Confirmed → Shipped → Delivered.
On receipt: enter received qty, batch/serial; link photos; mark Inspected.
Defects create Issue tied to POItem and InstalledItem (if applicable).
Outputs: PO: Inspected → Closed or Claimed.
Libs: shadcn Badge, Card; optional barcode scan (QuaggaJS/ZXing).
2.5 On-Site Execution
Inputs: Assigned tasks; checklists; drawings; customer communication.
Process:
Work mode (mobile): start/stop time; add progress notes; capture photos “before/during/after”.
Associate each installation photo with the specific line item.
If blocked (missing parts, access issues) → Job Blocked with reason + next action.
Outputs: Progress logs; time entries; media.
Offline: queue; sync when online.
2.6 Quality Control & Issues
Inputs: QC checklist per scope; required photos; measurements.
Process:
Failures create Issue (severity, type, owner: internal vs supplier).
Supplier issues auto-draft claim package (photos, PO, item serials).
Outputs: Issues list; claims tracked; SLA timers for follow-up.
Libs: Alert, Textarea; claims email templates.
2.7 Client Handover & Warranty
Inputs: Client sign-off (signature), warranties, manuals.
Process:
Capture e-sign; generate handover PDF bundle; create InstalledItem records with warranty end, maintenance interval.
Outputs: Job Completed; artifacts stored; reminders scheduled.
Libs: react-signature-canvas, PDF render.
3) Invoicing, Payments, Reconciliation, Dunning
3.1 Create Invoice (final or partial)
Trigger: Job Completed (final) or milestone reached (partial).
Inputs: Line items (materials/labor), taxes (Swiss VAT), retainage.
Process:
Auto-populate from Job; allow adjustments; compute VAT.
Generate Swiss QR bill (QR-IBAN) and embed.
Outputs: Invoice Draft with PDF preview.
Libs: swiss-qr-bill, Playwright, currency formatting.
3.2 Issue & Deliver Invoice
Process:
Validate billing contact; email with PDF + client portal; optional SMS link.
Set due date per payment terms (NET 30, etc.).
Outputs: Invoice Issued; delivery events logged.
State: aging starts.
RBAC: Accountant/Manager+.
3.3 Payment Capture & Auto-Matching
Inputs: Bank statements (CAMT.053 upload/API), manual payments, cash.
Process:
Deterministic matcher: exact amount → invoice; heuristics: amount/counterparty/ESR ref/date window.
If confidence < threshold → queue for review.
Partial payments update status to PartiallyPaid.
Outputs: Payments created; Invoice state updated to Paid when fully matched.
AI (Reconciliation Explainer): Summarize reasons for match/unmatch; draft customer replies if needed.
Libs: CAMT parser (custom or iso20022-style), rule engine.
3.4 Overdue & Dunning
Trigger: Invoice Overdue (past due date).
Process:
Dunning sequence (soft → firm): localized templates; attach statement of account; schedule reminders.
Escalation to collections (manual trigger).
Outputs: Reminder events; status notes.
RBAC: Accountant/Owner.
3.5 Refunds, Credits, Write-Offs
Process:
Create credit notes; reference original invoice; update balances.
Write-off creates accounting entry; requires Owner approval.
Outputs: Adjusted ledger; audit entries.
4) Client & Building Management
4.1 Client Profile
Inputs: Org/person details, contacts, payment terms, preferences.
Process: Create/update; detect duplicates; set default language/currency.
Outputs: Client record; ACL defaults for their related Buildings.
Libs: react-hook-form, zod.
4.2 Building / Site
Inputs: Address, access info (codes, keys), photos, contacts on site.
Process: Create building under client; link prior jobs.
Outputs: Building record; quick actions.
Offline: cache for on-site work.
4.3 Installed Product Registry & Service History
Inputs: From Jobs/POs/Inspections.
Process: Create InstalledItem per product with serials, warranty end, maintenance interval.
Outputs: Filterable registry; map to future service visits.
AI (Maintenance Planner): Suggest batches due soon, grouped by geography/date to minimize travel; propose service jobs.
5) Team Management
5.1 Team Member Profiles
Inputs: Personal info, photo, role, hourly rate, skills, certifications (expiry).
Process: Create/update; upload cert docs; set availability defaults.
Outputs: Team records; warnings on expiring certs.
Libs: Badge for skills; scheduled checks for expiry.
5.2 Scheduling & Assignment
Inputs: Job needs, team availability, constraints.
Process:
Scheduling Agent proposes; dispatcher confirms.
Enforce skill gating: if missing required certs → block/override with reason (audited).
Outputs: Assignments + calendar entries; push notifications.
5.3 Time Tracking
Inputs: Start/Stop timers or manual entries; job/task contexts.
Process:
Mobile-friendly timer with offline buffer; optional geo nudge (“You seem near Site X—start time?”).
Approvals by Manager.
Outputs: Time logs; labor cost roll-up to Jobs.
5.4 Performance & Safety
Inputs: Job outcomes, QC pass rate, rework, client feedback.
Process: Compute fair metrics normalized by job complexity; flag outliers for coaching.
Outputs: Weekly digest to Owner/Manager.
AI (Coaching Digest): Narrative summary with actionable suggestions.
6) Suppliers & Orders
6.1 Supplier Directory
Inputs: Contact, SLA, lead times, catalogs, terms.
Process: Maintain ratings: OTD %, defect rate, avg response time.
Outputs: Supplier profile; score used in PO suggestions.
6.2 Catalog Integration
Inputs: CSV/API import; price lists; options.
Process: Normalize SKUs, options, UOM; map to kits.
Outputs: Searchable catalog.
Libs: server jobs + background workers for imports.
7) Reports & Dashboard
7.1 Decision Cards (Home)
Cards:
Cash in next 14 days (p50/p90).
Jobs at risk (blocked >48h or missing parts).
Overdue invoices by aging bucket.
Supplier OTD trend.
Team availability today/tomorrow.
Actions: Each card offers a one-click remediation (e.g., “Email ETA request to Supplier X”).
Libs: recharts (simple line/bar/pie), shadcn Card, TanStack Query for data.
7.2 Activity Feed
Process: Stream of EventLog items (quotes sent, POs received, payments matched).
Actions: Filter, jump-to-record, undo (if allowed).
8) Settings & Integrations
8.1 Company Settings
Inputs: Branding, tax details, default payment terms, email templates.
Process: Validate VAT numbers; render template previews.
Outputs: Org config applied to PDFs/emails.
Libs: swiss-qr-bill verification where relevant.
8.2 RBAC & Permissions
Inputs: Role policies, record shares (per-client/job).
Process: Update Casbin policies; RLS ensures row-level isolation.
Outputs: Immediate effect; audited changes.
8.3 Integrations
Banking: OAuth/Open Banking or manual CAMT.053 upload; PAIN.001 export.
Accounting: Bexio/Abacus connectors (sync customers, invoices, payments).
Calendar: Google/Outlook (two-way events for assignments).
Suppliers: Catalog sync (API/CSV).
Outputs: Sync status, last run, error queue with retry.
8.4 User Preferences
Inputs: Language (DE/FR/IT), units, notifications, reduced motion, dark mode.
Process: Persist per user; apply instantly.
Outputs: Personalized UX.
9) Global Navigation, Search & Commands
9.1 Command Palette (⌘K)
Inputs: Free text.
Process: Fuzzy search across Clients, Buildings, Jobs, Quotes, Invoices, POs. Quick actions: “Create Quote”, “Log Time”, “Upload Photos”.
Outputs: Navigate or execute action.
Libs: shadcn Command; Postgres tsvector + pg_trgm.
10) Error Handling, Recovery, and Audit
Uploads: Show progress; auto-retry with exponential backoff; manual “Retry”.
Conflicts: Last-write-wins with merge UI for critical forms; log conflicts.
Guards: State transitions only via server endpoints with business rules.
Audit: Every user/agent action → EventLog (who, when, before/after).
Undo: Safe operations offer revert until dependent state changes.
11) Data Artifacts (created/maintained across flows)
Quote (+ Lines, Attachments, Approval trail).
Job (+ Tasks, Assignments, Time logs, Media, QC checklists).
PO (+ Items, Receipts, Inspections, Claims).
Invoice (+ Payments, QR payload, Dunning history).
Client/Building (+ InstalledItems, Service history, Access info).
TeamMember (+ Skills/Certs, Availability).
Supplier (+ SLA metrics, Catalog).
Events (system-wide audit).
12) AI Agents (scope, tools, review)
Intake Agent: Proposes QuoteDraft from capture artifacts + catalog/kits. Tooling: OCR, blueprint parsing, catalog search. Output: zod-validated lines + gaps. Human review required.
Procurement Agent: Splits accepted scope into POs, proposes suppliers/dates; flags risks (backorders). Human approve.
Scheduling Agent: Suggests assignments honoring constraints; human confirm.
Reconciliation Explainer: Explains matches/unmatches; drafts customer emails; no funds movement.
Maintenance Planner: Groups upcoming services by geography/time; drafts service jobs.
All agents: non-destructive by default, produce drafts, show diffs, log prompts/tools/outputs.
Ready-to-build Notes
Keep animations subtle and respect prefers-reduced-motion.
Prioritize offline capture, state guards, and auditability—these make or break field apps.
Use kits/assemblies and templates to cut quote creation time by >50%.
Make every “smart” suggestion explainable and reversible.
If useful, I can turn these flows into XState machines (JSON/statecharts) and a minimal Next.js/shadcn scaffold with the Quote → Job path and all server guards baked in.