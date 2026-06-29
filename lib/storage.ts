'use client';

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

type Envelope = {
  value: string;
  updatedAt: number;
};

type PendingSync = {
  id?: number;
  key: string;
  op: 'set' | 'delete';
  envelope?: Envelope;
  updatedAt: number;
};

interface StorageDB extends DBSchema {
  items: {
    key: string;
    value: Envelope;
  };
  pendingSync: {
    key: number;
    value: PendingSync;
    indexes: { 'by-updatedAt': number };
  };
}

export const STORAGE_CHANGE_EVENT = 'cut-tracker:storage-change';

const DB_NAME = 'redis-red-blanket';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<StorageDB>> | null = null;
let syncSetupDone = false;
let syncInFlight: Promise<void> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<StorageDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        database.createObjectStore('items');
        const queue = database.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        queue.createIndex('by-updatedAt', 'updatedAt');
      },
    });
  }

  return dbPromise;
}

function notifyChange() {
  window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
}

async function readLocal(key: string) {
  const db = await getDB();
  return (await db.get('items', key)) ?? null;
}

async function writeLocal(key: string, envelope: Envelope) {
  const db = await getDB();
  await db.put('items', envelope, key);
  notifyChange();
}

async function deleteLocal(key: string) {
  const db = await getDB();
  await db.delete('items', key);
  notifyChange();
}

async function queueMutation(entry: Omit<PendingSync, 'id'>) {
  const db = await getDB();
  await db.add('pendingSync', entry);
}

async function fetchRemote(key: string) {
  const response = await fetch(`/api/kv/${encodeURIComponent(key)}`, { cache: 'no-store' });
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
    return null;
  }

  return (await response.json()) as Envelope;
}

async function syncSet(key: string, envelope: Envelope) {
  const response = await fetch(`/api/kv/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(envelope),
  });

  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Failed to sync set mutation');
  }
}

async function syncDelete(key: string) {
  const response = await fetch(`/api/kv/${encodeURIComponent(key)}`, {
    method: 'DELETE',
  });

  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Failed to sync delete mutation');
  }
}

async function reconcileRemote(key: string, local: Envelope | null) {
  try {
    const remote = await fetchRemote(key);
    if (!remote) {
      return;
    }

    if (!local || remote.updatedAt > local.updatedAt) {
      const db = await getDB();
      await db.put('items', remote, key);
      notifyChange();
    }
  } catch {
    // Background reconciliation is best-effort.
  }
}

async function flushPending() {
  if (syncInFlight) {
    return syncInFlight;
  }

  syncInFlight = (async () => {
    if (!navigator.onLine) {
      return;
    }

    const db = await getDB();
    const pending = await db.getAll('pendingSync');

    for (const entry of pending) {
      try {
        if (entry.op === 'set' && entry.envelope) {
          await syncSet(entry.key, entry.envelope);
        } else if (entry.op === 'delete') {
          await syncDelete(entry.key);
        }

        await db.delete('pendingSync', entry.id as number);
      } catch {
        break;
      }
    }
  })();

  try {
    await syncInFlight;
  } finally {
    syncInFlight = null;
  }
}

function ensureSyncRuntime() {
  if (typeof window === 'undefined' || syncSetupDone) {
    return;
  }

  syncSetupDone = true;
  window.addEventListener('online', () => {
    void flushPending();
  });
  void flushPending();
}

export async function getItem(key: string): Promise<string | null> {
  ensureSyncRuntime();
  const local = await readLocal(key);
  void reconcileRemote(key, local);
  return local?.value ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
  ensureSyncRuntime();
  const envelope: Envelope = { value, updatedAt: Date.now() };
  await writeLocal(key, envelope);

  try {
    await syncSet(key, envelope);
  } catch {
    await queueMutation({ key, op: 'set', envelope, updatedAt: envelope.updatedAt });
  }

  void flushPending();
}

export async function deleteItem(key: string): Promise<void> {
  ensureSyncRuntime();
  const envelope: Envelope = { value: '', updatedAt: Date.now() };
  await deleteLocal(key);

  try {
    await syncDelete(key);
  } catch {
    await queueMutation({ key, op: 'delete', envelope, updatedAt: envelope.updatedAt });
  }

  void flushPending();
}

export async function listKeys(prefix = ''): Promise<string[]> {
  ensureSyncRuntime();
  const db = await getDB();
  const keys = await db.getAllKeys('items');
  return keys.filter((key): key is string => typeof key === 'string' && key.startsWith(prefix)).sort();
}

if (typeof window !== 'undefined') {
  const storageApi: {
    getItem: typeof getItem;
    setItem: typeof setItem;
    deleteItem: typeof deleteItem;
    listKeys: typeof listKeys;
  } = {
    getItem,
    setItem,
    deleteItem,
    listKeys,
  };

  (window as Window & { storage?: typeof storageApi }).storage = storageApi;
}
