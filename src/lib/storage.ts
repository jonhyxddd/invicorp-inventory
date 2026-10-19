import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "invicorp-offline";
const DB_VERSION = 1;
const STORE_QUEUE = "offline_queue";
const STORE_CACHE = "offline_cache";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
          db.createObjectStore(STORE_QUEUE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_CACHE)) {
          db.createObjectStore(STORE_CACHE, { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

export const offlineDb = {
  async queueAdd(item: { id: string; type: string; payload: unknown; timestamp: string; retries: number }) {
    const db = await getDB();
    await db.put(STORE_QUEUE, item);
  },

  async queueGetAll() {
    const db = await getDB();
    return db.getAll(STORE_QUEUE);
  },

  async queueDelete(id: string) {
    const db = await getDB();
    await db.delete(STORE_QUEUE, id);
  },

  async queueClear() {
    const db = await getDB();
    await db.clear(STORE_QUEUE);
  },

  async cacheSet(key: string, value: unknown, ttlMs = 5 * 60 * 1000) {
    const db = await getDB();
    await db.put(STORE_CACHE, { key, value, expiresAt: Date.now() + ttlMs });
  },

  async cacheGet(key: string) {
    const db = await getDB();
    const entry = await db.get(STORE_CACHE, key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      await db.delete(STORE_CACHE, key);
      return null;
    }
    return entry.value;
  },

  async cacheDelete(key: string) {
    const db = await getDB();
    await db.delete(STORE_CACHE, key);
  },
};

export type OfflineQueueItem = {
  id: string;
  type: string;
  payload: unknown;
  timestamp: string;
  retries: number;
};
