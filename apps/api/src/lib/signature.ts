import crypto from "node:crypto";

export function generateRawToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function buildIssueNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const random = crypto.randomInt(1000, 9999);
  return `ISS-${year}${month}-${random}`;
}
