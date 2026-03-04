import { db } from '../db/database.js';
import { store } from '../state/store.js';

export const equipmentService = {
    async loadEquipment() {
        try {
            const equipment = await db.getAll('equipment');
            store.dispatch('EQUIPMENT_UPDATED', equipment);
            return equipment;
        } catch (error) {
            console.error('Error loading equipment:', error);
            throw error;
        }
    },

    async createEquipment(equipmentData) {
        if (!equipmentData.clientId || !equipmentData.name) {
            throw new Error('Cliente y nombre son obligatorios');
        }

        const newEquipment = await db.create('equipment', equipmentData);
        await this.loadEquipment();
        return newEquipment;
    },

    async updateEquipment(id, equipmentData) {
        if (!id) throw new Error('ID requerido');

        const updatedEquipment = await db.update('equipment', id, equipmentData);
        await this.loadEquipment();
        return updatedEquipment;
    },

    async deleteEquipment(id) {
        if (!id) throw new Error('ID requerido');

        await db.softDelete('equipment', id);
        await this.loadEquipment();
    }
};
