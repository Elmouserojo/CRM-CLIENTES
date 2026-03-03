import { db } from '../db/database.js';
import { store } from '../state/store.js';

export const clientsService = {
    async loadClients() {
        try {
            const clients = await db.getAll('clients');
            store.dispatch('CLIENTS_UPDATED', clients);
            return clients;
        } catch (error) {
            console.error('Error loading clients:', error);
            throw error;
        }
    },

    async createClient(clientData) {
        if (!clientData.name) {
            throw new Error('El nombre es obligatorio');
        }

        const newClient = await db.create('clients', clientData);
        await this.loadClients();
        return newClient;
    },

    async updateClient(id, clientData) {
        if (!id) throw new Error('ID requerido');

        const updatedClient = await db.update('clients', id, clientData);
        await this.loadClients();
        return updatedClient;
    },

    async deleteClient(id) {
        if (!id) throw new Error('ID requerido');

        await db.softDelete('clients', id);
        await this.loadClients();
    },

    searchClients(query) {
        const clients = store.getState().clients;
        const lowerQuery = query.toLowerCase();

        return clients.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            (c.phone && c.phone.includes(lowerQuery)) ||
            (c.email && c.email.toLowerCase().includes(lowerQuery))
        );
    }
};
