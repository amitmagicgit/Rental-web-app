// ───────────────────────────────────────────────────────────────
// src/utils/telegram.ts
// ───────────────────────────────────────────────────────────────
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  opts: {
    parse_mode?: "Markdown" | "HTML";
    disable_web_page_preview?: boolean;
  } = {},
) {
  const botToken =
    process.env.NODE_ENV === "production"
      ? process.env.TELEGRAM_BOT_TOKEN // prod token
      : process.env.TELEGRAM_BOT_TOKEN_DEV || // dev token (fallback →)
        process.env.TELEGRAM_BOT_TOKEN; //  … to prod if missing

  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const body = {
    chat_id: chatId,
    text,
    ...opts,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Telegram send failed:", errText);
    throw new Error(`Telegram API error: ${res.status}`);
  }

  return res.json(); // useful if caller needs message_id, etc.
}
