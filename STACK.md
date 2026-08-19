# STACK — services, roles and costs

What On We Go actually runs on, what each service is for, and what it costs. Reviewed against a proposed stack that came from a different architecture — the differences are explained below so the reasoning survives.

---

## The stack

| Service | Role | Cost while building | At launch |
|---|---|---|---|
| **GitHub** | Source control | Free | Free |
| **Netlify** | Static hosting + serverless API + deploys | Free | Free, then usage-based |
| **Neon** | Postgres + Managed Better Auth | Free | Free tier likely holds; paid tier if it doesn't |
| **Capacitor** | Wraps the web app as a native iOS app | Free, open source | Free |
| **Apple Developer** | TestFlight + App Store | — | $99/year |
| **Google Play** | Android, if it happens | — | $25 once |
| **Resend** | Transactional email from your own domain | Free tier | Free tier likely holds |
| **RevenueCat** | Subscriptions across Apple, Google and web | Free | Free below $2,500 monthly revenue, then 1% |
| **Cloudflare** | DNS, and object storage if proof-of-work media is stored | Free | Free DNS; storage is pennies per GB |
| **Domain** | — | ~$15/year | ~$15/year |
| **Error monitoring** | Know when it breaks | Free tier (Sentry or similar) | Free tier |

**Realistically: about a dollar a month plus the domain while building. Around $9/month equivalent once the Apple account is in play.** At launch, the same, until there are enough users to move Neon or Netlify off their free tiers — and by then there's revenue.

---

## Two services on the proposed list that this project doesn't need

**Expo — skip.** Expo builds React Native apps. This app is plain HTML/CSS/JS wrapped by Capacitor, which is already configured in the repo. Moving to Expo means rewriting the entire client in React Native: months of work to end up in the same place. Capacitor is the right tool for a web app that needs to be in the App Store.

**Railway — skip.** Railway hosts backends. Netlify already hosts this one: the static client and the serverless function live in the same deploy, wired by `netlify.toml`, and deploy together on every push. Adding Railway means running two hosts, two deploy pipelines and two sets of environment variables to do one job. Railway would make sense if this app grew a long-running server — a websocket layer, background jobs, scheduled work — and that's a decision to revisit if it ever does.

Both were sensible picks for the stack they came from. They just don't match this one.

---

## Three worth adding, in this order

### Resend — before real users
Sign-in codes currently send through Neon's shared development sender. That's fine for testing and wrong for launch: mail from a shared sender lands in spam, and the address doesn't belong to you. Resend sends from your own domain, which needs DNS records — which is why the domain and Cloudflare come first.

*Free tier covers thousands of emails a month; comfortable for a long time.*

### RevenueCat — when subscriptions get built, not before
The right layer for this, and worth being clear about what it does and doesn't do. <cite index="140-1">It isn't a payment processor — it's an SDK that abstracts Apple's App Store, Google Play and web billing into one layer, handling server-side receipt validation, entitlements and subscription state, plus paywall tooling and analytics.</cite>

It answers the question you asked directly: <cite index="145-1">it supports Stripe for web-based payments alongside Apple and Google, so mobile and web subscriptions are managed in one place.</cite> One entitlement check in the app, whichever way someone paid.

Cost: <cite index="148-1">free up to $2,500 in monthly tracked revenue, then 1% of tracked revenue — which sits on top of Apple's or Google's 15–30% commission.</cite> Apple's cut drops to 15% under their small business programme, which this qualifies for.

*Don't wire it up early. It's plumbing for a decision that hasn't been made yet.*

### Cloudflare — only if proof-of-work media is stored
Free DNS is worth having regardless. The storage question depends on an unmade decision (see `PRODUCTION.md`): if proof photos are stored rather than verified-and-discarded, they need object storage, and Cloudflare R2's lack of egress fees makes it the cheap option. If proof is discarded after checking, this stays a DNS entry and nothing more.

---

## What each service holds

Needed for the privacy policy, and useful for knowing what breaks if a provider disappears.

| Service | Personal data | User content | Can it be swapped? |
|---|---|---|---|
| Netlify | IPs in logs | No | Yes — any static host plus a function runtime |
| Neon | Email, name, session records | **Yes — everything** | Yes, it's standard Postgres, but it's the migration that matters |
| Neon auth | Email, name, provider identity | No | Harder — accounts and sessions would need migrating |
| Google OAuth | Email, name | No | Optional path, easy to drop |
| Resend | Email addresses | No | Yes, trivially |
| RevenueCat | Purchase identity | No | Yes, with effort |
| Cloudflare | IPs | Only if media is stored | Yes |
| Apple | Purchase and account identity | No | No, if you're in the App Store |

**The lock-in worth watching is Neon**, because it holds both the data and the accounts. Postgres itself is portable; the auth layer is less so. Worth knowing before it holds real users' data — not worth avoiding today.

---

## Cost triggers to watch

Nothing here bills by surprise, but these are the lines to notice:

- **Netlify function invocations** — generous free tier; a sync-on-every-change app can burn through it faster than a static site. The push is already debounced, which helps.
- **Neon compute hours** — the free tier suspends when idle and wakes on demand. Fine for personal use; watch it if usage becomes constant.
- **Media storage**, if proof is stored — the only line that grows with every user, forever. The strongest argument for verify-and-discard.
- **RevenueCat's 1%** — only above $2,500/month, and a good problem to have.
