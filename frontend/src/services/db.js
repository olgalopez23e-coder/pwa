import { openDB } from 'idb';

const dbPromise = openDB('poke-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('requests')) {
      db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
    }
  }
});

export const saveOfflineRequest = async (request) => {
  const db = await dbPromise;
  return db.add('requests', {
    ...request,
    timestamp: Date.now()
  });
};

export const getOfflineRequests = async () => {
  const db = await dbPromise;
  return db.getAll('requests');
};

export const deleteOfflineRequest = async (id) => {
  const db = await dbPromise;
  return db.delete('requests', id);
};

export default dbPromise;