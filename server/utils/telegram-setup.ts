export async function ensureBotCommands() {
  const botToken =
    process.env.NODE_ENV === "production"
      ? process.env.TELEGRAM_BOT_TOKEN // prod token
      : process.env.TELEGRAM_BOT_TOKEN_DEV || // dev token (fallback →)
        process.env.TELEGRAM_BOT_TOKEN; //  … to prod if missing

  if (!botToken) return;

  await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "start", description: "התחל / הצג תפריט" },
        { command: "filters", description: "הגדר או עדכן פילטרים" },
        { command: "stop", description: "הפסק לקבל מודעות" },
        { command: "resume", description: "חידוש קבלת מודעות" },
      ],
    }),
  });
}
