import { prisma } from "../config/database";
import { PaymentReport } from "../types";
import { updateScoreFromPayment } from "./scoring.service";

export const recordPayment = async (payload: PaymentReport) => {
  const lender = await prisma.lender.findUnique({
    where: { apiKey: payload.apiKey },
  });
  if (!lender) {
    throw new Error("Lender not found");
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: payload.walletAddress },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      lenderId: lender.id,
      requestId: payload.requestId,
      amount: payload.amount,
      status: payload.status,
      paymentDate: new Date(payload.paymentDate),
    },
  });

  const { score, profileTier } = updateScoreFromPayment(
    user.score,
    payload.status
  );

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { score, profileTier },
  });

  return {
    payment,
    user: updatedUser,
  };
};
