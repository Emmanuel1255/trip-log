import * as SQLite from "expo-sqlite";
import { CREATE_TABLES_SQL, MIGRATE_V1_TO_V2_SQL, SCHEMA_VERSION } from "./schema";

// Stored on globalThis (not plain module scope) so the native connection survives
// Fast Refresh reloading this module — otherwise a stale in-flight query can hit a
// released connection and throw "Cannot use shared object that was already released".
declare global {
  var __triplogDb: SQLite.SQLiteDatabase | undefined;
}

export function getDb(): SQLite.SQLiteDatabase {
  if (!globalThis.__triplogDb) {
    globalThis.__triplogDb = SQLite.openDatabaseSync("triplog.db");
  }
  return globalThis.__triplogDb;
}

export async function initDb(): Promise<void> {
  const db = getDb();
  await db.execAsync("PRAGMA foreign_keys = ON;");

  const { user_version: currentVersion } = (await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version;"))!;

  if (currentVersion === 0) {
    await db.execAsync(CREATE_TABLES_SQL);
  } else if (currentVersion === 1) {
    await db.execAsync(MIGRATE_V1_TO_V2_SQL);
  }

  if (currentVersion < SCHEMA_VERSION) {
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }
}
