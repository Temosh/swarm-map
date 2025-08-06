const DB_NAME = 'SwarmMapDB';
const STORE_NAME = 'checkins';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const target = event.target as IDBOpenDBRequest;
      const db = target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const target = event.target as IDBOpenDBRequest;
      db = target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      const target = event.target as IDBOpenDBRequest;
      console.error('IndexedDB error:', target.error);
      reject(target.error);
    };
  });
}

export async function getCachedCheckins(): Promise<any[] | null> {
  try {
    const database = await openDatabase();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cachedData = request.result;
        if (cachedData && cachedData.length > 0) {
          // Assuming the first item might contain a timestamp or we can check freshness
          // For simplicity, let's just return the data for now.
          // A more robust solution would involve storing metadata like fetch timestamp.
          console.log('Retrieved checkins from IndexedDB.');
          resolve(cachedData);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting cached checkins:', error);
    return null;
  }
}

export async function saveCheckins(checkins: any[]): Promise<void> {
  try {
    const database = await openDatabase();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing data before adding new data
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    for (const checkin of checkins) {
      store.put(checkin);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('Checkins saved to IndexedDB.');
        resolve();
      };
      transaction.onerror = () => {
        console.error('Error saving checkins to IndexedDB:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error saving checkins:', error);
  }
}

export async function clearCheckinsCache(): Promise<void> {
  try {
    const database = await openDatabase();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('IndexedDB checkins cache cleared.');
        resolve();
      };
      request.onerror = () => {
        console.error('Error clearing IndexedDB cache:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
  }
}
