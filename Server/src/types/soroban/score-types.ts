export enum ZCoreTierCode {
  REJECTED = 0,
  C = 1,
  B = 2,
  A = 3,
}

export interface ZCoreScoreRecord {
  score: number;
  tier: ZCoreTierCode;
  updatedAt: number;
  validUntil?: number;
}

export const TIER_LABEL_TO_CODE: Record<string, ZCoreTierCode> = {
  REJECTED: ZCoreTierCode.REJECTED,
  C: ZCoreTierCode.C,
  B: ZCoreTierCode.B,
  A: ZCoreTierCode.A,
};

export const TIER_CODE_TO_LABEL: Record<ZCoreTierCode, string> = {
  [ZCoreTierCode.REJECTED]: "REJECTED",
  [ZCoreTierCode.C]: "C",
  [ZCoreTierCode.B]: "B",
  [ZCoreTierCode.A]: "A",
};

export const ZCORE_INTERFACE_VERSION = 1;

export function tierLabelToCode(label: string): ZCoreTierCode {
  return TIER_LABEL_TO_CODE[label] ?? ZCoreTierCode.REJECTED;
}

export function tierCodeToLabel(code: number): string {
  return TIER_CODE_TO_LABEL[code as ZCoreTierCode] ?? "REJECTED";
}

export function isAttested(record: ZCoreScoreRecord): boolean {
  return record.updatedAt > 0 && record.score > 0;
}

export function isScoreFresh(
  record: ZCoreScoreRecord,
  nowSeconds: number,
  maxAgeSeconds: number
): boolean {
  if (record.updatedAt === 0) return false;
  if (record.validUntil && record.validUntil > 0) {
    return nowSeconds <= record.validUntil;
  }
  return nowSeconds - record.updatedAt <= maxAgeSeconds;
}
