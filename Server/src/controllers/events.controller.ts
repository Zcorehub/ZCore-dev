import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { CreditEventPayload, CreditEventType } from "../types";
import {
  calculateEventImpact,
  applyCounterpartyDecay,
  assignProfileTier,
  calculateStellarBase,
} from "../services/scoring.service";
import {
  fetchStellarWalletData,
  verifyTransaction,
} from "../services/stellar.service";
import { Platform, User } from "@prisma/client";
import {
  dispatchScoreUpdatedWebhook,
} from "../services/webhook.service";

const MIN_WALLET_AGE_DAYS = 30;
const MONTHLY_SCORING_CAP = 10;

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Credit event reporting from partner platforms
 */

const recordZeroScoreEvent = async (
  user: User,
  platform: Platform,
  payload: CreditEventPayload,
  note: string,
  res: Response,
  dryRun = false
) => {
  if (dryRun) {
    return res.status(200).json({
      success: true,
      data: {
        dryRun: true,
        wouldApply: false,
        scoreImpact: 0,
        projectedScore: user.score,
        projectedTier: user.profileTier,
        verified: true,
        note,
      },
    });
  }

  const creditEvent = await prisma.creditEvent.create({
    data: {
      userId: user.id,
      platformId: platform.id,
      eventType: payload.eventType,
      amount: payload.amount,
      currency: payload.currency ?? "USDC",
      txHash: payload.txHash,
      counterpartyWallet: payload.counterpartyWallet ?? null,
      scoreImpact: 0,
      verifiedAt: new Date(),
    },
  });

  return res.status(200).json({
    success: true,
    data: {
      eventId: creditEvent.id,
      scoreImpact: 0,
      newScore: user.score,
      newTier: user.profileTier,
      verified: true,
      note,
    },
  });
};

/**
 * @swagger
 * /api/events/report:
 *   post:
 *     tags: [Events]
 *     summary: Report a verified credit event from a partner platform
 *     description: |
 *       Called by registered partner platforms (Trustless Work, Blend Protocol, Vaquita)
 *       when a credit-relevant payment event occurs. ZCore verifies the txHash on-chain
 *       before updating the user's score.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apiKey
 *               - eventType
 *               - walletAddress
 *               - amount
 *               - txHash
 *               - timestamp
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: Platform API key issued by ZCore admin
 *                 example: "trustless_work_abc123..."
 *               eventType:
 *                 type: string
 *                 enum: [escrow_completed, loan_repaid, tanda_round_paid, tanda_cycle_completed]
 *                 example: "escrow_completed"
 *               walletAddress:
 *                 type: string
 *                 description: Stellar wallet of the user whose score will be updated
 *                 example: "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP"
 *               amount:
 *                 type: number
 *                 description: Amount in USDC (or equivalent)
 *                 example: 500
 *               currency:
 *                 type: string
 *                 default: "USDC"
 *                 example: "USDC"
 *               txHash:
 *                 type: string
 *                 description: Stellar transaction hash to verify on-chain
 *                 example: "abc123stellartxhash..."
 *               counterpartyWallet:
 *                 type: string
 *                 description: Wallet of the other party (used for anti-Sybil counterparty decay)
 *                 example: "GDEFGHIJK..."
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-17T10:00:00Z"
 *     responses:
 *       200:
 *         description: Event processed and score updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                       example: "evt_uuid"
 *                     scoreImpact:
 *                       type: number
 *                       example: 22
 *                     newScore:
 *                       type: number
 *                       example: 187
 *                     newTier:
 *                       type: string
 *                       example: "C"
 *                     verified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Transaction could not be verified on Stellar
 *       401:
 *         description: Invalid platform API key
 *       404:
 *         description: User not registered in ZCore
 *       409:
 *         description: Transaction already processed
 */
export const reportCreditEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body as CreditEventPayload;
    const dryRun =
      req.query.dryRun === "true" || req.headers["x-zcore-dry-run"] === "true";

    // 1. Validate platform API key
    const platform = await prisma.platform.findUnique({
      where: { apiKey: payload.apiKey },
    });
    if (!platform || !platform.active) {
      return res.status(401).json({
        success: false,
        error: "Invalid or inactive platform API key",
      });
    }

    // 2. Find user (must register first)
    const user = await prisma.user.findUnique({
      where: { walletAddress: payload.walletAddress },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found. The wallet must be registered in ZCore first.",
      });
    }

    // 3. Check txHash uniqueness — prevents double-counting the same payment
    const existing = await prisma.creditEvent.findUnique({
      where: { txHash: payload.txHash },
    });
    if (existing) {
      if (dryRun) {
        return res.status(200).json({
          success: true,
          data: {
            dryRun: true,
            wouldApply: false,
            reason: "Transaction already processed",
          },
        });
      }
      return res.status(409).json({
        success: false,
        error: "This transaction has already been processed",
      });
    }

    // 4. Verify txHash on Stellar Horizon
    const txVerification = await verifyTransaction(payload.txHash);
    if (!txVerification.valid || !txVerification.successful) {
      return res.status(400).json({
        success: false,
        error: "Transaction could not be verified on Stellar network",
        details: txVerification.error,
      });
    }

    // 5. Wallet age check (anti-Sybil)
    const { stellarData } = await calculateStellarBase(payload.walletAddress);
    if (stellarData.walletAge < MIN_WALLET_AGE_DAYS) {
      return recordZeroScoreEvent(
        user,
        platform,
        payload,
        "Event recorded but score not updated: wallet must be at least 30 days old",
        res,
        dryRun
      );
    }

    if (payload.counterpartyWallet) {
      const counterpartyData = await fetchStellarWalletData(
        payload.counterpartyWallet
      );
      if (counterpartyData.walletAge < MIN_WALLET_AGE_DAYS) {
        return recordZeroScoreEvent(
          user,
          platform,
          payload,
          "Event recorded but score not updated: counterparty wallet must be at least 30 days old",
          res,
          dryRun
        );
      }
    }

    // 6. Monthly scoring cap (anti-Sybil)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const eventsThisMonth = await prisma.creditEvent.count({
      where: {
        userId: user.id,
        scoreImpact: { gt: 0 },
        createdAt: { gte: startOfMonth },
      },
    });

    if (eventsThisMonth >= MONTHLY_SCORING_CAP) {
      return recordZeroScoreEvent(
        user,
        platform,
        payload,
        "Event recorded but score not updated: monthly scoring cap reached",
        res,
        dryRun
      );
    }

    // 7. Calculate counterparty decay (anti-Sybil)
    let decayFactor = 1.0;
    if (payload.counterpartyWallet) {
      const priorCount = await prisma.creditEvent.count({
        where: {
          userId: user.id,
          counterpartyWallet: payload.counterpartyWallet,
        },
      });
      decayFactor = applyCounterpartyDecay(priorCount + 1);
    }

    // 8. Calculate score impact
    const scoreImpact = calculateEventImpact(
      payload.eventType as CreditEventType,
      payload.amount,
      decayFactor
    );

    const newScore = Math.min(Math.max(user.score + scoreImpact, 0), 850);
    const newTier = assignProfileTier(newScore);

    if (dryRun) {
      return res.status(200).json({
        success: true,
        data: {
          dryRun: true,
          wouldApply: scoreImpact > 0,
          scoreImpact,
          projectedScore: newScore,
          projectedTier: newTier,
          verified: true,
        },
      });
    }

    // 9. Atomic write: create event + update user score
    const [creditEvent] = await prisma.$transaction([
      prisma.creditEvent.create({
        data: {
          userId: user.id,
          platformId: platform.id,
          eventType: payload.eventType,
          amount: payload.amount,
          currency: payload.currency ?? "USDC",
          txHash: payload.txHash,
          counterpartyWallet: payload.counterpartyWallet ?? null,
          scoreImpact,
          verifiedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { score: newScore, profileTier: newTier },
      }),
    ]);

    if (platform.webhookUrl && scoreImpact > 0) {
      const secret = platform.webhookSecret ?? platform.apiKey;
      void dispatchScoreUpdatedWebhook(platform.webhookUrl, secret, {
        event: "score_updated",
        walletAddress: payload.walletAddress,
        previousScore: user.score,
        newScore,
        profileTier: newTier,
        eventType: payload.eventType,
        txHash: payload.txHash,
        timestamp: new Date().toISOString(),
      }).catch(() => undefined);
    }

    return res.status(200).json({
      success: true,
      data: {
        eventId: creditEvent.id,
        scoreImpact,
        newScore,
        newTier,
        verified: true,
      },
    });
  } catch (error) {
    return next(error);
  }
};
