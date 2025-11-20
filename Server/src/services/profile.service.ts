import { prisma } from "../config/database";
import { LenderProfile } from "../types";

export const getUserProfile = async (walletAddress: string) => {
  return prisma.user.findUnique({
    where: { walletAddress },
    select: {
      walletAddress: true,
      profileTier: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const evaluateEligibility = (
  score: number,
  profiles: LenderProfile[],
  requestedAmount: number
) => {
  const sortedProfiles = [...profiles].sort((a, b) => b.minScore - a.minScore);

  for (const profile of sortedProfiles) {
    if (score >= profile.minScore) {
      return {
        profileAssigned: profile.tier,
        maxAmount: profile.maxAmount,
        eligible: requestedAmount <= profile.maxAmount,
      };
    }
  }

  return {
    profileAssigned: "C",
    maxAmount: 0,
    eligible: false,
  };
};
