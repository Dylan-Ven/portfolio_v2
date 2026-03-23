/**
 * Pure utility helpers for the terminal command engine.
 * No React, no state, no side-effects.
 */

import { AVAILABLE_COMMANDS } from '../commandCatalog';

// ---------------------------------------------------------------------------
// UUID / identity
// ---------------------------------------------------------------------------

export const generateSecureUUID = (): string => {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return '00000000-0000-4000-8000-000000000000';
};

// ---------------------------------------------------------------------------
// Boot sequence
// ---------------------------------------------------------------------------

export const buildBootSequence = (): string[] => {
  const serverNumber = Math.floor(Math.random() * 25) + 1;
  const biosVersion = `RBIOS-4.02.08.${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`;
  const memorySize = [32, 64, 128, 256][Math.floor(Math.random() * 4)];
  const rootCode = Math.floor(Math.random() * 9000) + 1000;
  const serialCode = `52EE5.E${Math.floor(Math.random() * 9) + 1}.E${Math.floor(Math.random() * 9) + 1}`;
  const fakeUUID = generateSecureUUID();

  return [
    'NST.v2 // NiSuTe SYSTEMS ARCHITECTURE',
    `[NODE: ${serverNumber}]`,
    `>UUID: ${fakeUUID}`,
    'PROPERTY OF NISUTE EUROPE MEDIA LABS // EST. 199X',
    '',
    '> QUERY CONSOLE /SYNC',
    '',
    'NST-M800 "LENSMASTER"',
    '',
    '> GRANT PERM /LEVEL:ROOT /USER:ADMIN',
    'Logic-Gate: OPEN. [RWED] privileges assigned to ADMIN.',
    '',
    '> ABORT RECOVERY /STATE:HOLD',
    'Automatic reboot cicles: SUSPENDED. System in static state. Awaiting further instructions.',
    '',
    'NIS-TECH FIRMWARE (c) 2201-2203',
    `CORE-BUILD: ${biosVersion} // UNIT: ${serialCode}`,
    `UPPER-STACK: ${memorySize} GB`,
    `IDENT: ${rootCode}`,
    'STATUS: [MAINTENANCE OVERRIDE ACTIVE]',
    '!! NOTICE: DIRECT DATA-STREAM ACCESS ACTIVE. PARITY CHECKS DISABLED. !!',
    '',
    '> LAUNCH TRACE /MAP:ACCOUNTS.F',
    'Scrubbing Bit-Map...',
    'Injecting Override...',
    'Console Ready.',
  ];
};

// ---------------------------------------------------------------------------
// String / slug helpers
// ---------------------------------------------------------------------------

export const createProjectSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const formatTreeBranch = (items: string[], prefix: string): string[] => {
  if (!items.length) {
    return [`${prefix}└── (empty)/`];
  }
  return items.map(
    (item, index) =>
      `${prefix}${index === items.length - 1 ? '└──' : '├──'} ${item}/`,
  );
};

// ---------------------------------------------------------------------------
// Levenshtein / command suggestion
// ---------------------------------------------------------------------------

export const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1,      // insertion
          dp[i - 1][j - 1] + 1,  // substitution
        );
      }
    }
  }

  return dp[m][n];
};

export const findSimilarCommand = (input: string): string | null => {
  let minDistance = Infinity;
  let closestCommand: string | null = null;

  for (const cmd of AVAILABLE_COMMANDS) {
    const distance = levenshteinDistance(input.toLowerCase(), cmd.toLowerCase());
    if (distance < minDistance && distance <= 2) {
      minDistance = distance;
      closestCommand = cmd;
    }
  }

  return closestCommand;
};
