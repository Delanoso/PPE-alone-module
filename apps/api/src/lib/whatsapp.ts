import twilio from "twilio";
import { env } from "../config/env.js";

type SendWhatsAppInput = {
  to: string;
  body: string;
};

type SendWhatsAppOutput = {
  sent: boolean;
  providerMessageId?: string;
  status: "queued" | "sent" | "failed";
  errorMessage?: string;
};

function normalizePhone(value: string): string {
  const cleaned = value.replace(/\s+/g, "").replace(/[()-]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  return `+${cleaned}`;
}

function isConfigured() {
  return Boolean(env.WHATSAPP_ACCOUNT_SID && env.WHATSAPP_AUTH_TOKEN && env.WHATSAPP_FROM_NUMBER);
}

export async function sendWhatsAppMessage(input: SendWhatsAppInput): Promise<SendWhatsAppOutput> {
  if (!isConfigured()) {
    return {
      sent: false,
      status: "queued",
      errorMessage: "WhatsApp credentials not configured",
    };
  }

  try {
    const client = twilio(env.WHATSAPP_ACCOUNT_SID, env.WHATSAPP_AUTH_TOKEN);
    const message = await client.messages.create({
      from: `whatsapp:${normalizePhone(env.WHATSAPP_FROM_NUMBER!)}`,
      to: `whatsapp:${normalizePhone(input.to)}`,
      body: input.body,
    });

    return {
      sent: true,
      providerMessageId: message.sid,
      status: message.status === "failed" || message.status === "undelivered" ? "failed" : "sent",
      errorMessage: message.errorMessage ?? undefined,
    };
  } catch (error) {
    return {
      sent: false,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown WhatsApp error",
    };
  }
}
