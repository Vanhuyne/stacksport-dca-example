import { test } from "node:test";
import assert from "node:assert/strict";
import { DCAVault } from "@stacksport/dca-sdk";

const HIRO = process.env.HIRO_API_URL ?? "https://api.hiro.so";

test("getStats() returns live data from stx-to-sbtc vault", async () => {
  const vault = new DCAVault("stx-to-sbtc", { apiUrl: HIRO });
  const stats = await vault.getStats();
  assert.equal(typeof stats.totalPlans, "number");
  assert.equal(typeof stats.totalExecuted, "number");
  assert.equal(typeof stats.totalVolume, "number");
  assert.ok(stats.totalPlans >= 0);
});

test("getStats() returns live data from sbtc-to-usdcx vault", async () => {
  const vault = new DCAVault("sbtc-to-usdcx", { apiUrl: HIRO });
  const stats = await vault.getStats();
  assert.equal(typeof stats.totalPlans, "number");
  assert.ok(stats.totalPlans >= 0);
});

test("getPlan() for non-existent ID returns null", async () => {
  const vault = new DCAVault("stx-to-sbtc", { apiUrl: HIRO });
  const plan = await vault.getPlan(999_999_999);
  assert.equal(plan, null);
});
