export const DB_NAME = 'crm_app_db';
export const DB_VERSION = 1;

let dbInstance = null;

export async function initDB() {
    if (dbInstance) return dbInstance;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Error opening DB', event);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('clients')) {
                db.createObjectStore('clients', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('jobs')) {
                const jobStore = db.createObjectStore('jobs', { keyPath: 'id' });
                jobStore.createIndex('clientId', 'clientId', { unique: false });
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'id' });
            }
        };
    });
}

function generateId() {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
}

async function executeTransaction(storeName, mode, callback) {
    const dbRef = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = dbRef.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);

        let result;

        transaction.oncomplete = () => resolve(result);
        transaction.onerror = (e) => reject(e.target.error);

        const req = callback(store);
        if (req) {
            req.onsuccess = (e) => {
                result = e.target.result;
            };
        }
    });
}

export const db = {
    async getAll(storeName, includeDeleted = false) {
        const dbRef = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = dbRef.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                let items = request.result || [];
                if (!includeDeleted) {
                    items = items.filter(item => !item.deleted);
                }
                resolve(items);
            };
            request.onerror = () => reject(request.error);
        });
    },

    async getById(storeName, id) {
        return executeTransaction(storeName, 'readonly', (store) => store.get(id));
    },

    async create(storeName, data) {
        const timestamp = new Date().toISOString();
        const record = {
            ...data,
            id: data.id || generateId(),
            createdAt: timestamp,
            updatedAt: timestamp,
            deleted: false
        };
        await executeTransaction(storeName, 'readwrite', (store) => store.add(record));
        return record;
    },

    async update(storeName, id, data) {
        const currentRec = await this.getById(storeName, id);
        if (!currentRec) throw new Error(`Record ${id} not found in ${storeName}`);

        const updatedRecord = {
            ...currentRec,
            ...data,
            updatedAt: new Date().toISOString()
        };

        await executeTransaction(storeName, 'readwrite', (store) => store.put(updatedRecord));
        return updatedRecord;
    },

    async softDelete(storeName, id) {
        return this.update(storeName, id, { deleted: true });
    },

    async delete(storeName, id) {
        return executeTransaction(storeName, 'readwrite', (store) => store.delete(id));
    }
};
