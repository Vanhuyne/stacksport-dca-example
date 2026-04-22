#!/usr/bin/env node
import {
  DCAVault,
  blocksToLabel,
  microToSTX,
  satsToBTC,
  type VaultPreset,
  type DCAPlan,
} from "@stacksport/dca-sdk";

type Command = "stats" | "can-execute" | "plan" | "user" | "help";

const HELP = `
stacksport-dca — inspect StacksPort DCA vaults (read-only)

Usage:
  stacksport-dca stats [vault]
  stacksport-dca can-execute <plan-id> [vault]
  stacksport-dca plan <plan-id> [vault]
  stacksport-dca user <address> [vault]

Vaults:
  stx-to-sbtc     (default) — DCA from STX into sBTC
  sbtc-to-usdcx              — DCA from sBTC into USDCx

Examples:
  stacksport-dca stats
  stacksport-dca stats sbtc-to-usdcx
  stacksport-dca can-execute 42
  stacksport-dca plan 42 stx-to-sbtc
  stacksport-dca user SP2CMK69QNY60HBG8BJ4X5TD7XX2ZT4XB62V13SV
`.trim();

function parseVault(input: string | undefined): VaultPreset {
  if (!input || input === "stx-to-sbtc") return "stx-to-sbtc";
  if (input === "sbtc-to-usdcx") return "sbtc-to-usdcx";
  throw new Error(`Unknown vault: ${input}. Use "stx-to-sbtc" or "sbtc-to-usdcx".`);
}

function formatAmount(amount: number, vault: VaultPreset): string {
  return vault === "stx-to-sbtc"
    ? `${microToSTX(amount).toFixed(6)} STX`
    : `${satsToBTC(amount).toFixed(8)} sBTC`;
}

function printPlan(plan: DCAPlan, vault: VaultPreset): void {
  console.log(`Plan #${plan.id}`);
  console.log(`  Owner:         ${plan.owner}`);
  console.log(`  Active:        ${plan.active}`);
  console.log(`  Per swap:      ${formatAmount(plan.amountPerSwap, vault)}`);
  console.log(`  Interval:      ${blocksToLabel(plan.intervalBlocks)} (${plan.intervalBlocks} blocks)`);
  console.log(`  Balance:       ${formatAmount(plan.balance, vault)}`);
  console.log(`  Total swaps:   ${plan.totalSwaps}`);
  console.log(`  Total spent:   ${formatAmount(plan.totalSpent, vault)}`);
  console.log(`  Last executed: block ${plan.lastExecutedBlock}`);
  console.log(`  Created at:    block ${plan.createdAtBlock}`);
}

async function cmdStats(vault: DCAVault, preset: VaultPreset): Promise<void> {
  const stats = await vault.getStats();
  console.log(`Vault: ${preset}`);
  console.log(`  Total plans:    ${stats.totalPlans}`);
  console.log(`  Total executed: ${stats.totalExecuted}`);
  console.log(`  Total volume:   ${formatAmount(stats.totalVolume, preset)}`);
}

async function cmdCanExecute(vault: DCAVault, planId: number): Promise<void> {
  const canExec = await vault.canExecute(planId);
  const nextBlock = await vault.getNextExecutionBlock(planId);
  console.log(`Plan #${planId}`);
  console.log(`  Can execute now: ${canExec}`);
  console.log(`  Next exec block: ${nextBlock ?? "(plan inactive or missing)"}`);
}

async function cmdPlan(vault: DCAVault, planId: number, preset: VaultPreset): Promise<void> {
  const plan = await vault.getPlan(planId);
  if (!plan) {
    console.log(`Plan #${planId} not found.`);
    return;
  }
  printPlan(plan, preset);
}

async function cmdUser(vault: DCAVault, address: string, preset: VaultPreset): Promise<void> {
  const plans = await vault.getUserPlans(address);
  if (plans.length === 0) {
    console.log(`No plans found for ${address} in vault ${preset}.`);
    return;
  }
  console.log(`${plans.length} plan(s) for ${address} in ${preset}:\n`);
  for (const plan of plans) {
    printPlan(plan, preset);
    console.log();
  }
}

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);
  const command = (cmd ?? "help") as Command;

  if (command === "help" || command === undefined) {
    console.log(HELP);
    return;
  }

  try {
    if (command === "stats") {
      const preset = parseVault(rest[0]);
      await cmdStats(new DCAVault(preset), preset);
      return;
    }

    if (command === "can-execute") {
      const planId = Number(rest[0]);
      if (!Number.isInteger(planId) || planId < 1) {
        throw new Error("plan-id must be a positive integer");
      }
      const preset = parseVault(rest[1]);
      await cmdCanExecute(new DCAVault(preset), planId);
      return;
    }

    if (command === "plan") {
      const planId = Number(rest[0]);
      if (!Number.isInteger(planId) || planId < 1) {
        throw new Error("plan-id must be a positive integer");
      }
      const preset = parseVault(rest[1]);
      await cmdPlan(new DCAVault(preset), planId, preset);
      return;
    }

    if (command === "user") {
      const address = rest[0];
      if (!address || !address.startsWith("SP")) {
        throw new Error("address must be a mainnet STX address (starts with SP)");
      }
      const preset = parseVault(rest[1]);
      await cmdUser(new DCAVault(preset), address, preset);
      return;
    }

    console.error(`Unknown command: ${command}\n`);
    console.log(HELP);
    process.exit(1);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${msg}`);
    process.exit(1);
  }
}

main();
