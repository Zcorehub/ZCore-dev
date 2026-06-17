# ZCore - Elevator Pitch (Model B)

## One-Liner

**"ZCore is the portable credit infrastructure for Stellar DeFi — aggregating verified on-chain payment events from partner platforms into a single 0-850 score."**

---

## Versión Investor Pitch (3 minutos)

"DeFi lending in Stellar has a fundamental problem: every protocol is a silo. A user who pays escrows faithfully on Trustless Work, repays loans on Blend, and completes tanda cycles on Vaquita has no way to carry that reputation to the next protocol. Each platform starts from zero.

**ZCore solves this.**

We are portable credit infrastructure. Partner platforms — Trustless Work, Blend Protocol, Vaquita — call our API after a payment event occurs. We verify the transaction hash on Stellar Horizon, calculate a score impact with anti-Sybil counterparty decay, and update the user's portable credit score.

The result: a 0-850 score derived from two sources.

First, a Stellar base (0-150 points) from on-chain wallet activity — age, transactions, success rate, balance, trustlines. This is the cold-start solver; every Stellar user starts with something.

Second, verified credit events (0-700 points) from partner platforms — escrow completions (up to 60 pts), loan repayments (up to 80 pts), tanda round payments (up to 30 pts), tanda cycle completions (up to 100 pts). Each event is verified on Horizon before it touches the score. No single txHash can be counted twice.

The anti-Sybil layer uses counterparty decay: the first payment with a counterparty is worth 100%, the second 70%, the third 40%, the fourth and beyond 10%. You can't farm score by transacting with yourself.

Score ranges: A ≥ 600, B ≥ 350, C ≥ 100, REJECTED below 100.

We are open-source, MIT licensed, and built for Stellar. Partners integrate in one day with a REST API and an API key. We don't touch money. We verify events and maintain reputation.

The market: every DeFi protocol on Stellar building any kind of credit product needs this. Trustless Work handles escrow, Blend handles lending, Vaquita handles community savings — none of them can share reputation today. We are the shared layer."

---

## Versión Technical Pitch (90 segundos)

"ZCore is a credit event aggregator for Stellar DeFi.

Partner platforms POST to `/api/events/report` with their API key, the event type, the user's wallet, the amount, and the txHash. We:

1. Validate the platform API key against our Platform table
2. Verify the txHash exists and succeeded on Stellar Horizon
3. Check txHash uniqueness — the `CreditEvent` table has `@unique` on txHash, so no replay
4. Calculate counterparty decay for anti-Sybil (100%→70%→40%→10% per repeated counterparty)
5. Calculate score impact: `base + perUSDC × amount`, capped per-event by type
6. Atomic Prisma transaction: create CreditEvent + update User score + tier

Score = Stellar Base (0-150 from wallet analysis on Horizon) + Events sum (0-700 from partner reports).

Stack: Node.js + Express + TypeScript + MySQL + Prisma 5 + Stellar Horizon API.

APIs that consume ZCore: `GET /api/user/:wallet/score` returns score, tier, breakdown (stellarBase, eventsScore, totalEvents, platforms). `GET /api/user/:wallet/history` returns last 50 events with full audit trail."

---

## Versión Demo Day (2 minutos)

**[Slide 1: Problem]**
"Stellar DeFi has three great protocols — Trustless Work for escrow, Blend for lending, Vaquita for community savings. They don't share reputation. A user with a perfect payment history on all three starts from scratch on each one."

**[Slide 2: Solution]**
"ZCore is the shared reputation layer. Partner platforms report verified payment events. Users build a portable 0-850 credit score. That score travels with the wallet, not with the protocol."

**[Slide 3: How it works]**
"Maria completes an escrow on Trustless Work. Trustless Work calls our API with the txHash. We verify it on Stellar Horizon. Maria gets +22 points. She repays a loan on Blend. Another call, another verification, +45 points. She applies on Vaquita — her score precedes her."

**[Slide 4: Anti-fraud]**
"Every txHash is unique in our DB. Counterparty decay prevents self-dealing — the 4th transaction with the same wallet is worth 10% of the first. No farming."

**[Slide 5: Traction]**
"Open-source on GitHub. Integration ready: one curl call to register a platform, one call to register an event. Trustless Work, Blend, and Vaquita are the target Day 1 partners."

---

## Versión Casual (Networking)

"We're building ZCore. Think of it as a portable credit score for Stellar DeFi.

The problem is that protocols like Trustless Work, Blend, and Vaquita each have their own users who pay faithfully — but that payment history is stuck inside each protocol. There's no way to take your reputation from one to another.

We're the infrastructure in the middle. Platforms call our API when a payment happens. We verify it on Stellar blockchain. We add it to the user's score. The score is portable.

It's open-source. Partners integrate in a day. We verify every transaction on-chain — no self-reporting, no gaming.

Are you building on Stellar?"

---

## Score System Reference

| Component | Points | Source |
|---|---|---|
| Stellar Base | 0-150 | Horizon API: wallet age, tx count, success rate, balance, trustlines |
| escrow_completed | up to 60/event | Trustless Work → verified txHash |
| loan_repaid | up to 80/event | Blend Protocol → verified txHash |
| tanda_round_paid | up to 30/event | Vaquita → verified txHash |
| tanda_cycle_completed | up to 100/event | Vaquita → verified txHash |
| **Total Max** | **850** | |

| Tier | Score | Access |
|---|---|---|
| A | ≥ 600 | Best rates, high limits |
| B | ≥ 350 | Standard access |
| C | ≥ 100 | Limited access |
| REJECTED | < 100 | No access |
