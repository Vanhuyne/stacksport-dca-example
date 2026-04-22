import {
  DCAVault,
  microToSTX,
  satsToBTC,
  type DCAStats,
  type VaultPreset,
} from "@stacksport/dca-sdk";

// Revalidate the page every 60s so visitors see fresh stats without
// each request triggering a fresh Hiro call.
export const revalidate = 60;

interface VaultCard {
  preset: VaultPreset;
  title: string;
  subtitle: string;
  stats: DCAStats;
  unit: "STX" | "sBTC";
}

async function loadVault(preset: VaultPreset): Promise<DCAStats> {
  const vault = new DCAVault(preset);
  return vault.getStats();
}

function formatVolume(amount: number, unit: "STX" | "sBTC"): string {
  const value = unit === "STX" ? microToSTX(amount) : satsToBTC(amount);
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: unit === "sBTC" ? 6 : 2,
    maximumFractionDigits: unit === "sBTC" ? 8 : 2,
  })} ${unit}`;
}

export default async function Page() {
  const [stxStats, sbtcStats] = await Promise.all([
    loadVault("stx-to-sbtc"),
    loadVault("sbtc-to-usdcx"),
  ]);

  const cards: VaultCard[] = [
    {
      preset: "stx-to-sbtc",
      title: "STX → sBTC",
      subtitle: "Stack STX, earn sBTC",
      stats: stxStats,
      unit: "STX",
    },
    {
      preset: "sbtc-to-usdcx",
      title: "sBTC → USDCx",
      subtitle: "Realize sBTC gains into stablecoin",
      stats: sbtcStats,
      unit: "sBTC",
    },
  ];

  return (
    <main>
      <header>
        <h1>StacksPort DCA</h1>
        <p>
          Live mainnet stats from{" "}
          <a href="https://www.npmjs.com/package/@stacksport/dca-sdk">
            @stacksport/dca-sdk
          </a>
          . Refreshes every 60 seconds.
        </p>
      </header>

      <section className="grid">
        {cards.map((card) => (
          <article key={card.preset} className="card">
            <h2>{card.title}</h2>
            <p className="muted">{card.subtitle}</p>
            <dl>
              <div>
                <dt>Plans</dt>
                <dd>{card.stats.totalPlans.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Executed swaps</dt>
                <dd>{card.stats.totalExecuted.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Total volume</dt>
                <dd>{formatVolume(card.stats.totalVolume, card.unit)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <footer>
        <p>
          Built with Next.js 15 + React Server Components.{" "}
          <a href="https://github.com/Vanhuyne/stacksport-dca-example">
            View source
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
