import type { PracticeCard } from './domain';

export type StorageScope = 'real' | 'demo';

const STORE = 'practice-cards';

const databaseName = (scope: StorageScope): string =>
  scope === 'demo' ? 'demo:tempo-earcheck' : 'tempo-earcheck';

function database(scope: StorageScope): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName(scope), 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Your practice notebook could not be opened.'));
  });
}

function transaction<T>(
  scope: StorageScope,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore, resolve: (value: T) => void) => void
): Promise<T> {
  return database(scope).then((db) => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    operation(tx.objectStore(STORE), resolve);
    tx.onerror = () => reject(new Error('Your change could not be saved on this device.'));
    tx.oncomplete = () => db.close();
  }));
}

export function getCards(scope: StorageScope = 'real'): Promise<PracticeCard[]> {
  return transaction(scope, 'readonly', (store, resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve((request.result as PracticeCard[])
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  });
}

export function putCard(card: PracticeCard, scope: StorageScope = 'real'): Promise<void> {
  return transaction(scope, 'readwrite', (store, resolve) => {
    const request = store.put(card);
    request.onsuccess = () => resolve();
  });
}

export function deleteCard(id: string, scope: StorageScope = 'real'): Promise<void> {
  return transaction(scope, 'readwrite', (store, resolve) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
  });
}

export async function mergeCards(cards: PracticeCard[], scope: StorageScope = 'real'): Promise<void> {
  const existing = new Map((await getCards(scope)).map((card) => [card.id, card]));
  await Promise.all(cards.map((card) => {
    const previous = existing.get(card.id);
    return putCard(!previous || card.updatedAt > previous.updatedAt ? card : previous, scope);
  }));
}

export function clearCards(scope: StorageScope): Promise<void> {
  return transaction(scope, 'readwrite', (store, resolve) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
  });
}

export async function deleteStorage(scope: StorageScope): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName(scope));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('The sample notebook could not be cleared.'));
    request.onblocked = () => reject(new Error('Close other sample tabs, then try again.'));
  });
}
