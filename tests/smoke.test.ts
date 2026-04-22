import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DCAVault,
  Intervals,
  VAULT_PRESETS,
  blocksToLabel,
  microToSTX,
  satsToBTC,
} from "@stacksport/dca-sdk";

test("SDK exports the expected API surface", () => {
  assert.equal(typeof DCAVault, "function");
  assert.equal(typeof blocksToLabel, "function");
  assert.equal(typeof microToSTX, "function");
  assert.equal(typeof satsToBTC, "function");
  assert.ok(VAULT_PRESETS, "VAULT_PRESETS should be exported");
});

test("Intervals match the deployed contract (v0.1.1)", () => {
  assert.equal(Intervals.Daily, 650);
  assert.equal(Intervals.Weekly, 4550);
  assert.equal(Intervals.Monthly, 19500);
});

test("blocksToLabel maps current and v2 intervals", () => {
  assert.equal(blocksToLabel(650), "Daily");
  assert.equal(blocksToLabel(4550), "Weekly");
  assert.equal(blocksToLabel(19500), "Monthly");
  assert.equal(blocksToLabel(1300), "Daily (v2)");
  assert.equal(blocksToLabel(9100), "Weekly (v2)");
  assert.equal(blocksToLabel(39000), "Monthly (v2)");
});

test("DCAVault constructor accepts both presets", () => {
  const stx = new DCAVault("stx-to-sbtc");
  const sbtc = new DCAVault("sbtc-to-usdcx");
  assert.ok(stx.contractName);
  assert.ok(sbtc.contractName);
  assert.notEqual(stx.contractName, sbtc.contractName);
});

test("Unit conversions round-trip", () => {
  assert.equal(microToSTX(1_000_000), 1);
  assert.equal(satsToBTC(100_000_000), 1);
});
