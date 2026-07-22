import * as SQLite from "expo-sqlite";
import { CREATE_TABLES_SQL, SCHEMA_VERSION } from "./schema";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync("triplog.db");
  }
  return dbInstance;
}

export async function initDb(): Promise<void> {
  const db = getDb();
  await db.execAsync("PRAGMA foreign_keys = ON;");

  const { user_version: currentVersion } = (await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version;"))!;

  if (currentVersion < SCHEMA_VERSION) {
    await db.execAsync(CREATE_TABLES_SQL);
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }
}
