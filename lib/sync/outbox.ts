import { getDb } from "@/lib/db/client";
import type { SyncEntityType, SyncOperation } from "@/lib/db/types";
import { nowIso } from "@/lib/utils/date";

export async function enqueue(
  entityType: SyncEntityType,
  entityId: string,
  operation: SyncOperation,
  payload: object | null
): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    entityType,
    entityId,
    operation,
    payload ? JSON.stringify(payload) : null,
    nowIso()
  );
}
