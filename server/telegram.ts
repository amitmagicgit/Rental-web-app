// ───────────────────────────────────────────────────────────────
// src/routes/telegram.ts  (full file after patch)
// ───────────────────────────────────────────────────────────────
import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { storage } from "./storage";
import { sendTelegramMessage } from "./utils/telegram";

const BTN_FILTERS = "🎛️ הגדר פילטרים";
const BTN_STOP = "🚫 הפסק שליחת הודעות";
const BTN_RESUME = "▶️ חידוש שליחת שליחה";

export function setupTelegramRoutes(app: Express) {
  app.post("/api/telegram/webhook", async (req: Request, res: Response) => {
    try {
      const update = req.body;

      /* ───── handle text (commands OR reply-keyboard presses) ───── */
      if (update.message) {
        const chatId = update.message.chat.id as number;
        const text = (update.message.text ?? "").trim();
        await dispatchCommand(chatId, text);
      }

      /* no callback_query section anymore */

      res.sendStatus(200);
    } catch (err) {
      console.error("Telegram webhook error:", err);
      res.sendStatus(200);
    }
  });
}

/* ─────────────────────────────────────────────────────────── */

async function dispatchCommand(chatId: number, text: string) {
  const cmd = text.split(" ")[0].toLowerCase();

  if (text === BTN_FILTERS || cmd === "/filters") return handleFilters(chatId);
  if (text === BTN_STOP || cmd === "/stop") return handleStop(chatId);
  if (text === BTN_RESUME || cmd === "/resume") return handleResume(chatId);

  switch (cmd) {
    case "/start":
      return handleStart(chatId);
    default:
      return sendTelegramMessage(
        chatId,
        "לא הבנתי… השתמש בכפתורים או ב-/filters /stop /resume",
      );
  }
}

/* ───────── /start (also sets keyboard) ───────── */
async function handleStart(chatId: number) {
  await storage.setTelegramSubscriptionActive(chatId, true);

  const token = generateRandomToken();
  const link = `${process.env.APP_URL}/dashboard/private-subscription?chat_id=${chatId}&token=${token}`;

  await sendTelegramMessage(chatId, "ברוכים הבאים! בחרו פעולה:", {
    reply_markup: userMenu(),
  });

  // Send the filters link separately (keeps menu visible)
  await sendTelegramMessage(chatId, `להגדרת פילטרים:\n${link}`);
}

/* ───────── stop / resume / filters ───────── */
async function handleStop(chatId: number) {
  await storage.setTelegramSubscriptionActive(chatId, false);
  await sendTelegramMessage(chatId, "✅ נעצר. לחידוש, לחץ - חידוש שליחה");
}

async function handleResume(chatId: number) {
  await storage.setTelegramSubscriptionActive(chatId, true);
  await sendTelegramMessage(chatId, "🚀 חזרנו לשלוח מודעות!", {
    reply_markup: userMenu(),
  });
}

async function handleFilters(chatId: number) {
  const token = generateRandomToken();
  const link = `${process.env.APP_URL}/dashboard/private-subscription?chat_id=${chatId}&token=${token}`;
  await sendTelegramMessage(chatId, `כאן משנים פילטרים:\n${link}`);
}

/* ───────── helpers ───────── */
function generateRandomToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

function userMenu() {
  return {
    keyboard: [
      [{ text: BTN_FILTERS }],
      [{ text: BTN_STOP }, { text: BTN_RESUME }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}
