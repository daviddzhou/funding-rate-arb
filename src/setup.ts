require("dotenv").config();

import {
  getClientFromEnv,
  MarginfiAccount,
  uiToNative,
} from "@mrgnlabs/marginfi-client";
import {
  PublicKey,
} from "@solana/web3.js";
import { POSITION_SIZE_USD, ZO_MARKET } from "./bot";

/**
 * Sample setup for a brand new account
 */

(async function () {
  console.log("Setting up funding rate arb bot for SOL");

  // Get marginfi account from .env config.
  const mfiClient = await getClientFromEnv();
  const mfiAccount = await mfiClient.getMarginfiAccount(
    new PublicKey(process.env.MARGINFI_ACCOUNT!)
  );

  await mfiAccount.deposit(uiToNative(POSITION_SIZE_USD))

  // Setup UTPs.
  await setupZo(mfiAccount);
  await setupMango(mfiAccount);
})()

async function setupZo(mfiAccount: MarginfiAccount) {
  const zo = mfiAccount.zo
  if (!zo.isActive) {
    await zo.activate();
  }

  const zoMargin = await zo.getZoMargin();
  const oo = await zoMargin.getOpenOrdersInfoBySymbol(ZO_MARKET);
  if (!oo) {
    await zo.createPerpOpenOrders(ZO_MARKET);
  }

  await zo.deposit(uiToNative(POSITION_SIZE_USD / 2, 6))
}

async function setupMango(mfiAccount: MarginfiAccount) {
  const mango = mfiAccount.mango

  if (!mango.isActive) {
    await mango.activate();
  }

  await mango.deposit(uiToNative(POSITION_SIZE_USD / 2, 6))
}