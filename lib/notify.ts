import "server-only";

// Optional Telegram alert for public reports. Create a bot with @BotFather,
// add it to your volunteers group, and set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.
export async function notify(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.error("telegram notify failed", e);
  }
}
