// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
export interface KristAddress {
  address: string;

  balance: number;
  totalin?: number;
  totalout?: number;

  firstseen: string;
}

export type KristTransactionType = "unknown" | "mined" | "name_purchase"
  | "name_a_record" | "name_transfer" | "transfer";
export interface KristTransaction {
  id: number;
  from: string | null;
  to: string;
  value: number;
  time: string;
  name?: string;
  metadata?: string;
  sent_name?: string;
  sent_metaname?: string;
  type: KristTransactionType;
}

export interface KristBlock {
  height: number;
  address: string;
  hash?: string | null;
  short_hash?: string | null;
  value: number;
  difficulty: number;
  time: string;
}

export interface KristName {
  name: string;
  owner: string;
  original_owner?: string;
  registered: string;
  updated?: string | null;
  a?: string | null;
  unpaid: number;
}

export interface KristWorkDetailed {
  work: number;
  unpaid: number;

  base_value: number;
  block_value: number;

  decrease: {
    value: number;
    blocks: number;
    reset: number;
  };
}

export interface KristConstants {
  wallet_version: number;
  nonce_max_size: number;
  name_cost: number;
  min_work: number;
  max_work: number;
  work_factor: number;
  seconds_per_block: number;
}
export const DEFAULT_CONSTANTS: KristConstants = {
  wallet_version: 16,
  nonce_max_size: 24,
  name_cost: 500,
  min_work: 100,
  max_work: 100000,
  work_factor: 0.025,
  seconds_per_block: 60
};

export interface KristCurrency {
  address_prefix: string;
  name_suffix: string;
  currency_name: string;
  currency_symbol: string;
}
export const DEFAULT_CURRENCY: KristCurrency = {
  address_prefix: "k", name_suffix: "kst",
  currency_name: "Krist", currency_symbol: "KST"
};

export interface KristMOTDBase {
  motd: string;
  motdSet: Date;

  miningEnabled: boolean;
  debugMode: boolean;
}
export const DEFAULT_MOTD_BASE: KristMOTDBase = {
  motd: "",
  motdSet: new Date(),
  miningEnabled: true,
  debugMode: false
};

export interface KristMOTD {
  motd: string;
  motd_set: string;

  public_url: string;
  mining_enabled: boolean;
  debug_mode: boolean;

  last_block?: KristBlock;
  package: KristMOTDPackage;
  constants: KristConstants;
  currency: KristCurrency;
}

export interface KristMOTDPackage {
  name: string;
  version: string;
  author: string;
  licence: string;
  repository: string;
}

export const DEFAULT_PACKAGE = {
  "name": "krist",
  "version": "0.0.0",
  "author": "Lemmmy",
  "licence": "GPL-3.0",
  "repository": "https://github.com/tmpim/Krist"
};

export type APIResponse<T extends Record<string, any>> = T & {
  ok: boolean;
  error?: string;
  parameter?: string;
}

export type WSConnectionState = "connected" | "disconnected" | "connecting";
export type WSSubscriptionLevel = "blocks" | "ownBlocks" | "transactions" | "ownTransactions" | "names" | "ownNames" | "motd";
export type WSEvent = "block" | "transaction" | "name" | "motd";
export interface WSIncomingMessage {
  id?: number;
  ok?: boolean;
  error?: string;
  type?: "keepalive" | "hello" | "event";

  event?: WSEvent;

  [key: string]: any;
}
