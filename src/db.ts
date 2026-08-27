import type { PracticeCard } from './domain';

const DB_NAME = 'tempo-earcheck';
const STORE = 'practice-cards';

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Your practice notebook could not be opened.'));
  });
}

function transaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore, resolve: (value: T) => void) => void
): Promise<T> {
  return database().then((db) => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    operation(tx.objectStore(STORE), resolve);
    tx.onerror = () => reject(new Error('Your change could not be saved on this device.'));
    tx.oncomplete = () => db.close();
  }));
}

export function getCards(): Promise<PracticeCard[]> {
  return transaction('readonly', (store, resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve((request.result as PracticeCard[])
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  });
}

export function putCard(card: PracticeCard): Promise<void> {
  return transaction('readwrite', (store, resolve) => {
    const request = store.put(card);
    request.onsuccess = () => resolve();
  });
}

export function deleteCard(id: string): Promise<void> {
  return transaction('readwrite', (store, resolve) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
  });
}

export async function mergeCards(cards: PracticeCard[]): Promise<void> {
  const existing = new Map((await getCards()).map((card) => [card.id, card]));
  await Promise.all(cards.map((card) => {
    const previous = existing.get(card.id);
    return putCard(!previous || card.updatedAt > previous.updatedAt ? card : previous);
  }));
}
