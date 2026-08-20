# Gamified Productivity App — Product Vision v3

> **Status:** Working concept document, not an implementation spec.  
> **Purpose:** Define the app we actually want before the current prototype dictates the answer. Everything in the existing app can change. Keep what serves this vision; replace what does not.

---

# 1. The product in one sentence

A **real, highly customizable project-management system whose real-world work powers a deep, modular management game** built around short replayable challenges, item discovery, transformation chains, themed Play Packs, skill trees, automation, visible world growth, and meaningful choices.

The project-management layer should be good enough to trust with real life.

The game layer should be good enough that I sometimes open the app because I want to know what happens next.

The fantasy is not:

```text
complete task
→ +10 XP
→ number goes up
```

It is:

```text
complete real task
→ prove it
→ earn Effort
→ receive an Item drop
→ use / combine / route it
→ complete a recipe, order, upgrade, collection, or unlock
→ make a choice
→ gain a capability
→ visibly change the world
→ expose something new
→ want to come back
```

The core distinction:

> **The game does not merely reward real work. Real work is the raw material the game runs on.**

---

# 2. Two layers, one product

## The project-management layer

This is where I trust the app with reality.

It answers:

- What am I working on?
- What needs to happen?
- What matters today?
- What is blocked?
- What changed?
- What am I waiting on?
- Am I still on pace?
- If I do less today, what changes?
- If I do more, what changes?
- How do I want to see this information?

It should support:

- projects
- tasks
- milestones
- dependencies
- repeating work
- priorities
- dates
- flexible success levels
- pacing
- custom fields
- tags
- saved views
- list / board / calendar / timeline views
- filters
- grouping
- sorting
- proof settings
- project templates

## The game layer

This is where reality becomes rewarding.

It answers:

- What did that work produce?
- What Item did I get?
- What can I make with it?
- What combines with what?
- What should I upgrade?
- Which skill path do I want?
- What should staff automate?
- What is about to unlock?
- Why is that thing still locked?
- What changed in my world?
- What rare thing could happen next?

Neither layer should feel bolted onto the other.

They share the same underlying events.

---

# 2A. Project-management architecture

The project-management layer needs to be treated as a **full product**, not merely the input form for the game.

The safest architecture is:

```text
PROJECT-MANAGEMENT LAYER
│
├─ Projects
│  ├─ Overview
│  ├─ Tasks / Subtasks
│  ├─ Milestones
│  ├─ Dependencies
│  ├─ Views
│  ├─ Files / Notes / References
│  ├─ Activity / History
│  └─ Archive
│
├─ All Tasks
│  ├─ Saved views
│  ├─ Search
│  ├─ Filters
│  └─ Archive / History
│
├─ Today
│  └─ Cross-project focus view
│
└─ Inbox / Notifications
   └─ Things that changed or need a decision
```

**New Project is an action, not a permanent destination.** The durable object is a **Project**.

Tasks can belong to a project, but they do not have to. A quick personal task can live in an Inbox or standalone list until the user decides whether it belongs somewhere.

## Patterns worth borrowing from Asana, Monday and Notion

### From Asana

Borrow the idea that one project can be seen through multiple lenses without changing the underlying work:

- list
- board / Kanban
- calendar
- timeline
- Gantt-style planning
- project overview
- milestones
- dependencies
- custom fields
- saved filters / views
- activity and status history
- portfolio-level rollups

### From Monday

Borrow the idea that the record is highly configurable:

- many column / field types
- user-defined status labels
- subitems
- dependencies
- date and timeline fields
- automations based on state or date
- deadline-aware states
- archive / restore
- activity log
- per-board views
- notification recipes
- higher-level portfolio boards

### From Notion

Borrow the idea that the same underlying records can be shaped differently in each view:

- table
- list
- board
- calendar
- timeline
- gallery where useful
- charts / dashboards where useful
- relations
- rollups
- formulas
- sub-items
- dependencies
- per-view filters
- per-view sorting
- grouping / sub-grouping
- per-view property visibility

The app does **not** need to copy all of these interfaces. It needs to understand the classes of problems they solve.

---

# 2B. Projects and views

## A Project is the container

A Project can represent:

- a defined deliverable
- an ongoing operation
- a routine
- a collection
- a deadline
- a campaign
- a backlog
- a multi-phase effort
- a set of recurring responsibilities
- a goal with measurable progress
- an open-ended area of life

A project record can eventually support:

```text
Project name
Description / brief
Status
Project type
Start date
Target / due date
Date policy
Owner
Participants
Priority
Health
Progress
Milestones
Sections / phases
Tags
Custom fields
Files / links
Default task settings
Default proof setting
Default notification policy
Default Play Pack
Personal reward
Archive state
Created / modified / completed timestamps
```

## Project views

Every Project can offer views over the **same task records**.

### Overview

Best for:

- project brief
- status
- next milestone
- current pace
- blockers
- recent changes
- progress
- personal reward
- game relationship

### List / Table

Best for:

- dense task editing
- fields
- sorting
- filtering
- bulk changes
- scanning lots of work

### Board / Kanban

Best for:

- status workflows
- pipelines
- content production
- request queues
- sales / hiring / editorial flows

Cards can move between status columns.

### Calendar

Best for:

- due dates
- appointments
- publishing schedules
- classes
- events
- recurring work

Tasks without a date remain available in an **Unscheduled** tray instead of disappearing.

### Timeline

Best for:

- start and end dates
- phases
- overlapping work
- dependencies
- planning across weeks or months

Tasks with no dates stay in an **Unscheduled** tray.

### Gantt / Dependency view

Potential later view for:

- complex dependency chains
- baselines
- critical paths
- major launches
- renovations
- research projects

This can be a more advanced version of Timeline rather than a first-release requirement.

### Dashboard / Charts

Potential later view for:

- project progress
- throughput
- counts by status
- capacity
- completed work
- progress against target

### Activity / History

Not a normal planning view.

It answers:

- What changed?
- Who or what changed it?
- When was this moved?
- Was this completion undone?
- When did the due date move?
- What automation fired?
- What was the old value?

History should be searchable and reversible where possible.

### Archive

Completed, abandoned and intentionally hidden work belongs here.

Archive is **not deletion**.

Archived Tasks and Projects:

- stop cluttering active views
- remain searchable
- remain in history
- can be restored
- retain their game/history consequences
- do not disappear from completed-project legacy

---

# 2C. Tasks are universal records with composable behavior

The biggest taxonomy risk is treating every behavioral difference as a completely separate kind of task.

Instead, separate:

1. **what progress means**
2. **how the task is scheduled**
3. **how it completes**
4. **what other behavior is attached**

A task can combine several behaviors.

## Core progress models

### 1. Binary

```text
Not done
→ Done
```

Use for:

- send email
- buy item
- submit form
- call someone
- clean fridge

### 2. Counting / Quantity

```text
0 / 65 chapters
3 / 20 applications
14 / 50 boxes
```

Use for anything where units accumulate.

Fields:

```text
Unit name
Starting value
Target value
Current value
Minimum
Target
Stretch
Pacing rule
Rounding rule
```

### 3. Duration / Time

```text
0 / 30 minutes
2.5 / 10 hours
```

Use for:

- study
- practice
- focus
- exercise
- research

Can log:

- timer
- manual duration
- imported duration later

### 4. Subtask / Checklist rollup

```text
5 / 8 steps complete
```

The parent completes when:

- all required subtasks finish
- a configured threshold finishes
- the user manually closes it

### 5. Milestone

A meaningful marker rather than ordinary work.

Examples:

- Draft approved
- Book finished
- Venue booked
- Phase 1 complete

A milestone can be:

- manually reached
- automatically reached when requirements are satisfied

### 6. Event / Appointment

Something that **happens at a time**, not something that needs to be checked off like a chore.

Examples:

- appointment
- flight
- concert
- interview
- class

Possible outcomes:

- occurred
- canceled
- rescheduled
- no longer relevant

### 7. Approval / Decision

The desired action is a state choice.

Examples:

- approve draft
- pick vendor
- accept / reject request
- choose final design

Possible outcomes can be custom.

### 8. Waiting / External

The user is waiting for something outside their control.

Examples:

- waiting for client response
- waiting for package
- waiting for permit
- waiting for teammate

The meaningful actions are:

- received / unblocked
- follow up
- change expected date
- stop waiting

### 9. Status-only / Tracking record

Some records should be tracked without ever becoming "Done."

Examples:

- lead in a pipeline
- idea
- reference item
- ongoing asset
- maintenance record

These behave more like database records than checkboxes.

## Scheduling behaviors

Separate from progress model:

```text
No date
Start date
Due date
Start + due date
Date range
Specific time
Flexible day
Flexible week
Recurring
Window / "sometime between"
Expected date
Deadline
Season / phase
```

## Modifiers

A Task can additionally be:

```text
Repeating
Blocked
Blocking
Dependent
Anytime
Optional
Required
Bonus
Proof-required
Milestone-linked
Waiting
Assigned
Private
Archived
Game-enabled
Notification-muted
```

This keeps the data model composable.

---

# 2D. Counting and pacing

Counting is one task/project behavior, not the default shape of all productivity.

A counting track needs two separate decisions:

## What is anchored?

### Deadline holds

```text
Finish 65 chapters by Aug 30.
```

The work remaining must adapt.

### Pace holds

```text
Read 5 chapters per session.
```

The projected finish date adapts.

### Fixed plan

```text
These exact amounts and dates are the plan.
```

The app reports actual vs. plan without rewriting it.

### Forecast only

```text
Do not change anything.
Tell me where this pace leads.
```

## How should variance ripple?

### Smooth

Spread the difference across the remaining eligible sessions.

```text
Miss 5 chapters
→ add a small amount to many future sessions
```

Best for:

- reading plans
- savings contributions
- study targets
- long training blocks

### Consume

Keep the planned chunks intact and consume or shift them.

```text
Do 10 chapters instead of 5
→ tomorrow's 5-chapter chunk is already consumed
```

or:

```text
Miss today's 5
→ the remaining 5-chapter chunks slide forward
```

Best for:

- lesson modules
- boxes to unpack
- discrete batches
- content backlogs

### Fixed

Never rewrite the plan.

```text
Planned: 30
Actual: 36
Ahead by: 6
```

Best for:

- baselines
- quotas
- reporting
- training plans where the original schedule matters

The setup flow should recommend a sensible combination, but advanced users can choose explicitly.

---

# 2E. Task states and state-based actions

"Overdue" should be **information plus options**, not punishment.

## Unscheduled

```text
NO DATE
Write About page
```

Direct actions:

- schedule
- add to Today
- start now
- move to project
- archive

Notifications: none by default.

## Upcoming

```text
FRI
Write About page
```

Direct actions:

- start early
- reschedule
- edit
- open dependencies

Notifications: optional advance reminder.

## Due today

```text
TODAY
Write About page
```

Direct actions:

- start
- log partial progress
- complete
- defer
- change plan

Notifications follow the project/task preference.

## Ahead

```text
AHEAD BY 6 CHAPTERS
Projected finish: Aug 28
```

Direct actions:

- bank progress
- pull next chunk forward
- take a rest day
- keep original schedule

No notification by default. Being ahead should not generate nagging.

## Blocked

```text
BLOCKED
Waiting on: Site positioning
```

Direct actions:

- open blocker
- remove dependency
- change blocker
- notify me when unblocked
- follow up

Notifications:

- when blocker clears
- optional reminder if blocked unusually long

## Waiting

```text
WAITING
Client response
Expected: Aug 22
```

Direct actions:

- mark received
- follow up
- snooze expected date
- stop waiting

Notifications:

- on expected date
- optional follow-up reminder

## Overdue / unresolved

Use a visible but neutral state:

```text
NEEDS A DECISION
Was due Aug 18
```

Direct actions depend on the Task's behavior:

- complete now
- log what actually happened
- move to today
- reschedule
- redistribute
- keep original plan
- trim scope
- skip / waive
- archive
- change deadline

Notifications:

- one useful alert by default
- repeating reminders only if the user opts in
- no endless shame loop

## Completed

```text
DONE AUG 19
```

Direct actions:

- undo
- view completion details
- view game chain
- duplicate
- archive
- add note

## Skipped / Waived

Distinct from Done.

```text
WAIVED
No longer required
```

This should not falsely count as completed real work for game rewards.

## Archived

Hidden from active planning.

Direct actions:

- restore
- duplicate
- permanently delete where permitted

---

# 2F. Notifications and Inbox

Notifications should be configurable enough for serious PM use without turning the app into another source of anxiety.

## Notification policy can inherit

```text
Global default
→ Project default
→ Task override
```

## Useful notification types

- due soon
- due today
- due time reached
- overdue / needs decision
- dependency cleared
- expected response date reached
- recurring Task generated
- milestone reached
- pace became unrealistic
- project forecast moved
- assignment or relevant record change
- automation ran
- automation failed
- challenge / game unlock ready

## Notification styles

### Quiet

Only:

- hard deadlines
- dependencies becoming available
- user-requested reminders

### Balanced

A default:

- one due reminder
- one "needs decision" notice if missed
- meaningful project-state changes

### Structured

For people who want more accountability:

- configurable lead times
- follow-up after due
- recurring unresolved reminder
- daily digest

The user should be able to choose **digest instead of interruptive notifications**.

## Inbox

The Inbox should collect things that genuinely need attention:

```text
Needs decision
Dependency cleared
Expected response reached
Mention / assignment
Project forecast changed
Automation failed
Milestone unlocked
```

Clearing the Inbox does not alter the Task itself.

---

# 2G. One hundred project/task use cases the PM layer should eventually survive

This is a **design stress-test library**, not a promise that every edge case ships in version 1.

For every case, the next design phase should be able to answer how it is created, which fields and views it needs, how dates behave, what completion means, how often it is checked, what happens when reality diverges, what notifications are useful, and which state-based actions belong directly on the record.

## Professional delivery and launches

| # | Use case | Shape | Views and fields | Dates / organization | Completion and check-in | Late / ahead / notification behavior |
|---:|---|---|---|---|---|---|
| 1 | Website redesign launch | Hybrid milestones + binary | List/Board/Timeline/Calendar; status, owner, dependency, start/due, priority | Phases + launch date | Daily; tasks close individually; milestones auto-reach | Late dependencies show schedule impact; replan/move/trim; notify blocker clear, risk, milestone |
| 2 | Software feature release | Milestones + binary + approval | Board/List/Timeline; status, estimate, dependency, environment, approval | Sprint + release target | Several times daily; code/review/test states | Late means release risk; reassign/split/scope/move release; notify review and blockers |
| 3 | Marketing campaign | Phases + recurring + event | Calendar/Board/Timeline; channel, asset type, owner, publish date, approval | Campaign window + publish times | Daily; approved/published closes asset | Missed publish can reschedule/skip/swap; notify approval/publish deadlines |
| 4 | Editorial content calendar | Pipeline/status-only + dated publish | Calendar/Board/List; topic, writer, editor, status, channel | Independent publish dates | Daily/weekly; published is terminal | Missed slot becomes Needs decision; move/swap/cancel; digest reminders |
| 5 | Client onboarding | Template + milestone + waiting | List/Board/Timeline; client, owner, documents, expected response | Target onboarding date | Daily; ready milestone after setup | Waiting is not owned overdue; follow-up/expected-date reminders |
| 6 | Hiring a role | Pipeline + approval + events | Board/Calendar/List; candidate, stage, interviewer, score, next action | Interview dates + target close | Daily; candidates change state | Stale candidate prompts follow-up/archive; notify interview and feedback due |
| 7 | Conference/event production | Milestones + dependencies + event | Timeline/Gantt/Calendar/List; vendor, venue, budget, owner | Long range ending at event | Weekly then daily | Critical lateness shows event impact; contingency/reassign/cut scope; timed reminders |
| 8 | Research study execution | Milestones + counting + waiting | Timeline/List/Dashboard; stage, participant count, owner | Long phases; recruitment target | Weekly/daily; counts + approvals | Behind recruitment shows pace choices; waiting approvals separate |
| 9 | Grant application | Checklist + milestone + hard deadline | List/Timeline/Calendar; section, owner, attachment, reviewer | Immovable submission deadline | Weekly then daily; submitted closes | Before deadline show risk; after deadline missed/closed; strong dependency reminders |
| 10 | Compliance audit prep | Checklist + evidence + approval | List/Table/Dashboard; control, evidence, owner, reviewer | Review window + audit date | Weekly; evidence + review required | Late controls show risk/escalation; archive historical audit with history |

## Operations and service workflows

| # | Use case | Shape | Views and fields | Dates / organization | Completion and check-in | Late / ahead / notification behavior |
|---:|---|---|---|---|---|---|
| 11 | IT support queue | Status-only + waiting + target time | Board/List; requester, category, severity, owner, status | Continuous; some timed | Continuous; close after resolution | Past target prioritizes/reassigns/escalates; notify assignment and reply |
| 12 | Facilities maintenance requests | Status pipeline + event | Board/Calendar; location, asset, severity, vendor | Scheduled or reactive | Daily; close after verified work | Overdue offers vendor follow-up/reschedule; parts delays are Waiting |
| 13 | Monthly financial close | Recurring template + dependencies | List/Timeline; period, owner, evidence, status | Monthly fixed window | Daily during close | Late item shows close impact; notify owners; archive period intact |
| 14 | Customer follow-up workflow | Repeating + waiting | List/Board; customer, last contact, next contact, notes | Expected follow-up dates | Daily; record cycles | Past follow-up becomes Needs contact; contact/snooze/close; configurable reminders |
| 15 | Sales opportunity action plan | Pipeline + waiting | Board/List/Calendar; account, stage, value, next action | Next-action dates; optional close | Daily; opportunity won/lost | Stale opportunity prompts next action; notify follow-up/customer response |
| 16 | Meeting action items | Binary + optional date | List/Today; meeting relation, owner, due, note | Often before next meeting | After meetings + daily | Overdue can move to next meeting/reschedule/waive; no-date stays contextual |
| 17 | Inventory restock | Counting + recurring threshold | Table/List; item, count, reorder point, supplier | Condition-based + delivery date | Weekly/threshold | Below threshold creates action; delivery delay Waiting; notify reorder/arrival |
| 18 | Procurement request | Approval + waiting + pipeline | Board/List; requester, cost, vendor, approval, PO | Approval + expected delivery | Daily/weekly; close when received | Overdue approval vs delivery distinct; follow up/switch/cancel |
| 19 | Employee onboarding operations | Template + milestone + dependencies | List/Timeline/Calendar; employee, system, owner, due | Relative to start date | Daily near start | Late critical tasks show day-one impact; relative deadline/blocker alerts |
| 20 | Opening/closing checklist | Repeating checklist | List/Focus; shift/date, step, verifier | Every shift/day | Every shift; new instance each time | Missed instance stays historical; no infinite overdue copies; near-shift-end reminder |

## Creative and media work

| # | Use case | Shape | Views and fields | Dates / organization | Completion and check-in | Late / ahead / notification behavior |
|---:|---|---|---|---|---|---|
| 21 | Write a novel | Counting + milestones | List/Board/Timeline; chapter, word count, scene, revision | Optional target date | Daily/weekly; log words/chapter milestones | Behind offers smooth/consume/fixed; ahead can bank or move forecast |
| 22 | Podcast episode production | Template pipeline + event | Board/Calendar/List; guest, recording, edit, publish | Recording + publish dates | Several times weekly | Late edit can move publish/reduce scope/expedite; recording/publish reminders |
| 23 | Video production | Phases + dependencies + approval | Board/Timeline/List; script, shoot, edit, review | Ranges + publish date | Daily during production | Blocked footage/review explicit; notify review cleared and deadlines |
| 24 | Design portfolio refresh | Milestones + waiting | Board/Gallery/List; project, asset, feedback, status | Flexible target launch | Weekly | Soft target overdue becomes replan; Waiting feedback not owned lateness |
| 25 | Photo shoot workflow | Event + checklist + pipeline | Calendar/Board/List; shoot date, shot list, edit, delivery | Shoot + delivery dates | Around event then daily | Late pre-shoot work urgent; delivery replan; archive finished shoot |
| 26 | Social content pipeline | Pipeline + repeating/event | Calendar/Board; platform, asset, caption, status | Frequent scheduled times | Daily; published terminal | Missed slot reschedule/skip/swap; pre-publish reminder if manual |
| 27 | Create an online course | Milestones + counting + pipeline | Timeline/Board/List; module, lesson count, record/edit | Long target window | Weekly/daily | Behind lesson pace redistributes; milestone opens next phase |
| 28 | Website content migration | Counting + checklist + QA | Table/List/Dashboard; URL, owner, migrated, QA, redirect | Deadline + batches | Daily; page needs migrate + QA | Consume model useful; extra pages consume future batch; pace warning |
| 29 | Localization project | Pipeline + counting + approval | Table/Board; locale, page/string, translator, reviewer | Release deadline | Daily; translation + review | Behind locale shows quantity forecast; reviewer queue notifications |
| 30 | Research/reference inbox | Status-only + no-date | List/Table; source, topic, tags, project relation | Mostly undated | Weekly; file/discard states | No overdue by default; optional stale-review reminder |

## Learning and study

| # | Use case | Shape | Views and fields | Dates / organization | Completion and check-in | Late / ahead / notification behavior |
|---:|---|---|---|---|---|---|
| 31 | Read a long book | Counting | List/Today/Calendar; current unit, target, pace | Optional finish date | After reading sessions | Smooth/consume/fixed useful; ahead banks; missed day offers replan |
| 32 | Exam study plan | Duration + milestones + checklist | Calendar/Timeline/List; subject, topic, confidence, duration | Hard exam date | Daily; log time/topic | Missed session redistributes; notify exam proximity and severe pace strain |
| 33 | Online course completion | Counting/discrete modules | List/Timeline; module, lesson, quiz, completion | Optional deadline | Several times weekly | Consume fits modules; extra modules remove future chunk; missed slides |
| 34 | Language-learning plan | Duration + repeating + milestone | Today/Calendar/List; activity, minutes, skill area | Recurring windows | Daily; log session | Missed recurrence can skip without debt; streak optional; window reminder |
| 35 | Certification prep | Milestones + duration + event | Timeline/Calendar/List; domain, score, hours, exam | Hard exam date | Weekly/daily | Behind prompts pace/scope; repeating practice; registration/exam alerts |
| 36 | Thesis/dissertation | Milestones + dependencies + waiting | Timeline/Gantt/List; chapter, advisor feedback, source | Long multi-phase dates | Weekly/daily bursts | Advisor Waiting explicit; slipped chapter shows forecast impact; history vital |
| 37 | Semester assignments | Binary + events + milestones | Calendar/List/Board; course, type, due time, grade | Many hard dates | Daily | Submitted vs not-submitted differ; late actions submit/contact/archive |
| 38 | Music repertoire practice | Duration + counting + state | List/Calendar; piece, minutes, tempo, confidence | Flexible recurring | Every practice session | No overdue by default; tempo ahead/behind; weekly digest |
| 39 | Coding practice curriculum | Counting + milestone | List/Board; problem/topic, difficulty, solved, notes | Optional pace | Daily/weekly | Consume discrete problems; review recurrence separate; ahead pulls harder set |
| 40 | Spaced-review study system | Repeating/expected-date + state | Today/List; topic, due-for-review, confidence | Scheduled review dates | Daily; review sets next date | Past review means due, not failed; review/snooze; digest notifications |

## Home and life administration

| # | Use case | Shape | Views and fields | Dates / organization | Completion and check-in | Late / ahead / notification behavior |
|---:|---|---|---|---|---|---|
| 41 | Whole-house cleaning reset | Checklist + sections | List/Focus/Board; room, effort, priority | Flexible day/week | During session | Overdue only if dated; do now/defer/skip/batch actions |
| 42 | Recurring household chores | Repeating binary | Today/Calendar/List; chore, room, frequency | Recurring windows | Daily | Missed recurrence skip/move; no infinite overdue copies; quiet reminders |
| 43 | Home renovation | Milestones + dependencies + waiting | Timeline/Board/Calendar; room, contractor, cost, status | Long phases/vendor dates | Weekly/daily during work | Vendor delays Waiting; critical path impact; replan/change vendor/scope |
| 44 | Moving house | Deadline + checklists | Timeline/Calendar/List; room, box count, utilities, owner | Hard move date | Daily near move | Counting boxes can consume; critical late tasks prioritized; event reminders |
| 45 | Declutter 100 items | Counting | Today/List/Dashboard; category, count, destination | Optional target date | Per session | Smooth daily goal or fixed baseline; ahead reduces future sessions |
| 46 | Weekly meal planning | Recurring planning + events | Calendar/Board; meal, recipe, ingredients, prep | Weekly dates | Weekly + daily | Missed meal swaps/moves/archives; reminders before shopping/prep |
| 47 | Grocery restock list | Status-only + quantity | List; item, quantity, store, category | Usually no due date | While shopping | No overdue; bought items hide until restock threshold returns them |
| 48 | Seasonal home maintenance | Recurring milestone/checklist | Calendar/List; season, asset, last done, next due | Monthly/annual recurrence | Monthly/seasonal | Past due means due maintenance; complete/reschedule/not needed; digest |
| 49 | Car maintenance log | Event + recurring/threshold | Calendar/List; service, mileage, last/next date | Date or mileage based | Monthly or service event | Due by threshold; log service/defer/update mileage; opt-in reminders |
| 50 | Document/renewal tracker | Event/reminder + checklist | Calendar/List; document, expiration, renewal steps, file | Hard expiration dates | Monthly | Advance reminders; expiration high visibility; renew/replace/update date |

## Wellness and personal routines

| # | Use case | Shape | Views and fields | Dates / organization | Completion and check-in | Late / ahead / notification behavior |
|---:|---|---|---|---|---|---|
| 51 | Strength-training program | Counting/duration + repeating | Calendar/Today/List; workout, sets, reps, duration | Scheduled flexible sessions | Each session | Missed session move/skip/preserve; no punitive streak; volume ahead/behind |
| 52 | Running mileage plan | Counting + pacing | Calendar/Timeline/Dashboard; miles, run type, target, actual | Weekly blocks + goal date | After runs | Smooth/fixed; ahead/behind at week level; user-controlled replan, no forced catch-up |
| 53 | Yoga routine | Duration + repeating | Today/Calendar; minutes, style | Flexible windows | Each session | Missed occurrence skip/reschedule; reminder only in preferred window |
| 54 | Wind-down routine | Repeating checklist | Today/Focus; steps, target time | Nightly window | Nightly | Missed night historical, not debt; no overdue pile; gentle optional reminder |
| 55 | Meal-prep routine | Recurring checklist + counting | Calendar/List; recipe, servings, shopping dependency | Weekly | Weekly | Missed prep moves/reduces batch; pre-block notification |
| 56 | Meditation practice | Duration + recurring | Today/List; minutes, session type | Flexible daily/weekly | Each session | No punitive overdue; partial duration; weekly progress view |
| 57 | Outdoor-time goal | Duration/counting | Today/Calendar/Dashboard; minutes, activity | Weekly target or none | After sessions | Ahead banks weekly; behind shows remaining without nagging |
| 58 | Recovery/rest planning | Event/state | Calendar; rest day, reason, notes | Planned dates | As needed | Rest is valid state, not failure; no game penalty for planned rest |
| 59 | Appointment/care admin | Event + waiting/checklist | Calendar/List; time, contact, prep, follow-up | Hard appointment + follow-up | Around event | Occurred/canceled/rescheduled explicit; configurable reminders; not a medical safety tool |
| 60 | Personal habit experiment | Counting/repeating + date range | Calendar/Dashboard; behavior, amount, experiment dates | Defined window | Daily | Missed entry can remain unknown; summarize at end instead of overdue debt |

## Money, purchases and assets

| # | Use case | Shape | Views and fields | Dates / organization | Completion and check-in | Late / ahead / notification behavior |
|---:|---|---|---|---|---|---|
| 61 | Personal monthly budget close | Recurring checklist + numbers | Table/List; account, category, reconciled, amount | Monthly close | Weekly/monthly | Past close prompts reconcile/defer; preserve each period history |
| 62 | Debt payoff plan | Counting/amount target | Dashboard/Timeline/List; balance, payment, rate, target | Monthly + optional target payoff | Monthly | Ahead lowers forecast; behind adjusts forecast; no punitive auto catch-up |
| 63 | Savings goal | Counting/amount target | Dashboard/Timeline; current, target, contributions | Flexible or target date | Weekly/monthly | Smooth can suggest contributions; ahead moves finish; optional reminders |
| 64 | Tax preparation | Checklist + waiting + hard deadline | List/Timeline; form, document, source, received | Hard filing date | Weekly/daily near deadline | Waiting documents separate; remind user-owned filing deadlines |
| 65 | Subscription audit | Status-only + recurring review | Table/List; service, cost, renewal, keep/cancel | Renewal or quarterly review | Quarterly | Upcoming renewal prompts decision; soft overdue review; cancel closes record |
| 66 | Major purchase research | Decision + comparison records | Table/Board; option, price, criteria, rating, link | Often no hard date | Intermittent | No overdue by default; stale project can prompt archive/decision |
| 67 | Gift shopping | Checklist + waiting + event deadline | List/Calendar; person, idea, purchased, shipped, budget | Event date | Weekly then daily | Late shipping becomes Waiting/risk; substitute/local pickup/arrived actions |
| 68 | Event budget tracking | Numbers + milestone + approval | Table/Dashboard/Timeline; vendor, budget, paid, due | Payment deadlines + event | Weekly | Overdue payment high visibility; paid is ahead; reminder before deposit/final |
| 69 | Sell unwanted items | Pipeline + counting | Board/List; item, price, platform, listed, sold, shipped | Mostly undated | Several times weekly | Stale listing prompts discount/relist/archive; sold closes after handoff |
| 70 | Household inventory | Status-only database | Table/Gallery; item, category, value, photo, serial | No dates except review | Rare/annual | No overdue; yearly review reminder; disposed items archive |

## Relationships, family and shared life

| # | Use case | Shape | Views and fields | Dates / organization | Completion and check-in | Late / ahead / notification behavior |
|---:|---|---|---|---|---|---|
| 71 | Date-night planning | Decision + event + idea backlog | Board/Calendar; idea, budget, mood, location | Some dated, many someday | Weekly/monthly | Undated ideas never overdue; date reminder; completed goes to history |
| 72 | Birthday planning | Event + checklist | Calendar/List; person, gift, reservation, message | Hard event date | Weeks before | Late subtasks simplify/substitute/reschedule; lead-time reminders |
| 73 | Holiday hosting | Milestones + checklist + event | Timeline/Calendar/List; guest, food, cleaning, shopping | Hard event date | Weekly then daily | Critical overdue surfaced; scope trimming; clustered notifications |
| 74 | Shared family chores | Repeating + assignee | Today/Board; chore, person, frequency, room | Recurring | Daily | Missed chore rotate/reschedule/skip; assignment notifications optional |
| 75 | Friend catch-up reminders | Waiting/recurring reminder | List; person, last contact, next check-in, notes | Loose cadence | Weekly/monthly | Past date is gentle follow-up, not overdue; snooze/contact actions |
| 76 | Volunteer project | Milestones + team tasks | Board/Calendar/List; owner, role, status, event date | Varies | Weekly | External blockers separate; due/assignment notifications |
| 77 | Book club | Recurring event + counting | Calendar/Today; book, chapters/pages, meeting date | Meeting-driven | During reading + pre-meeting | Counting pace adapts; missed reading can trim target without project failure |
| 78 | Pet care routine | Repeating + event/checklist | Today/Calendar; care item, pet, frequency, appointment | Recurring + events | Daily/weekly | Missed routine reschedule/skip; appointments canceled/rescheduled states |
| 79 | Pet training goal | Counting/repeating + milestone | Today/List; behavior, sessions, duration, success note | Flexible sessions | Each session | No overdue by default; progress over weeks; milestones mark capability |
| 80 | Family trip coordination | Project + event + waiting | Timeline/Calendar/List; booking, traveler, document, reservation | Hard travel dates | Weekly then daily | Waiting confirmations distinct; overdue booking offers alternatives; departure reminders |

## Travel, leisure and hobbies

| # | Use case | Shape | Views and fields | Dates / organization | Completion and check-in | Late / ahead / notification behavior |
|---:|---|---|---|---|---|---|
| 81 | Vacation itinerary | Event records + checklist | Calendar/Timeline/List; reservation, location, confirmation | Hard trip dates | Weekly + daily on trip | Missed activity skipped/rescheduled; no carryover after day; reservation reminders |
| 82 | Packing list | Checklist + categories | List/Focus; item, bag, person, packed | Due by departure | During packing | Unpacked rises in focus near departure; leftovers waive/archive after departure |
| 83 | Travel booking deadlines | Waiting/event/decision | Calendar/List; flight, hotel, cancellation deadline, status | Hard deadlines/times | Weekly | Cancellation deadlines notify; book/change/cancel actions |
| 84 | Theme-park day plan | Events + priority backlog | Calendar/List; attraction, reservation, priority, location | One-day times | Frequently during day | Missed reservation skipped/rescheduled; no overdue carryover |
| 85 | Conference attendance plan | Event + checklist + choices | Calendar/Board; session, room, priority, conflict | Fixed conference schedule | Throughout event | Past sessions auto-history; conflicts require choice, not overdue |
| 86 | Gaming backlog campaign | Status-only + milestones + counting | Board/List; game, status, hours, platform, goal | Mostly undated | Weekly | No overdue; archive abandoned; optional count progress |
| 87 | Movie/TV watchlist | Status-only + counting | Board/List; title, season/episode, service, priority | Usually undated | When choosing media | No overdue; log episodes; finished to history |
| 88 | Knitting/craft project | Counting + milestones | List/Timeline; pattern step, rows, materials | Flexible | Per session | Consume rows; no overdue unless target date; material Waiting state |
| 89 | Garden planting calendar | Events + recurring + milestones | Calendar/Timeline; plant, sow, transplant, harvest window | Seasonal windows | Weekly | Missed window reschedule/skip/next season; window reminders |
| 90 | Recipe/cooking challenge | Collection + counting + event | Board/List; recipe, cuisine, tried, rating, ingredients | Mostly flexible | Weekly | No overdue; count advances; favorites can become recurring meals |

## Long-range, unusual and database-like use

| # | Use case | Shape | Views and fields | Dates / organization | Completion and check-in | Late / ahead / notification behavior |
|---:|---|---|---|---|---|---|
| 91 | Job search | Pipeline + counting + waiting | Board/List/Calendar; employer, role, stage, applied, follow-up | Applications + interviews | Daily | Waiting does not become overdue; follow-up does; optional weekly application count |
| 92 | Apartment/house hunt | Pipeline + decision + events | Board/Calendar; listing, price, tour, score, status | Tour/offer dates | Daily during search | Stale listing archives; offer deadline reminder; rejected options history |
| 93 | Visa/travel-document process | Milestones + waiting + hard dates | Timeline/List; document, submitted, expected response, expiry | Travel/expiration dates | Weekly | External wait explicit; notify expected/user-owned deadlines |
| 94 | Personal knowledge inbox | Status-only processing | List/Table; capture, source, topic, project relation | Mostly undated | Weekly | No overdue; stale captures can prompt review; file/discard/archive |
| 95 | Lightweight personal CRM | Status-only + reminder | Table/List; person, context, last touch, next touch | Optional next-contact date | Weekly/monthly | Past contact date gentle nudge; contact/snooze/archive |
| 96 | Genealogy research | Status-only + waiting + evidence | Table/Board; person, source, question, confidence | Mostly undated | Research sessions | No overdue; record requests Waiting; preserve history |
| 97 | Collectible catalog/restoration | Status-only + checklist | Table/Gallery; item, condition, value, missing parts | Usually undated | When collecting/restoring | No overdue; restoration tasks can be dated; sold/disposed archive |
| 98 | Emergency-preparedness kit | Checklist + recurring review | List/Table; item, quantity, expiry, location | Review + expiration dates | Quarterly | Expired item becomes Replace; digest reminder; quantities can count |
| 99 | Fermentation/batch hobby tracker | Event + duration + state | Calendar/Timeline; batch, start, stage, ready date, notes | Ranges + checkpoints | At checkpoints | Past checkpoint prompts inspect/update, not failure; batch may finish early/late |
| 100 | Someday/maybe idea incubator | Status-only database | Board/List; idea, area, interest, effort, next review | No due dates | Monthly/quarterly | Never overdue; review can promote/keep/archive; no interruptive notifications |

## What this matrix is meant to expose

A good PM engine should survive contradictions such as:

- some Tasks are binary and some are measured
- some Projects have hard deadlines and others should never show "overdue"
- some records are not checkbox Tasks at all
- some recurring work should create a fresh occurrence while other recurring records persist
- some dates are deadlines, some are appointments, some are expected responses, and some are flexible windows
- some Projects are checked hourly and some once a year
- some completed work should disappear from active planning while other history remains visible forever
- sometimes late means replan, sometimes skip it, and sometimes the opportunity is simply gone
- sometimes being ahead should consume future work and sometimes the original baseline must remain untouched
- some work is blocked, some is waiting, and those are not the same thing
- some work needs proof while some should be one tap
- some records should never produce game rewards because no real work occurred

The next PM design phase should use these cases as acceptance tests for the taxonomy.

---

# 2H. PM screen mockups

These are intentionally rough. The important part is the **information architecture and state behavior**, not the final visual design.

## Projects

"New Project" is a button. **Projects** is the durable screen.

```text
╭────────────────────────────────────────────╮
│ PROJECTS                         + New     │
│                                            │
│ [ Active ] [ Completed ] [ Archived ]      │
│                                            │
│ PORTFOLIO SITE                             │
│ On track · 48%                             │
│ Next: Homepage complete                    │
│ Sep 18                                     │
│ █████████░░░░░░░░░                         │
│                                            │
│ FINISH KINGDOM OF ASH                      │
│ On pace · 26%                              │
│ 48 chapters remain                         │
│ Aug 30                                     │
│ █████░░░░░░░░░░░░░                         │
│                                            │
│ HOUSE RESET                                │
│ Ongoing · no deadline                      │
│ 4 open tasks                               │
│                                            │
│ [ Search ]  [ Filter ]  [ Sort ]           │
╰────────────────────────────────────────────╯
```

## Project shell

Every view sits inside the same Project.

```text
╭─────────────────────────────────────────────╮
│ ← PROJECTS                                  │
│                                             │
│ PORTFOLIO SITE                       •••    │
│ On track · Sep 18                           │
│                                             │
│ Overview  List  Board  Calendar  Timeline   │
│ More ▾                                      │
│                                             │
│ More                                        │
│ • Dashboard                                 │
│ • Activity / History                        │
│ • Archive                                   │
│ • Project settings                          │
╰─────────────────────────────────────────────╯
```

A user can reorder or hide views they never use.

## Overview

```text
╭─────────────────────────────────────────────╮
│ PORTFOLIO SITE · OVERVIEW                   │
│                                             │
│ STATUS                                      │
│ On track                                    │
│ 48% complete                                │
│ Forecast: Sep 17                            │
│ Target: Sep 18                              │
│                                             │
│ NEXT MILESTONE                              │
│ Homepage complete                  4 / 5    │
│ ████████████████░░░                         │
│                                             │
│ NEEDS ATTENTION                             │
│ Waiting: Michael feedback                   │
│ Expected Aug 21                             │
│ [ Follow up ] [ Change date ]               │
│                                             │
│ NEXT ACTION                                 │
│ Build homepage layout                       │
│ [ Start ]                                   │
│                                             │
│ RECENT                                      │
│ Homepage intro completed · 2h ago           │
│ Forecast moved Sep 18 → Sep 17              │
╰─────────────────────────────────────────────╯
```

## List / Table

```text
╭──────────────────────────────────────────────────────────╮
│ PORTFOLIO SITE · LIST                                    │
│                                                          │
│ Filter ▾  Group: Phase ▾  Sort: Priority ▾  Fields ▾     │
│                                                          │
│ HOMEPAGE                                                 │
│                                                          │
│ ✓ Site positioning     Done      P1   Aug 17             │
│ ✓ Homepage intro       Done      P1   Aug 19             │
│ ○ Build layout         Ready     P1   Aug 20   ~45m      │
│ ◐ Michael feedback     Waiting   P2   Aug 21             │
│ ○ Responsive QA        Blocked   P1   Aug 22             │
│                                                          │
│ PROJECTS SECTION                                         │
│                                                          │
│ ○ Pick final work      Ready     P2   —        ~30m      │
│ ○ Write case study     No date   P2   —                  │
│                                                          │
│ + Add task                                               │
╰──────────────────────────────────────────────────────────╯
```

The same records can expose more or fewer columns by view.

## Board / Kanban

```text
╭──────────────────────────────────────────────────────────────╮
│ PORTFOLIO SITE · BOARD                                       │
│                                                              │
│ READY             IN PROGRESS       WAITING          DONE    │
│                                                              │
│ ┌────────────┐    ┌────────────┐    ┌────────────┐  ┌─────┐  │
│ │Build layout│    │Pick work   │    │Michael     │  │Intro│  │
│ │P1 · Aug 20 │    │P2          │    │feedback    │  │ ✓   │  │
│ └────────────┘    └────────────┘    │Exp Aug 21 │  └─────┘   │
│                                     └────────────┘           │
│ ┌────────────┐                                               │
│ │Write case  │                                               │
│ │No date     │                                               │
│ └────────────┘                                               │
│                                                              │
│ [ + ]              [ + ]              [ + ]           [ + ]  │
╰──────────────────────────────────────────────────────────────╯
```

Dragging a card changes the Task's status property. It does not create a new Board-specific copy.

## Calendar

```text
╭────────────────────────────────────────────╮
│ PORTFOLIO SITE · CALENDAR        AUG 2026  │
│                                            │
│ MON 17   TUE 18   WED 19   THU 20   FRI21  │
│                                            │
│ Site                Homepage   Build       │
│ positioning         intro ✓    layout      │
│ ✓                               P1         │
│                                        ↳   │
│                               Michael      │
│                               feedback     │
│                               expected     │
│                                            │
│ UNSCHEDULED                                │
│ • Write case study                         │
│ • Choose testimonial                       │
│                                            │
│ Drag an unscheduled task onto a date.      │
╰────────────────────────────────────────────╯
```

Different date semantics need different visual treatment:

```text
Due date       solid marker
Date range     spanning bar
Expected date  dotted / Waiting marker
Event          time block
Flexible week  week bucket
```

## Timeline

```text
╭───────────────────────────────────────────────────────────╮
│ PORTFOLIO SITE · TIMELINE                                 │
│                    AUG 17   20   23   26   29   SEP 1     │
│                                                           │
│ HOMEPAGE                                                  │
│ Positioning        ███ ✓                                  │
│ Intro                 █ ✓                                 │
│ Build layout            ███                               │
│ Feedback                   ···?                           │
│ Responsive QA                 ███                         │
│                                ↑ blocked by feedback      │
│                                                           │
│ PROJECTS SECTION                                          │
│ Pick work               ███                               │
│ Write case study                  ─ unscheduled ─         │
│                                                           │
│ ◆ Homepage complete                                       │
│                                             Launch ◆      │
╰───────────────────────────────────────────────────────────╯
```

Timeline should let the user drag dates and see dependency consequences before committing.

## Counting task detail

```text
╭────────────────────────────────────────────╮
│ READ KINGDOM OF ASH                        │
│ Counting · chapters                        │
│                                            │
│ Progress                                   │
│ 17 / 65                                    │
│ █████░░░░░░░░░░░░░░                        │
│                                            │
│ TARGET                                     │
│ Finish Aug 30                              │
│                                            │
│ Success levels                             │
│ Minimum   2                                │
│ Target    5                                │
│ Stretch   8                                │
│                                            │
│ Anchor                                     │
│ ● Deadline holds                           │
│ ○ Pace holds                               │
│ ○ Fixed plan                               │
│ ○ Forecast only                            │
│                                            │
│ Variance                                   │
│ ● Smooth                                   │
│ ○ Consume                                  │
│ ○ Fixed                                    │
│                                            │
│ If you log 8 tonight                       │
│ Remaining pace: 4.95/day                   │
│ Projected finish: Aug 30                   │
│                                            │
│ [ Log progress ]                           │
╰────────────────────────────────────────────╯
```

## Overdue / Needs decision

```text
╭────────────────────────────────────────────╮
│ NEEDS A DECISION                           │
│                                            │
│ Read chapters 63–67                        │
│ Planned for Aug 18                         │
│ No progress was logged.                    │
│                                            │
│ [ I did some of it ]                       │
│ [ Move it to today ]                       │
│ [ Redistribute remaining work ]            │
│ [ Keep the original plan ]                 │
│ [ Waive this occurrence ]                  │
│ [ Change the finish date ]                 │
│                                            │
│ No reward is lost.                         │
│ The app needs to know what reality is now. │
╰────────────────────────────────────────────╯
```

## Activity / History

```text
╭────────────────────────────────────────────╮
│ PORTFOLIO SITE · HISTORY                   │
│                                            │
│ AUG 19                                     │
│ 4:12 PM  Homepage intro → Done             │
│          Proof: text snippet               │
│                                            │
│ 4:12 PM  Homepage milestone 3/5 → 4/5      │
│                                            │
│ 4:12 PM  Forecast Sep 18 → Sep 17          │
│                                            │
│ AUG 18                                     │
│ 9:03 AM  Build layout due Aug 21 → Aug 20  │
│          Changed manually                  │
│                                            │
│ [ Filter activity ]                        │
╰────────────────────────────────────────────╯
```

## Archive

```text
╭─────────────────────────────────────────────╮
│ ARCHIVE                                     │
│                                             │
│ Tasks                                       │
│ • Old homepage concept      Archived Aug 4  │
│ • Unused photo selection    Archived Aug 8  │
│                                             │
│ Projects                                    │
│ • 2025 Portfolio Site       Completed       │
│                                             │
│ [ Restore ] [ Duplicate ] [ View history ]  │
╰─────────────────────────────────────────────╯
```

Completed and archived work remains part of the user's history and game legacy unless the user explicitly deletes it.

---


# 3. The game principles

## Layered progression

Progression should contain connected:

- skills
- equipment
- Items
- resources
- staff
- recipes
- stations
- areas
- projects
- collections
- automation
- characters
- world changes
- strategic choices

Early manual play should eventually produce **new capabilities**, not merely stronger numbers.

The repeating progression arc is:

```text
learn
→ do manually
→ improve
→ combine
→ specialize
→ delegate
→ automate
→ manage at a higher level
→ unlock another layer
```

## Simple interactions, combinatorial depth

The basic verbs should be understandable almost instantly:

- tap
- drag
- combine
- assign
- collect
- craft
- equip
- upgrade
- sell
- fulfill
- route

Depth comes from what simple things can do **together**.

The player should understand an individual interaction in seconds while still discovering combinations weeks later.

## Transformation chains

Things should turn into other things.

Not:

```text
task → XP
```

More like:

```text
task
→ Effort
→ ingredient
→ product
→ order
→ Credits
→ station
→ staff
→ automation
→ new recipe
→ new area
```

Outputs become inputs.

## Expansion over inflation

Progress should keep revealing genuinely new:

- mechanics
- verbs
- Items
- recipes
- tools
- staff
- stations
- project options
- areas
- equipment
- skill branches
- orders
- secrets
- combinations
- automation

The game should regularly create:

> *Wait, I can do that now?*

## Interconnected systems

Nothing important should live in a silo.

```text
skills affect stations
stations transform Items
Items fulfill recipes
recipes fulfill orders
orders fund upgrades
upgrades attract staff
staff automate production
project milestones unlock content
content changes the world
world progression reveals new systems
```

If a feature has no meaningful input or output, it needs a job or needs to go.

## Meaningful customization

Customization matters most when it changes play.

Good:

- active Play Packs
- skill paths
- equipment loadouts
- staff assignments
- production rules
- project strategies
- station upgrades
- recipe choices
- saved PM views
- themes
- world presets

Less important:

- placing dozens of decorative objects
- tiny aesthetic choices with no consequence
- blank-canvas layout as required progression

## Management as strategy

As progression deepens, the main question should evolve from:

> What task do I need to do?

toward:

> Given what I have built, what is the best way to use it?

That means managing:

- production
- inventory
- staff
- routing
- orders
- capacity
- equipment
- projects
- resources
- priorities
- automation

## Discovery creates momentum

Some of the game should remain unknown.

Possible discoveries:

- hidden recipes
- rare Items
- mystery modifiers
- unusual staff
- surprise orders
- secret combinations
- new skill branches
- locked stations
- areas visible before they are accessible
- Items whose purpose becomes clear later

Curiosity is a retention mechanic.

## Visible transformation

Real effort should leave a persistent footprint.

The world can gain:

- new rooms
- new shops
- staff
- plants
- animals
- machines
- shelves
- displays
- project monuments
- districts
- collections
- visual upgrades
- new activity areas

The player should be able to look around and see what their real work built.

## Creativity without placement burden

The world should look good by default.

Favor:

- auto-layout
- curated presets
- themes
- upgrade stages
- snapping
- reversible choices
- a few meaningful placement slots

Avoid making the player place fifty chairs, lamps, paths, counters, or flowerpots to progress.

## Return momentum

Every session should expose an appealing next possibility:

- an upgrade nearly affordable
- a rare recipe missing one Item
- a staff applicant almost unlocked
- a new area partly revealed
- a project milestone close to completion
- an unknown Item
- a locked skill branch
- a collection one piece from completion

The app should create **curiosity debt, not guilt debt**.

---

# 4. A modular game: the fixed grammar and the customizable content

The game needs a **stable underlying ruleset** so everything can interconnect.

But the content that runs through those rules can be modular.

This is where **Play Packs** come in.

## Core game grammar

These concepts exist regardless of theme:

- real task
- proof
- Effort
- Item
- rarity
- recipe / combination
- station
- order / objective
- Credits
- reputation
- skill point
- skill
- equipment
- staff
- automation
- project milestone
- world change
- collection
- discovery

## Play Packs

A Play Pack adds themed content to that shared engine.

Examples:

- Workshop
- Office
- Coffee Shop
- Bakery
- Plants
- Pets
- Date Night
- Restaurant
- Hotel
- Bookshop
- Farm
- Home
- Potion Shop
- Fantasy Guild
- Aquarium
- Art Studio

The app is not a separate game for each pack.

The packs are **content modules plugged into the same game**.

---

# 5. What a Play Pack contains

Every full Play Pack can contain some combination of:

## Visual identity

- world styling
- station art
- Item art
- characters
- backgrounds
- animations
- sounds
- project footprints

## Item pool

Potentially **100+ Items per mature pack**.

Items can include:

- raw materials
- ingredients
- tools
- equipment
- curios
- recipes
- blueprints
- decorative-but-functional objects
- collectible sets
- rare modifiers
- world-change Items

## Recipes and combinations

Examples:

```text
Bakery:
Flour + Egg + Butter
→ Dough

Dough + Chocolate
→ Chocolate Pastry

Chocolate Pastry + Gift Box
→ Premium Order
```

```text
Plants:
Seed + Soil
→ Sprout

Sprout + Fertilizer
→ Healthy Plant

Healthy Plant + Rare Cutting
→ Hybrid Plant
```

```text
Office:
Folder + Label
→ Organized File

Organized File + Workflow Card
→ Process Kit

Process Kit + Automation Chip
→ Automated Workflow
```

## Stations

Examples:

```text
Bakery
Mixer
Prep Table
Oven
Decorating Station
Display Case
```

```text
Coffee Shop
Grinder
Espresso Machine
Syrup Station
Pastry Case
Order Counter
```

```text
Plants
Potting Bench
Propagation Station
Greenhouse
Hybridizing Table
Tree Nursery
```

## Staff or characters

Pack-specific staff can have mechanically useful abilities.

Examples:

- baker who auto-processes one dough recipe each day
- barista who fulfills simple drink orders automatically
- gardener who waters basic plants
- office coordinator who routes incoming Items
- pet caretaker who maintains one recurring pet-care system

## Skill branches

A pack can add one or more branches to the shared skill system.

Examples:

```text
Bakery
Prep
Baking
Service
Experimentation
```

```text
Plants
Propagation
Growth
Hybridizing
Landscaping
```

```text
Office
Operations
Planning
Automation
Leadership
```

## Small playable Spaces

A full Play Pack should be more than an Item theme.

It can own a **small, self-contained playable Space**:

- Bakery
- Café
- Greenhouse
- Office
- Pet shop
- Hotel desk
- Date-night district
- Workshop
- Bookshop

Think **small cozy simulator diorama**, not open-world builder.

The visual target is:

- clean shapes
- warm or cozy 3D
- pastel / approachable palettes where appropriate
- readable stations
- small spaces
- strong automatic layouts
- satisfying visible upgrades
- minimal placement burden

The player might choose one of three counter styles, one of two room layouts, or which station occupies a functional slot. They should **not** need to place every chair, wall decoration, path or appliance.

A pack Space can grow through a small number of authored stages:

```text
BAKERY

Stage 1
Prep table + counter

Stage 2
Oven + display case

Stage 3
Second workstation + first staff

Stage 4
Expanded kitchen + rush challenges

Stage 5
Specialty station + boss customers

Stage 6
Fully upgraded neighborhood bakery
```

This gives each pack a satisfying "my little simulator" identity without requiring a giant separate game.

## Challenge identity

Every mature Play Pack should define a primary challenge fantasy.

Examples:

```text
Bakery / Coffee Shop
Customers, queues, rushes, special orders

Fantasy Guild
Short card battles and bosses

Plants
Growth trials, weather, pests, hybrid goals

Pets
Care requests, training challenges, personality constraints

Office
Inbox crises, workflow puzzles, deadline requests

Hotel
Guest queues, room/service requirements

Date Night
Preference, budget and timing puzzles
```

The fiction changes. The **challenge engine underneath should stay deliberately small and reusable**.


## World transformations

A pack should visibly alter the persistent world as it develops.

A Bakery Pack might grow from:

```text
empty counter
→ tiny bake stand
→ bakery
→ staffed bakery
→ expanded kitchen
→ neighborhood destination
```

A Plants Pack might grow from:

```text
one pot
→ shelf
→ plant corner
→ greenhouse
→ garden
→ tree-filled conservatory
```

---

# 6. A better word than "loot"

The core product should not require fantasy language.

Use:

## **Items**

This is the neutral umbrella term.

A completion can produce an **Item drop**.

The player owns an **Item collection**.

An Item can be:

- common
- uncommon
- rare
- special
- signature

A fantasy-themed pack can call them loot internally if it wants.

A Bakery Pack can call many of them ingredients.

A Plants Pack can call many of them seeds, cuttings, pots, or tools.

A Coffee Shop Pack can call them beans, syrups, cups, tools, or recipes.

The engine still knows only:

```text
Item
type
rarity
tags
uses
recipes
effects
pack
```

---

# 7. Item design: no dead drops

Every Item should have at least one meaningful use.

Prefer multiple uses.

Example:

```text
SMALL GEAR

Pack
Workshop

Rarity
Uncommon

Uses
• Workbench Level 3
• Sorting Table recipe
• Precision Tool recipe
• Recycle into 2 Parts

Collection
Workshop Components

Discovery
One unknown recipe also uses this.
```

If an Item has no use except sitting in a list, it is unfinished design.

## Duplicate protection

Duplicates should still matter.

Possible rules:

```text
3 copies
→ upgrade Item

duplicate
→ recycle into Parts

duplicate ingredient
→ use in recipes

duplicate collectible
→ contribute toward set mastery

rare duplicate
→ trade for a rarity token
```

No "I got the same useless thing again" dead end.

---

# 8. Randomness without punishment

The app can borrow the exciting parts of roguelikes and roguelites without using punitive resets.

The player keeps progress permanently.

Randomness appears in:

- Item drops
- rare modifiers
- unusual recipe opportunities
- staff applicants
- special orders
- mystery boxes
- collection pulls
- rare world events

## Example completion roll

Exact balance is a later problem, but the feeling could be:

```text
Any completed task
→ guaranteed Effort
→ guaranteed Item from active pack

Target completion
→ additional Item roll

Stretch completion
→ small boosted chance of uncommon+ Item

Project milestone
→ guaranteed special drop

Project completion
→ guaranteed signature Item or unlock
```

Proof strictness should not make someone morally "better" or automatically richer.

Randomness adds surprise.

It does not determine whether the player can progress at all.

---

# 9. Active packs and personalization

The player should not have every pack dumping Items into one enormous pool.

## Active Play Packs

A player chooses a small number of active packs.

Example:

```text
ACTIVE PACKS

✓ Bakery
✓ Plants
○ Workshop
○ Coffee Shop
○ Pets
○ Office

Item drops currently come from:
Bakery 60%
Plants 40%
```

The player can change this later.

## Projects can optionally connect to a pack

Example:

```text
Finish Kingdom of Ash
→ Plants Pack

Portfolio Site
→ Office Pack

House Reset
→ Workshop Pack
```

That means work on a project can influence its themed drop pool.

But this is optional.

A player who wants one consistent Coffee Shop game can make every project feed Coffee Shop.

## Packs can mix

Cross-pack combinations are where the system can become especially fun.

Examples:

```text
Coffee Beans + Bakery Pastry
→ Café Combo Order
```

```text
Plant Cutting + Bakery Gift Box
→ Gift Arrangement
```

```text
Office Organizer + Plant
→ Desk Refresh Kit
```

```text
Pet Treat + Gift Box
→ Pet Birthday Bundle
```

Some combinations can be obvious.

Others can be hidden discoveries.

---

# 10. Custom real-world rewards

The app should also support the user's own rewards.

This is **separate from in-game Items**.

Someone can say:

```text
PROJECT
Finish Kingdom of Ash

When completed:
Real-world reward
Starbucks

Also:
Game completion reward
Signature Item from active pack
```

Or:

```text
MILESTONE
Portfolio homepage complete

Personal reward
Order takeout tonight
```

## Why separate them

A real-world reward is personal motivation.

An Item is game progression.

They can happen together without needing the app to know how much Starbucks "costs" relative to a bakery oven.

That avoids contaminating the game economy.

## Optional reward shelf

For people who like earning toward rewards, an optional personal Reward Shelf can exist:

```text
PERSONAL REWARDS

Starbucks
Cost: 3 Reward Stars

Guilt-free game night
Cost: 5 Reward Stars

New book
Cost: 10 Reward Stars
```

But direct milestone rewards should work without this system.

The reward shelf is optional depth, not mandatory currency.

---

# 11. The core economy

The cleanest universal economy is:

## Effort

Produced only by completed real work.

Purpose:

- power stations
- create pack-specific Items
- initiate transformations

Effort cannot be purchased.

## Items

Produced by:

- task completion drops
- recipes
- combinations
- orders
- milestones
- discoveries

Purpose:

- recipes
- upgrades
- collections
- equipment
- orders
- staff
- world changes

## Credits

Earned mainly by fulfilling game objectives such as orders.

Purpose:

- stations
- upgrades
- staff
- expansion
- equipment
- convenience

## Reputation

Non-spendable long-term progression.

Earned by:

- orders
- project milestones
- completed projects
- major discoveries

Purpose:

- unlock new systems
- unlock new areas
- attract staff
- reveal higher-tier content
- award Skill Points

## Skill Points

Earned at reputation thresholds or meaningful achievements.

Purpose:

- skill tree only

## The whole chain

The missing middle is **challenge**. Items and money matter because they improve what the player can actually accomplish in the game.

```text
REAL TASK
   ↓
PROOF
   ↓
EFFORT + ITEM DROP
   ↓        ↓
STATION   RECIPE / GEAR / COLLECTION
   ↓        ↓
PREPARED ITEMS / LOADOUT / PRODUCTS
          ↓
       CHALLENGE
 customer / encounter / rush / puzzle
          ↓
   CHALLENGE REWARDS
          ↓
CREDITS + BETTER ITEMS + REPUTATION
   ↓            ↓             ↓
STATIONS       GEAR          LEVEL
STAFF          RECIPES         ↓
EXPANSION      COMBOS       SKILL POINT
AUTOMATION
   \             |             /
    └────── NEW CAPABILITIES ──┘
                    ↓
            HARDER CHALLENGES
                    ↓
               BOSS / CAPSTONE
                    ↓
 station / staff / expansion / automation
 special Item / new mechanic / new Space stage
                    ↓
               WORLD CHANGE
                    ↓
             RETURN MOTIVATION
                    ↓
                 REAL TASK
```

---

# 11A. Challenges are the demand engine

Collecting is fun, but **collecting cannot be the final purpose of the economy**.

The design should always be able to answer:

> Why do I want a better Item, more Credits, a faster station, stronger staff or a new recipe?

A strong answer is:

> Because it lets me handle a challenge I could not handle as well before.

The core loop becomes:

```text
produce / prepare
→ choose what to bring
→ play a short challenge
→ earn a meaningful reward
→ upgrade
→ face a trickier challenge
→ beat a boss
→ unlock a qualitatively new capability
```

## Challenge design goal

Challenges should feel:

- understandable in seconds
- playable in roughly 30 seconds to 3 minutes
- replayable
- slightly variable
- strategic enough to care about upgrades
- short enough to create "one more" energy
- forgiving enough that failure does not erase real-world effort

The goal is **not** to build ten separate games.

Build a small challenge grammar that Play Packs reinterpret.

---

# 11B. A shared challenge grammar

A challenge can be represented by a few universal parts:

```text
Goal
Constraints
Turns / time / customer patience
Player loadout
Pack-specific actions
Modifiers
Reward table
```

## Example universal structure

```text
CHALLENGE

Goal
Reach 8 Quality

Turns
3

Bonus goal
Use 2 different Item types

Modifier
Rush Hour:
first action costs +1 Capacity

Loadout
3 slots

Rewards
Base reward
+ bonus choice if bonus goal met
```

A Bakery Pack can call 8 Quality a customer order.

A Fantasy Pack can call it enemy health.

An Office Pack can call it request complexity.

A Plants Pack can call it growth requirements.

The arithmetic can differ by pack, but the UI and progression architecture stay familiar.

## Why limited turns / slots matter

Without constraints, the best strategy becomes:

> use everything

With a small limit such as 3 turns, 3 cards, 2 station actions, 4 customer patience or 3 staff slots, the player has to make a choice.

That is where Items, gear, skills and upgrades become useful.

---

# 11C. Challenge families

Not every pack needs exactly the same challenge presentation.

A manageable first set could be three families.

## 1. Service challenge

Best for:

- Bakery
- Coffee Shop
- Restaurant
- Hotel
- Pet shop

The player serves a short queue.

```text
CUSTOMER

Wants
☕ Latte
🥐 Pastry

Patience
4 actions

Bonus
Serve in 2 actions

Your setup
Espresso Machine Lv. 2
Oven Lv. 1
Mara: +1 prep slot
```

Better stations and staff reduce the number of actions needed or allow more complex orders.

## 2. Card / encounter challenge

Best for:

- Fantasy Guild
- Office
- Workshop
- abstract strategy packs

The player uses a tiny deck or hand.

```text
ENCOUNTER

Opponent
THE PAPERWORK HYDRA

Intent
Turn 1: Add 2 Backlog
Turn 2: Lock one slot
Turn 3: 8 Complexity

Your hand
[ Batch ] [ Delegate ] [ Automate ]
[ Focus ] [ Escalate ]
```

Items, equipment and skills can add or modify cards.

This is closer to the tactical satisfaction of a compact deckbuilder without asking the app to become a full Slay-the-Spire-sized game.

## 3. Constraint / growth challenge

Best for:

- Plants
- Date Night
- Home
- Aquarium
- creative packs

The player must satisfy a few conditions with limited slots.

```text
PLANT TRIAL

Goal
Grow a healthy flowering plant

Needs
Water 2+
Light 3+
Nutrition 1+

Problem
Cloudy Week:
Light sources give -1

Choose 3
[ Grow Lamp ]
[ Rainwater ]
[ Fertilizer ]
[ Greenhouse Slot ]
```

The same engine can become a Date Night puzzle:

```text
Needs
Romantic 2+
Budget ≤ 3
Indoors
Food 1+

Choose 3 plan cards.
```

---

# 11D. Boss challenges

A boss should be a **qualitative gate**, not merely a bigger number.

Bosses can appear at:

- pack stage completion
- project milestone
- reputation threshold
- collection milestone
- special event

## Boss reward principle

A boss should usually unlock at least one **new capability**.

Examples:

```text
Bakery boss
Saturday Rush
→ unlock second oven slot
→ unlock Baker applicant pool
→ unlock multi-order automation

Coffee Shop boss
Morning Commute
→ unlock second counter mechanic
→ unlock rare bean tier

Office boss
Quarter-End Crunch
→ unlock automation rules
→ unlock Operations skill branch

Plants boss
Greenhouse Bloom
→ unlock hybridizing
→ unlock tree nursery

Fantasy boss
Gatekeeper
→ unlock second equipment slot
→ unlock new card family
```

Boss rewards can additionally include rare / Signature Items, blueprints, special staff, new Pack Space stages, challenge modifiers and cross-pack recipes.

But the headline is **what can I do now that I could not do before?**

---

# 11E. Failure and retries

Real-world work already happened.

The game should never punish someone by deleting that work's value because they lost a tiny challenge.

A failed challenge can mean:

- base materials remain
- consumable common Items may be spent only if clearly communicated
- no Reputation bonus
- smaller reward
- immediate retry
- change loadout and retry
- practice mode
- challenge remains available

Never:

```text
You lost.
Your real task no longer counts.
```

The challenge layer sits **after** earned progress.

---

# 11F. Reward choices make random drops more interesting

Instead of every challenge dumping random Items into inventory, some challenge rewards can offer a roguelike-style choice.

```text
CHALLENGE COMPLETE

Choose one:

[ 🧈 Cultured Butter ]
Uncommon ingredient
Known in 3 recipes

[ ⚙ Mixer Gear ]
Upgrade component
Mixer Lv. 3 needs 1

[ 📜 Recipe Fragment ]
Collect 2 more to reveal
a Specialty recipe
```

Now a reward is a decision.

The player can pursue immediate challenge strength, station upgrades, discovery, collections or a longer-term build.

---

# 11G. Economy health: never create "money with nothing to buy"

Every spendable currency needs continuing **desirable sinks**.

Credits can fund:

- station purchases
- station upgrades
- staff hiring
- staff training
- equipment crafting
- equipment upgrades
- Space expansions
- automation slots
- recipe research
- challenge rerolls
- reward-choice rerolls
- loadout capacity
- optional cosmetics
- late-game specialization
- Pack mastery projects

## Economy rules

### Rule 1: Always show a desirable next sink

The player should almost always see something such as:

```text
Second Oven
220 / 300 Credits
```

or:

```text
Mara — Training II
140 Credits + 1 Mixer Gear
```

### Rule 2: Upgrades should change capability

Prefer:

```text
OVEN LV. 2
Bake two trays in one action.
```

over:

```text
OVEN LV. 2
+3% production.
```

Small numerical boosts can exist underneath meaningful changes.

### Rule 3: Expensive things must keep appearing

As income grows, new sinks appear:

- second station
- staff specialization
- automation
- extra loadout slots
- challenge tech
- Space expansion
- research trees
- Pack mastery

### Rule 4: Do not reward currency if currency has no current purpose

If the player has unlocked every meaningful sink in a tier, shift rewards toward rare Item choices, blueprints, Reputation, mastery progress or cross-pack unlocks until a new spending tier opens.

### Rule 5: Bosses should open the next economic tier

A boss can unlock:

```text
new station tier
→ new recipes
→ harder customers
→ more income
→ more expensive upgrades
```

The economy keeps breathing because challenge and progression advance together.

---

# 11H. Items matter because they affect challenges

An Item should ideally have one or more of these jobs:

```text
Ingredient
→ makes something used in challenges

Equipment
→ changes challenge rules

Upgrade component
→ improves a station/staff member

Card / action unlock
→ expands challenge strategy

Collection piece
→ collection unlock changes gameplay

World Item
→ alters Pack Space or unlocks a function

Consumable
→ gives a one-challenge tactical option

Recipe clue
→ exposes future capability
```

Example:

```text
VANILLA BEAN
Rare Bakery Item

Use 1
Vanilla Cake
High Quality customer product

Use 2
Premium Frosting
Adds +2 Appeal in Bakery challenges

Use 3
Pastry Chef trial
Required for applicant challenge

Collection
Premium Ingredients 2 / 5
At 3: unlock Premium Customers
```

Now getting Vanilla Bean is exciting because it expands play.

---

# 11I. Small simulator Spaces instead of one giant mixed world

Each active Play Pack can have its own small playable Space.

The global World screen becomes a **hub**.

```text
╭──────────────────────────────────────────╮
│ WORLD                                    │
│                                          │
│ YOUR SPACES                              │
│                                          │
│ ┌──────────────┐  ┌──────────────┐       │
│ │ 🧁 BAKERY    │  │ 🌱 GREENHOUSE│       │
│ │ Stage 3      │  │ Stage 2      │       │
│ │ Boss: 2/3    │  │ Plants: 4/5  │       │
│ └──────────────┘  └──────────────┘       │
│                                          │
│ ┌──────────────┐  ┌──────────────┐       │
│ │ 🗂 OFFICE    │  │      🔒      │        │
│ │ Stage 1      │  │ Next Space   │       │
│ │ Requests 3   │  │ Rep 250      │       │
│ └──────────────┘  └──────────────┘       │
│                                          │
│ GLOBAL                                   │
│ Reputation 186                           │
│ Legacy 1                                 │
│                                          │
│ [ Open Bakery ]                          │
│                                          │
│ Today   Tasks   Play   World   Progress  │
╰──────────────────────────────────────────╯
```

Open Bakery:

```text
╭───────────────────────────────────────────╮
│ BAKERY                         Stage 3/6  │
│                                           │
│          ┌──────────┐                     │
│          │  OVEN 1  │       👩 Mara       │
│          └──────────┘                     │
│                                           │
│  PREP         DISPLAY        COUNTER      │
│  Lv. 2         Lv. 1         Lv. 2        │
│                                           │
│ Customers waiting: 2                      │
│                                           │
│ [ Serve next customer ]                   │
│                                           │
│ NEXT EXPANSION                            │
│ Second Oven                               │
│ 220 / 300 Credits                         │
│                                           │
│ BOSS                                      │
│ Saturday Rush                             │
│ Unlocks after 3 more customers            │
│                                           │
│ [ Recipes ] [ Staff ] [ Upgrades ]        │
╰───────────────────────────────────────────╯
```

This is the place where visual progression happens.

The user is managing a **small cozy simulator**, not a giant decorating problem.

Cross-pack Items still travel through the shared Item system.

---

# 11J. Example challenge chain: Bakery

```text
REAL TASK
Write homepage intro
   ↓
+2 Effort
+ Milk
   ↓
PREP
Milk + Egg + Effort
→ Batter
   ↓
BAKE
Batter
→ Cake
   ↓
CUSTOMER CHALLENGE
Birthday customer wants:
Cake + Sweet 2+ + Appeal 2+
   ↓
Player equips:
Vanilla Frosting
Green Apron
Mara
   ↓
CHALLENGE COMPLETE
Choose reward:
Rare ingredient
or Mixer Gear
or Recipe Fragment
   ↓
Mixer Gear completes upgrade
   ↓
Mixer Lv. 2
Two prep actions can batch together
   ↓
Harder customer now practical
   ↓
SATURDAY RUSH BOSS
   ↓
Second Oven slot + Pastry Chef applicants
```

The Item chain now has a reason to exist.

---

# 11K. Example challenge chain: card encounter

```text
REAL TASK
Finish 30-minute study block
   ↓
+2 Effort
+ Automation Chip
   ↓
OFFICE SPACE
Craft:
Automation Chip + Workflow Card
→ "AUTO-SORT" card
   ↓
ENCOUNTER
THE INBOX SWARM

Enemy intent
Turn 1: +3 Backlog
Turn 2: Lock one slot
Turn 3: Deadline

Player deck
Batch
Delegate
Auto-Sort
Focus
Escalate
   ↓
WIN
Choose:
New card
Staff training token
or 60 Credits
   ↓
Boss meter advances
   ↓
QUARTER-END CRUNCH
   ↓
Unlock:
Automation Rules
```

---


# 12. First launch: obsession in two minutes

The first launch should teach the whole philosophy without explaining the whole game.

## 0:00 — show the promise

Do not open on a checklist.

Open on a small polished world.

```text
╭───────────────────────────────────────╮
│            YOUR LITTLE PLACE          │
│                                       │
│          ┌─────────────┐              │
│          │  WORKBENCH  │              │
│          │    Lv. 1    │              │
│          └─────────────┘              │
│                                       │
│  Empty shelf            🔒 STAFF      │
│                         Complete 3    │
│                                       │
│             🔒 EAST ROOM              │
│             Reputation 100            │
│                                       │
│       [ Start something ]             │
│                                       │
│ Today   Tasks   Play   World   More   │
╰───────────────────────────────────────╯
```

The place already looks good.

There are visible locked systems.

The player understands:

> This is tiny now. It will grow.

## 0:15 — create one real thing

```text
What are you trying to move forward?

[ Finish Kingdom of Ash____________ ]

                          [ Continue ]
```

Then:

```text
What's one thing you can do next?

[ Read chapters 63–67______________ ]

Optional
Minimum    [ 2 ]
Target     [ 5 ]
Stretch    [ 8 ]

                            [ Start ]
```

That is enough.

No project-management setup gauntlet.

## 0:40 — choose a starter Play Pack

Show only a few.

```text
What sounds fun right now?

You can change this anytime.

[ 🔧 Workshop ]
Build tools and machines

[ 🧁 Bakery ]
Collect ingredients and bake

[ 🌱 Plants ]
Grow, propagate and discover

[ ☕ Coffee Shop ]
Build a tiny café

                    [ Choose Bakery ]
```

This is an exciting choice, not configuration homework.

## 1:00 — immediate Item interaction

Creating the first project/task counts as tutorial setup work and generates one starter Effort plus one starter Item.

For Bakery:

```text
FIRST DROP

◆ 1 Effort
🥚 Egg
COMMON ITEM

Egg can be used in:
• Batter
• Dough
• ??? recipe

[ Use it ]
```

The player now knows Items have multiple purposes.

## 1:20 — simple combination

```text
╭──────────────────────────────────────╮
│ BAKERY                               │
│                                      │
│ PREP TABLE                           │
│                                      │
│  ◆ Effort      +      🥚 Egg         │
│                                      │
│              [ Combine ]             │
│                    ↓                 │
│               🥣 Batter              │
│                                      │
│ FIRST ORDER                          │
│ Needs: 🥣 Batter               0 / 1 │
╰──────────────────────────────────────╯
```

Tap Combine.

## 1:35 — first payoff

```text
FIRST ORDER COMPLETE

🥣 Batter delivered

Rewards
+ 30 Credits
+ Recipe discovered:
  BASIC CAKE

Bakery changed:
Prep shelf unlocked.

[ Continue ]
```

The world visibly changes.

## 1:45 — first meaningful choice

```text
Choose your first upgrade

[ Better Bowls ]
Hold 2 ingredients at once

[ Recipe Book ]
Reveal one ingredient in unknown recipes

[ Order Board ]
See 2 orders at once
```

All three alter play.

## 2:00 — reveal the hook

```text
╭──────────────────────────────────────╮
│ YOUR BAKERY                          │
│                                      │
│ Prep Table         New Shelf ✓       │
│                                      │
│ 🔒 OVEN                              │
│ Reputation 50                        │
│ Current: 18                          │
│                                      │
│ 🔒 STAFF                             │
│ Complete 3 real tasks                │
│ Progress: 0 / 3                      │
│                                      │
│ 🔒 FIRST CUSTOMER RUSH               │
│ Complete 2 normal orders             │
│                                      │
│ UNKNOWN RECIPE                       │
│ 🥚 + ? + ? → ???                     │
│                                      │
│ NEXT REAL TASK                       │
│ Read chapters 63–67                  │
│                                      │
│        [ Start this task ]           │
╰──────────────────────────────────────╯
```

Minute two ends with:

- one system understood
- several systems visible
- one meaningful choice made
- one mystery
- one near-term unlock
- one visible upcoming challenge
- one real task that advances all of it

---

# 13. Main navigation

A good initial structure:

```text
TODAY | TASKS | PLAY | WORLD | PROGRESS
```

## Today

**Question:** What should I do now, and what am I close to?

## Tasks

**Question:** What is the actual plan?

## Play

**Question:** What can I do with what I earned?

This adapts to active Play Packs.

## World

**Question:** What have I built?

## Progress

**Question:** What have I unlocked, collected, learned, and specialized in?

This includes:

- skills
- Items
- recipes
- equipment
- staff
- packs
- collections
- personal rewards

---

# 14. Mockup: Today

Example after the Bakery Pack has been active for a few days.

```text
╭────────────────────────────────────────────╮
│ WEDNESDAY, AUGUST 19                       │
│                                            │
│ Bakery Lv. 3                  Reputation   │
│ Oven almost unlocked               42 /50  │
│                                            │
│ ────────────────────────────────────────── │
│                                            │
│ UP NEXT                                    │
│ Finish Kingdom of Ash                      │
│                                            │
│ READ CHAPTERS 63–67                        │
│                                            │
│ Minimum       2 chapters                   │
│ Target        5 chapters                   │
│ Stretch       8 chapters                   │
│ Deadline      Aug 30                       │
│ Current pace  5.0 / day                    │
│                                            │
│ Why                                        │
│ The current sequence is about to change    │
│ gears.                                     │
│                                            │
│ [ Minimum ]                                │
│ 1 ◆ Effort · 1 Item drop                   │
│ Plan becomes 5.05/day                      │
│                                            │
│ [ Target ]                                 │
│ 2 ◆ Effort · 2 Item rolls                  │
│ Stay on pace                               │
│                                            │
│ [ Stretch ]                                │
│ 3 ◆ Effort · uncommon+ boost               │
│ Future pace falls to 4.95/day              │
│                                            │
│ [ Attention is garbage → 10 min sprint ]   │
│                                            │
│ ────────────────────────────────────────── │
│                                            │
│ CLOSE TO SOMETHING                         │
│ Oven                           42 / 50 Rep │
│ Staff applicant                 2 / 3 tasks│
│ Cake recipe                     2 / 3 Items│
│                                            │
│ ACTIVE ORDER                               │
│ Breakfast Box                              │
│ 🥣 Batter 1/1 · 🧈 Butter 0/1              │
│ Reward: Mixer blueprint + 35 Credits       │
│                                            │
│ OTHER THINGS TODAY                         │
│ ○ Send homepage draft       Work · 20m     │
│ ○ Put laundry away          Home · Quick   │
│                                            │
│ Today   Tasks   Play   World   Progress    │
╰────────────────────────────────────────────╯
```

Everything on the screen points somewhere.

---

# 15. Mockup: completion and proof

```text
╭──────────────────────────────────────╮
│ COMPLETE TASK                        │
│                                      │
│ Read chapters 63–67                  │
│                                      │
│ How much did you do?                 │
│                                      │
│ [ Minimum: 2 ]                       │
│ [ Target: 5 ]                        │
│ [ Stretch: 8 ]                       │
│                                      │
│ Proof                                │
│ Project rule: Light receipt          │
│                                      │
│ Current position                     │
│ [ Chapter 67____________________ ]   │
│                                      │
│ Optional note                        │
│ [ ______________________________ ]   │
│                                      │
│                    [ Complete task ] │
╰──────────────────────────────────────╯
```

Result:

```text
TASK COMPLETE

Kingdom of Ash
Progress: 18% → 26%

Plan
✓ Still on pace for Aug 30

Produced
◆◆ 2 Effort

Item drops
🥛 Milk — Common
🫘 Vanilla Bean — Rare

Progress triggered
Staff Desk: 3 / 3 ✓

[ Go to Bakery ]
[ Back to Today ]
```

The rare drop is exciting because it has real possibilities.

---

# 16. Mockup: Item detail

Tap Vanilla Bean.

```text
╭──────────────────────────────────────╮
│ 🫘 VANILLA BEAN                      │
│ RARE · BAKERY PACK                   │
│                                      │
│ OWNED                                │
│ 1                                    │
│                                      │
│ Known uses                           │
│                                      │
│ Vanilla Batter                       │
│ 🫘 + 🥚 + 🥛                         │
│                                      │
│ Premium Frosting                     │
│ 🫘 + ?                               │
│                                      │
│ Unknown uses                         │
│ ??? recipe                           │
│                                      │
│ Collection                           │
│ Premium Ingredients          2 / 8   │
│                                      │
│ Set reward                           │
│ Unlock: Specialty Order Board        │
│                                      │
│ [ Pin Vanilla Batter recipe ]        │
╰──────────────────────────────────────╯
```

The Item has:

- immediate use
- unknown future use
- collection value
- progression value

No dead end.

---

# 17. Mockup: Play screen — Bakery Pack

```text
╭────────────────────────────────────────────╮
│ PLAY                               Bakery ▾│
│                                            │
│ EFFORT                             ◆◆ 2    │
│ CREDITS                            85      │
│                                            │
│ ── PRODUCTION ───────────────────────────  │
│                                            │
│ PREP TABLE Lv. 2                           │
│                                            │
│ [ ◆ Effort ] + [ 🥚 Egg ]                  │
│                  ↓                         │
│               🥣 Batter                    │
│                                            │
│ [ Make ]                                   │
│                                            │
│ OVEN 🔒                                    │
│ Unlock at 50 Reputation                    │
│ Current: 42                                │
│                                            │
│ ── ORDERS ───────────────────────────────  │
│                                            │
│ BREAKFAST BOX                              │
│ 🥣 Batter       1 / 1 ✓                    │
│ 🧈 Butter       0 / 1                      │
│ Reward: Mixer blueprint + 35 Credits       │
│                                            │
│ MYSTERY ORDER                              │
│ Requires Oven                              │
│ Reward: ???                                │
│                                            │
│ ── INVENTORY ────────────────────────────  │
│ 🥚 Egg ×2    🥛 Milk ×1    🫘 Vanilla ×1   │
│ 🥣 Batter ×1                               │
│                                            │
│ [ Recipes ] [ Staff ] [ Automation ]       │
│                                            │
│ Today   Tasks   Play   World   Progress    │
╰────────────────────────────────────────────╯
```

---

# 18. Mockup: multiple active packs

After activating Plants too:

```text
╭──────────────────────────────────────╮
│ PLAY                                 │
│                                      │
│ Active Packs                         │
│                                      │
│ [ 🧁 Bakery ]  [ 🌱 Plants ]         │
│                                      │
│ Today's Items                        │
│ 🥛 Milk                              │
│ 🫘 Vanilla Bean                      │
│ 🌱 Basil Seed                        │
│                                      │
│ CROSS-PACK DISCOVERY                 │
│                                      │
│ 🥣 Vanilla Batter + 🌿 Fresh Basil   │
│              ↓                       │
│          ?????????                   │
│                                      │
│ Combination not discovered yet.      │
│                                      │
│ [ Try combination ]                  │
╰──────────────────────────────────────╯
```

A weird combination can fail harmlessly, produce a clue, or occasionally reveal something unexpected.

Experimentation should be safe.

---

# 19. Mockup: Plants Pack

```text
╭───────────────────────────────────────────╮
│ PLAY                              Plants  │
│                                           │
│ POTTING BENCH                             │
│                                           │
│ 🌱 Basil Seed + 🪴 Small Pot              │
│                 ↓                         │
│             🌿 Basil Sprout               │
│                                           │
│ GROWTH                                    │
│ Basil Sprout                    Stage 1/3 │
│ Needs: 1 Growth action                    │
│                                           │
│ PROPAGATION STATION 🔒                    │
│ Unlock: Grow 5 plants                     │
│ Progress: 3 / 5                           │
│                                           │
│ COLLECTION                                │
│ Herb Garden                         3/12  │
│                                           │
│ Set reward                                │
│ Greenhouse Blueprint                      │
│                                           │
│ RARE POSSIBILITY                          │
│ A rare seed can grow into a permanent     │
│ tree in your World.                       │
╰───────────────────────────────────────────╯
```

Now "plant a tree" is not a disconnected reward.

It is a rare Item outcome with a world consequence.

---

# 20. Mockup: World hub and Pack Spaces

The persistent World is best thought of as a **hub for small simulator Spaces**. A player can have several active Play Packs without forcing bakery counters, office desks, pets and greenhouses into one giant room.

```text
╭──────────────────────────────────────────╮
│ WORLD                                    │
│                                          │
│ YOUR SPACES                              │
│                                          │
│ ┌─────────────┐     ┌────────────────┐   │
│ │ 🧁 BAKERY   │     │ 🌱 GREENHOUSE │    │
│ │ Stage 3/6   │     │ Stage 2/6      │   │
│ │ Rush: 2/3   │     │ Plants: 4/5    │   │
│ └─────────────┘     └────────────────┘   │
│                                          │
│ ┌────────────────────────┐               │
│ │ 🗂 OFFICE              │                │
│ │ Stage 1/6              │               │
│ │ First boss locked      │               │
│ └────────────────────────┘               │
│                                          │
│ GLOBAL                                   │
│ Reputation 118                           │
│ Legacy 0                                 │
│                                          │
│ RECENT CHANGES                           │
│ • Staff Desk opened                      │
│ • Rare tree grown in Greenhouse          │
│ • Bakery display case upgraded           │
│                                          │
│ [ Open Bakery ]   [ Manage active packs ]│
│                                          │
│ Today   Tasks   Play   World   Progress  │
╰──────────────────────────────────────────╯
```

Inside Bakery:

```text
╭───────────────────────────────────────────╮
│ BAKERY                         Stage 3/6  │
│                                           │
│              cozy 3D room                 │
│                                           │
│  Prep Lv.2    Oven Lv.1    Counter Lv.2   │
│                                           │
│  Mara: Prep Assistant                     │
│                                           │
│  Customers waiting: 2                     │
│                                           │
│        [ Serve next customer ]            │
│                                           │
│  NEXT UPGRADE                             │
│  Second Oven                              │
│  220 / 300 Credits                        │
│                                           │
│  BOSS                                     │
│  Saturday Rush                            │
│  2 / 5 customers served                   │
│                                           │
│ [Recipes] [Staff] [Upgrades] [Challenges] │
╰───────────────────────────────────────────╯
```

The Space is authored to look good. The player gets meaningful choices, but not a blank room they have to decorate from scratch.

A rare tree still matters: it appears permanently in the Greenhouse Space and can unlock Nursery mechanics. Cross-pack Items can still travel through the shared Item system.


# 21. Mockup: Progress

```text
╭───────────────────────────────────────────╮
│ PROGRESS                                  │
│ Reputation 118 / 150                      │
│                                           │
│ [ Skills ] [ Items ] [ Recipes ] [ Staff ]│
│ [ Gear ]   [ Packs ] [ Rewards ]          │
│                                           │
│ SKILLS                                    │
│                                           │
│ CORE                                      │
│                                           │
│ Operations                                │
│ ●────●────○                               │
│      │                                    │
│      └──○ Batch Routing                   │
│                                           │
│ Discovery                                 │
│ ●────○────?                               │
│                                           │
│ Leadership                                │
│ ●────○                                    │
│                                           │
│ PACK BRANCHES                             │
│                                           │
│ Bakery                                    │
│ Prep ●──○──?                              │
│ Baking ●──○──?                            │
│                                           │
│ Plants                                    │
│ Growth ●──○                               │
│ Propagation ○──?                          │
│                                           │
│ 1 Skill Point available                   │
│                                           │
│ [ Choose skill ]                          │
╰───────────────────────────────────────────╯
```

---

# 22. Global and pack-specific skill trees

## Core skill tree

These branches work regardless of Play Pack.

### Operations

Examples:

- queue an extra recipe
- save routing rules
- batch common Items
- reserve inventory automatically

### Momentum

Examples:

- unlock focus-sprint variants
- pin the next real action
- turn a minimum completion into a quick production route

### Discovery

Examples:

- reveal recipe clues
- slightly improve rare discovery chance
- inspect unknown Item categories
- reveal one special-order reward

### Leadership

Examples:

- unlock staff training
- add staff assignment slots
- allow staff synergies

### Planning

Examples:

- advanced pacing presets
- project templates
- automated replan rules
- additional saved-view logic

## Pack skill trees

These create flavor.

Example Bakery:

```text
PREP
Faster batching
Ingredient storage
Prep automation

BAKING
Oven recipes
Multi-stage recipes
Specialty bakes

SERVICE
More orders
Premium customers
Order chaining

EXPERIMENTATION
Hidden recipes
Rare ingredients
Cross-pack combinations
```

---

# 23. Mockup: staff

Staff are mechanical.

```text
╭──────────────────────────────────────╮
│ NEW APPLICANTS                       │
│                                      │
│ MARA                                 │
│ Prep Assistant                       │
│                                      │
│ Ability                              │
│ Automatically processes the first    │
│ basic recipe each day.               │
│                                      │
│ Synergy                              │
│ Recipe Book                          │
│ Reveals one queued recipe ingredient │
│ after processing.                    │
│                                      │
│ ──────────────────────────────────── │
│                                      │
│ PIP                                  │
│ Order Clerk                          │
│                                      │
│ Ability                              │
│ Automatically fills one order when   │
│ all required Items are in inventory. │
│                                      │
│ Synergy                              │
│ Display Case                         │
│ +1 premium order slot.               │
│                                      │
│ [ Hire Mara ]   [ Hire Pip ]         │
│                                      │
│ The other applicant can return.      │
╰──────────────────────────────────────╯
```

No irreversible panic.

---

# 24. Mockup: automation

After automation has been earned:

```text
╭──────────────────────────────────────╮
│ AUTOMATION                           │
│                                      │
│ When Effort arrives                  │
│                                      │
│ 1. Reserve 1 ◆ for pinned upgrades   │
│                                      │
│ 2. If active order needs Batter:     │
│    → route to Prep Table             │
│                                      │
│ 3. Otherwise:                        │
│    → keep Effort unspent             │
│                                      │
│ ──────────────────────────────────── │
│                                      │
│ Ingredient rules                     │
│                                      │
│ Eggs                                 │
│ Keep minimum: 2                      │
│ Use overflow in pinned recipes       │
│                                      │
│ Milk                                 │
│ Keep all                             │
│                                      │
│ Common duplicates                    │
│ Recycle after 5 copies               │
│                                      │
│ [ Save rules ]                       │
╰──────────────────────────────────────╯
```

The player earns their way from simple interaction to management.

---

# 25. The PM side stays serious

The game should never make the task system worse.

## Mockup: Tasks

```text
╭────────────────────────────────────────────╮
│ TASKS                                + Add │
│                                            │
│ [ Today ▾ ]                                │
│                                            │
│ Saved views                                │
│ Today | Work | Personal | Reading | Quick  │
│                                            │
│ Filter   Group: Project   Sort: Priority   │
│ Customize view                             │
│                                            │
│ ── FINISH KINGDOM OF ASH ────────────────  │
│                                            │
│ ○ Read chapters 63–67                      │
│   Today · High · 2 / 5 / 8                 │
│   Milestone: Gods & Gates                  │
│                                            │
│ ○ Read chapters 68–72                      │
│   Thu · High · blocked by ↑                │
│                                            │
│ ── PORTFOLIO SITE ───────────────────────  │
│                                            │
│ ○ Write homepage intro                     │
│   Today · Medium · ~30m                    │
│   Milestone: Homepage complete             │
│                                            │
│ ◐ Pick final projects                      │
│   In progress · No due date                │
│                                            │
│ ── HOME ─────────────────────────────────  │
│                                            │
│ ○ Put laundry away                         │
│   Anytime · Quick                          │
│                                            │
│ Today   Tasks   Play   World   Progress    │
╰────────────────────────────────────────────╯
```

## Mockup: task record

```text
TASK

Write homepage intro

Project
Portfolio Site

Status
Not started

Priority
Medium

Start
Aug 19

Due
Aug 20

Minimum
Draft opening paragraph

Target
Complete homepage intro

Stretch
Intro + CTA copy

Why
Getting this written unlocks the homepage build.

How
Start from existing About copy.

Proof
Light receipt → text snippet

Milestone
Homepage complete

Depends on
Site positioning ✓

Blocks
Build homepage layout

Tags
Writing, Deep work

Custom field
Website section → Homepage

Game
Active pack: Office
Milestone game effects: On
```

---

# 26. Saved views are foundational

## Mockup: customize view

```text
VIEW: TODAY

Scope
☑ Due today
☑ Missed / unresolved
☑ Anytime
☐ Future

Projects
☑ All

Filters
Priority        Any
Estimate        Any
Tags            Any
Status          Not done

Group by
Project

Sort by
Priority → Due date

Fields shown
☑ Status
☑ Due date
☑ Priority
☑ Minimum / Target / Stretch
☑ Milestone
☑ Estimate
☐ Proof rule
☐ Notes
☑ Game preview

Layout
● List
○ Board
○ Focus

[ Save view ]
```

---

# 27. Project types

Counting should not be the universal model.

Possible structures:

- Checklist
- Quantity
- Deadline
- Milestone / phase
- Recurring operations
- Backlog
- Open-ended
- Hybrid

## Mockup: project setup

```text
NEW PROJECT

Name
[ Finish Kingdom of Ash ]

Structure
● Quantity
○ Checklist
○ Milestones
○ Recurring
○ Open-ended
○ Hybrid

Measure
[ chapters ]

Remaining
[ 65 ]

Planning
● Finish by a date
  [ Aug 30 ]

○ Keep a pace
  [ ___ per day ]

○ Forecast only

Comfortable pace
[ 5 per day ]

Success levels
Minimum   [ 2 ]
Target    [ 5 ]
Stretch   [ 8 ]

Proof
[ Light receipt ▾ ]

Play Pack
[ Plants ▾ ]

Personal completion reward
[ Starbucks________________ ]

[ Create project ]
```

Everything else can be added later.

---

# 28. Adaptive pacing

The plan should follow reality.

Suppose a day is missed.

```text
REALITY CHANGED

Yesterday's planned 5 chapters weren't logged.

You still have 55 chapters before Aug 30.

Choose what should move:

[ Keep Aug 30 ]
Future pace: 5.0 → 5.5 / day

[ Keep 5/day ]
Projected finish: Aug 31

[ Trim scope ]
Choose a smaller finish line

[ Leave plan unchanged ]
Show me as 5 behind
```

Nothing is red.

Nothing scolds.

The user gets a real decision.

---

# 29. Project milestones connect PM and game

Example:

```text
PROJECT
Portfolio Site

MILESTONE
Homepage complete

Real requirements
✓ Homepage intro
✓ CTA copy
○ Build layout
○ Responsive QA
○ Publish preview

When complete

PM
→ Projects section unlocks

Game
→ Portfolio Studio gains display window
→ guaranteed Office Item drop
→ +15 Reputation
→ chance for Specialist applicant

Personal reward
→ Order takeout
```

One milestone advances three meaningful layers:

- real project
- game
- personal motivation

---

# 30. Full chain: one real task with a Bakery Pack

Real task:

```text
Finish Kingdom of Ash
└─ Read chapters 63–67
```

Completion:

```text
PM
├─ Task → Done
├─ Book progress 18% → 26%
├─ Forecast remains Aug 30
└─ Next reading task becomes available
```

Game:

```text
TARGET completion
├─ +2 Effort
├─ Egg drop
└─ Rare roll → Vanilla Bean
```

Production:

```text
2 Effort
├─ 1 reserved for Oven construction
└─ 1 routed to Prep Table

Egg + Effort
→ Batter
```

Order:

```text
Breakfast Box
Batter 1/1
Butter 1/1

COMPLETE
├─ +35 Credits
├─ Mixer Blueprint
└─ +12 Reputation
```

Reputation:

```text
42 → 54

Threshold 50 crossed

UNLOCK
Oven
```

Construction:

```text
Oven needs
30 Credits
+ 1 Metal Tray

Owned
35 Credits
+ 1 Metal Tray

BUILD
```

World:

```text
Tiny bakery
→ bakery with working oven

New visual animation
New station appears
New recipes become visible
```

Skills:

```text
Oven unlock reveals Bakery: Baking branch

First choice
[ Faster Bakes ]
[ Multi-stage Recipes ]
[ Specialty Breads ]
```

Return hook:

```text
Vanilla Bean now shows:

Known uses
Vanilla Cake

Unknown use
? + Vanilla Bean → ???

You have:
Vanilla Bean 1/1
Milk 0/1
Cake recipe 2/3 ingredients known

NEXT REAL TASK
Write homepage intro
Office Pack drop available
```

No loose ends.

---

# 31. Full chain: one real task with the Plants Pack

Task:

```text
Portfolio Site
└─ Write homepage intro
```

Completion:

```text
+2 Effort
+ Common Item: Pot
+ Rare Item: Maple Seed
```

Plant recipe:

```text
Maple Seed + Pot + Effort
→ Maple Sprout
```

Growth:

```text
Maple Sprout
requires 3 future completed tasks
to mature
```

After three tasks:

```text
Maple Sprout
→ Maple Tree
```

World consequence:

```text
TREE GROWN

Permanent World change:
Maple tree added outside Portfolio Studio

Collection:
Trees 1 / 20

Set reward at 5 trees:
Nursery unlocked
```

The rare Item created a long-term return hook tied to future real work.

---

# 32. Cross-pack chain

Active packs:

- Bakery
- Plants

Player owns:

- Vanilla Bean
- Strawberry Plant
- Gift Box

Discovery:

```text
Strawberry Plant
→ Strawberry

Strawberry + Vanilla Batter
→ Strawberry Vanilla Cake

Cake + Gift Box
→ Celebration Box
```

Celebration Box can:

```text
fulfill rare order
→ +80 Credits
→ Date Night Pack preview unlock
→ special world event
```

Now one pack can naturally tease another pack without requiring it.

---

# 33. Pack discovery and unlocking

Not every pack needs to be available immediately.

Some can be starter choices.

Others can be discovered or bought later.

Important rule:

> **Do not paywall core progression.**

Paid content can add:

- new Play Packs
- cosmetics
- additional Item pools
- new themes
- extra world styles
- optional side mechanics

But a player who owns only the base game should still have a complete progression arc.

---

# 34. Item rarity

Rarity should create surprise, not mandatory grind.

Possible neutral labels:

- Common
- Uncommon
- Rare
- Special
- Signature

Example Bakery drop table:

```text
COMMON
Egg
Milk
Flour
Sugar
Butter
Paper Bag

UNCOMMON
Chocolate
Cream
Berry Mix
Decorating Tip
Metal Tray

RARE
Vanilla Bean
Sourdough Starter
Gold Leaf
Specialty Flour
Recipe Fragment

SPECIAL
Master Recipe
Vintage Mixer Part
Mystery Ingredient

SIGNATURE
Golden Whisk
Family Recipe Book
Bakery Sign
```

Signature Items should usually unlock behavior or leave a visible mark.

---

# 35. Collections should do something

Example:

```text
COLLECTION
Premium Ingredients

Vanilla Bean          ✓
Specialty Flour       ✓
Gold Leaf             ○
Saffron               ○
Single-Origin Cocoa   ○

2 / 5

At 3
Unlock Premium Order pool

At 5
Unlock Pastry Chef applicant
```

Collection completion feeds back into play.

---

# 36. Equipment

Equipment should change rules, not just numbers.

```text
CURRENT LOADOUT

Tool
QUICK-SET SCALE
First ingredient combination each day
does not use a queue slot.

Charm
LUCKY RECEIPT
Special orders reveal one possible drop.

Ledger
BOUND ORDER BOOK
Pin one additional order.

Accessory
GREEN APRON
Bakery + Plants cross-pack recipes
are easier to discover.
```

A +5% modifier can exist underneath.

But behavioral effects are the interesting part.

---

# 37. Personal reward mockup

```text
╭──────────────────────────────────────╮
│ PERSONAL REWARD                      │
│                                      │
│ Starbucks                            │
│                                      │
│ Trigger                              │
│ Complete project                     │
│ Finish Kingdom of Ash                │
│                                      │
│ Reminder                             │
│ When project completes               │
│                                      │
│ This reward is personal.             │
│ It does not cost game Credits.       │
│                                      │
│ [ Save reward ]                      │
╰──────────────────────────────────────╯
```

Optional earned shelf:

```text
MY REWARD SHELF

★ 7 Reward Stars

Starbucks
3 ★
[ Claim ]

Guilt-free game night
5 ★
[ Claim ]

New book
10 ★
[ Not yet ]
```

A user can ignore this entire system.

---

# 38. Progression to obsession

## Minute 1

> This is cute.

One project.

One task.

One starter pack.

One Item.

One station.

## Minute 2

> Wait, what does that locked thing do?

Visible:

- Oven
- Staff
- unknown recipe
- upgrade choice

## Task 3

Staff unlocks.

The player chooses between different functional abilities.

> I have a strategy.

## Task 5

First multi-stage recipe and first normal customer/encounter challenge.

```text
Effort
→ Batter
→ Cake
→ Gift Box
```

> Things turn into other things.

## Task 8

A rare Item drops.

It has:

- one known use
- one hidden use
- collection progress

> I want to know what this does.

## Task 10

First Skill Point and first boss meter nearing completion.

Three choices change play differently.

> I have a build.

## First milestone

A real project milestone changes the World.

> My actual project affected the game map.

## Task 15

Staff starts automating a step the player used to perform manually.

> I earned my way out of doing that.

## Week 2

First boss has unlocked a qualitative capability. Second Play Pack activates.

Cross-pack combinations appear.

> These systems talk to each other.

## Week 3

Equipment + skills + staff + stations produce meaningful optimization.

> I can tune this.

## First completed project

Not:

```text
PROJECT COMPLETE
+500 XP
```

Instead:

```text
PROJECT COMPLETE
FINISH KINGDOM OF ASH

Real-world reward
Starbucks ✓

Game
Signature Item drop
Maple tree fully grown
Reading project monument added
+1 Legacy Point

Unlock
Projects can now carry one learned advantage
into the next project.

Collection
Finished Projects: 1

New mystery
Legacy Workshop door unlocked.
```

> Finishing things permanently changes future play.

---

# 39. Prestige as legacy

Prestige should not delete progress.

Major completed projects can award **Legacy Points**.

Legacy skills might include:

```text
STRONG START
New projects begin with one starter Item.

KNOWN GROUND
Reveal the first project-specific game unlock.

TRUSTED CREW
Carry one staff specialty into a new venture.

BETTER BRIEF
New projects can start from an advanced PM template.

HEAD START
Choose one common recipe already learned
when activating a new Play Pack.
```

Finishing makes future play richer.

---

# 40. What stays from the current prototype

Even if the interface is rebuilt, keep the strongest ideas.

## Tasks as source of truth

All other screens should read from the same underlying task/project records.

## Customizable task views

This should grow, not disappear.

## Minimum / Target / Stretch

Flexible success is a strong fit.

## Consequence previews

Before the user chooses a completion tier, show:

- PM consequence
- game consequence

## Adaptive pacing

Keep deadline-fixed, pace-fixed, forecast-only, and fixed-plan behaviors.

## Honest strain warning

If a plan quietly becomes unreasonable, say so and offer actual choices.

## Focus escape hatch

A short focus mode belongs here.

## Local-first behavior

Logging and playing should feel instant and work without a network.

## Accessibility

Depth cannot depend on clutter, tiny targets, mouse-only input, or color-only meaning.

## Nothing punishes

No red shame state.

No wilted world.

No destroyed streak.

No confiscated Items.

---

# 41. What changes from the current prototype

## Replace parallel reward systems with causal systems

Avoid:

```text
XP
coins
loot
plants
biomes
milestones
```

all sitting beside each other.

Prefer:

```text
task
→ Effort + Item
→ combination / production
→ order / construction
→ Credits + Reputation
→ skills / staff / expansion
→ World
```

## Replace "loot" with Items

Theme packs can flavor the nouns.

The core engine remains neutral.

## Make the World persistent across projects

Projects add to the same long-term game.

## Turn the timeline into a project view

It does not need a permanent global tab unless testing proves otherwise.

## Keep personal rewards separate from the game economy

Starbucks does not need to compete with an oven.

---

# 42. No-loose-ends audit

| Thing | Comes from | Goes to | Why it exists |
|---|---|---|---|
| Task | Real plan | Completion | Real work |
| Proof | Completion | Valid completion | Makes rewards meaningful |
| Effort | Completed work | Stations / actions | Bridge from life to game |
| Item | Drops / crafting / orders | Recipes / upgrades / collections | Discovery + combinations |
| Duplicate Item | Repeated drops | Craft / upgrade / recycle | Prevent dead rewards |
| Recipe | Discovery / skills / packs | Item transformation | Combinatorial depth |
| Station | Credits / blueprint / milestone | Production | New capability |
| Order | Pack / progression | Consumes Items | Production sink |
| Challenge | Prepared Items / loadout / pack state | Rewards / boss progress | Gives Items and upgrades a purpose |
| Boss | Challenge progression | New station / staff / automation / mechanic | Qualitative progression gate |
| Pack Space | Play Pack progression | Challenges / visual state / world history | Small playable simulator world |
| Credits | Orders / objectives | Stations / staff / upgrades | Strategic spending |
| Reputation | Orders / projects | Unlock thresholds | Long progression |
| Skill Point | Reputation / achievements | Skill tree | Build choice |
| Skill | Skill point | Changes rules | Meaningful progression |
| Equipment | Craft / drop / unlock | Loadout | Changes strategy |
| Staff | Unlock / applicant | Automation | Earn out of grunt work |
| Automation | Skills / staff | Reduces manual game labor | Higher-level management |
| Collection | Items | Pack unlocks / staff / recipes | Gives collecting a purpose |
| Play Pack | User choice / unlock | Item pools / mechanics | Customizable game identity |
| Milestone | Project progress | PM + game + personal effects | Connects layers |
| Personal reward | User | Real-world payoff | Personal motivation |
| World | Everything above | History + curiosity | Visible transformation |
| Legacy Point | Major project finish | Permanent upgrades | Reward finishing |
| Mystery / locked content | Progression | Discovery | Return momentum |

If a new concept cannot fill all four columns, reconsider it.

---

# 43. The first prototype to build

Do not rebuild the entire app first.

Build one vertical slice:

```text
1 project
→ 1 real task
→ Minimum / Target / Stretch
→ 1 proof rule
→ Effort
→ 1 Item drop
→ 1 Play Pack
→ 1 station
→ 1 combination
→ 1 order
→ 1 short customer / encounter challenge
→ 1 reward choice
→ Credits
→ 1 upgrade choice that changes challenge play
→ 1 visible Pack Space change
→ 1 Staff unlock
→ 1 rare Item with a challenge use
→ 1 unknown recipe
→ 1 tiny boss that unlocks a new capability
```

Then test:

> **After completing one real task, do I immediately want to complete another because I care what the game will do?**

If no, more tabs will not fix it.

If yes, build outward.

---

# 44. The obsession test

The design is working when I can genuinely say:

- I opened the app because I wanted to see what I could unlock.
- I understood the first interaction almost immediately.
- I still do not know everything that exists.
- My active Play Packs make the game feel like mine.
- I can switch from Bakery to Plants without losing the larger progression.
- Items have actual uses.
- Duplicates still matter.
- Rare drops are exciting without being mandatory.
- Items make me better at challenges instead of merely filling a collection.
- Credits keep having desirable things to buy.
- A boss regularly unlocks something I can actually *do* that I could not do before.
- Each Play Pack feels like a small cozy simulator Space, not just an Item skin.
- My skill choices change how I play.
- Real project structure matters to the game.
- The PM system remains genuinely useful.
- I can see my real effort in the World.
- Repetitive game chores disappear as I earn automation.
- Missing a day changes the plan without punishing me.
- I am not spending twenty minutes placing decorative furniture.
- A project can have a personal reward like Starbucks without breaking the game economy.
- The game at month two is structurally deeper than the game at minute two.
- Completing a real task feels like pulling the first domino in a chain.

**That is the product.**


---

# 45. PM research note

The PM expansion above was informed by current product patterns in Asana, Monday and Notion.

The important takeaway is architectural rather than visual:

> **One underlying record should support many views, and behavior should belong to the record rather than being recreated independently inside each view.**

Views are lenses.

Task progress models, dates, dependencies, recurrence, approvals, waiting states, proof and pacing belong to the data model.

That principle is what lets a counting Task appear sensibly in List and Calendar, partly in Timeline, and perhaps not at all in a view that cannot represent it without distortion.

The 100 use cases above should be treated as a standing stress test when the next phase formalizes:

- Project taxonomy
- Task progress models
- scheduling model
- recurrence
- dependencies
- states
- notifications
- views
- archives
- history
- pacing
- proof
- automation
