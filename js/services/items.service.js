import { db } from '../db/database.js';
import { store } from '../state/store.js';

export const itemsService = {
    async loadItems() {
        try {
            const items = await db.getAll('items');
            store.dispatch('ITEMS_UPDATED', items);
            return items;
        } catch (error) {
            console.error('Error loading items:', error);
            throw error;
        }
    },

    async createItem(itemData) {
        if (!itemData.equipmentId || !itemData.name) {
            throw new Error('Equipo y nombre son obligatorios');
        }

        const newItem = await db.create('items', itemData);
        await this.loadItems();
        return newItem;
    },

    async updateItem(id, itemData) {
        if (!id) throw new Error('ID requerido');

        const updatedItem = await db.update('items', id, itemData);
        await this.loadItems();
        return updatedItem;
    },

    async deleteItem(id) {
        if (!id) throw new Error('ID requerido');

        await db.softDelete('items', id);
        await this.loadItems();
    }
};
