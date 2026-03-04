import { db } from '../db/database.js';
import { store } from '../state/store.js';

export const photosService = {
    async loadPhotos() {
        try {
            const photos = await db.getAll('photos');
            store.dispatch('PHOTOS_UPDATED', photos);
            return photos;
        } catch (error) {
            console.error('Error loading photos:', error);
            throw error;
        }
    },

    async createPhoto(photoData) {
        if (!photoData.entityType || !photoData.entityId || !photoData.base64) {
            throw new Error('Entidad, ID y la imagen son obligatorios');
        }

        const newPhoto = await db.create('photos', photoData);
        await this.loadPhotos();
        return newPhoto;
    },

    async deletePhoto(id) {
        if (!id) throw new Error('ID requerido');

        // Note: we can hard delete photos to save space, but lets stick to soft-delete
        // or execute regular delete based on business needs. Doing hard delete for now:
        await db.delete('photos', id);
        await this.loadPhotos();
    }
};
