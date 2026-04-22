import {
  DCAVault,
  microToSTX,
  satsToBTC,
  type VaultPreset,
  type DCAStats,
} from "@stacksport/dca-sdk";

type Mode = "run" | "dry-run";

interface Config {
  mode: Mode;
  pollIntervalMs: number;
  telegramBotToken: string | null;
  telegramChatId: string | null;
  hiroApiUrl: string;
}

function loadConfig(mode: Mode): Config {
  const pollSec = Number(process.env.POLL_INTERVAL_SEC ?? 120);
  if (!Number.isFinite(pollSec) || pollSec < 30) {
    throw new Error("POLL_INTERVAL_SEC must be >= 30 (Hiro rate limits)");
  }

  const token = process.env.TELEGRAM_BOT_TOKEN ?? null;
  const chatId = process.env.TELEGRAM_CHAT_ID ?? null;

  if (mode === "run" && (!token || !chatId)) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required. Use dry-run to test without them."
    );
  }

  return {
    mode,
    pollIntervalMs: pollSec * 1000,
    telegramBotToken: token,
    telegramChatId: chatId,
    hiroApiUrl: process.env.HIRO_API_URL ?? "https://api.hiro.so",
  };
}

function formatVolume(amount: number, preset: VaultPreset): string {
  return preset === "stx-to-sbtc"
    ? `${microToSTX(amount).toFixed(2)} STX`
    : `${satsToBTC(amount).toFixed(6)} sBTC`;
}

function renderMessage(preset: VaultPreset, prev: DCAStats, next: DCAStats): string {
  const delta = next.totalExecuted - prev.totalExecuted;
  const volumeDelta = next.totalVolume - prev.totalVolume;
  return [
    `🔔 *${preset}*`,
    `${delta} new execution${delta === 1 ? "" : "s"}`,
    `Volume delta: ${formatVolume(volumeDelta, preset)}`,
    `Total executed: ${next.totalExecuted} (${next.totalPlans} plans)`,
  ].join("\n");
}

async function sendTelegram(cfg: Config, text: string): Promise<void> {
  if (cfg.mode === "dry-run") {
    console.log("[dry-run] Would send:\n" + text + "\n");
    return;
  }
  const url = `https://api.telegram.org/bot${cfg.telegramBotToken}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: cfg.telegramChatId,
      parse_mode: "Markdown",
      text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API ${res.status}: ${body}`);
  }
}

async function pollOnce(
  vault: DCAVault,
  preset: VaultPreset,
  prev: DCAStats | null,
  cfg: Config
): Promise<DCAStats> {
  const next = await vault.getStats();
  if (prev && next.totalExecuted > prev.totalExecuted) {
    await sendTelegram(cfg, renderMessage(preset, prev, next));
  } else if (cfg.mode === "dry-run") {
    console.log(
      `[${preset}] no delta (executed=${next.totalExecuted}, plans=${next.totalPlans})`
    );
  }
  return next;
}

async function main(): Promise<void> {
  const mode: Mode = process.argv[2] === "dry-run" ? "dry-run" : "run";
  const cfg = loadConfig(mode);

  const stxVault = new DCAVault("stx-to-sbtc", { apiUrl: cfg.hiroApiUrl });
  const sbtcVault = new DCAVault("sbtc-to-usdcx", { apiUrl: cfg.hiroApiUrl });

  console.log(
    `Starting in ${mode} mode, polling every ${cfg.pollIntervalMs / 1000}s`
  );

  let stxPrev: DCAStats | null = null;
  let sbtcPrev: DCAStats | null = null;

  // In dry-run we poll exactly twice (with a small delay) so CI can assert
  // the code path runs without hanging. In run mode we loop forever.
  const iterations = mode === "dry-run" ? 2 : Infinity;
  const intervalMs = mode === "dry-run" ? 1000 : cfg.pollIntervalMs;

  for (let i = 0; i < iterations; i++) {
    try {
      stxPrev = await pollOnce(stxVault, "stx-to-sbtc", stxPrev, cfg);
      sbtcPrev = await pollOnce(sbtcVault, "sbtc-to-usdcx", sbtcPrev, cfg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Poll failed: ${msg}`);
      if (mode === "dry-run") throw err;
    }
    if (i + 1 < iterations) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
