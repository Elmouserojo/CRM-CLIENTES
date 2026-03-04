import { photosService } from '../../services/photos.service.js';

export function initPhotosUI() {
    window.addEventListener('load-item-photos', async (e) => {
        const { itemId } = e.detail;
        const allPhotos = await photosService.loadPhotos();
        const itemPhotos = allPhotos.filter(p => p.entityType === 'item' && p.entityId === itemId);
        renderItemPhotosList(itemPhotos);
    });

    window.addEventListener('create-photo', async (e) => {
        const { entityType, entityId, base64 } = e.detail;
        await photosService.createPhoto({ entityType, entityId, base64 });

        // Reload list for drill-down view
        if (entityType === 'item') {
            const allPhotos = await photosService.loadPhotos();
            renderItemPhotosList(allPhotos.filter(p => p.entityType === 'item' && p.entityId === entityId));
        }
    });

    window.deletePhoto = async (id, event) => {
        event.stopPropagation();
        if (confirm('¿Eliminar foto?')) {
            // to keep UI refresh simple, we fetch all
            const allBefore = await photosService.loadPhotos();
            const p = allBefore.find(x => x.id === id);
            await photosService.deletePhoto(id);
            if (p && p.entityType === 'item') {
                const allPosts = await photosService.loadPhotos();
                renderItemPhotosList(allPosts.filter(x => x.entityType === 'item' && x.entityId === p.entityId));
            }
        }
    }
}

function renderItemPhotosList(photos) {
    const container = document.getElementById('item-photos-list');
    if (!container) return;

    if (!photos || photos.length === 0) {
        container.innerHTML = '<p>No hay fotos.</p>';
        return;
    }

    container.innerHTML = photos.map(p => `
        <div class="photo-item" style="position: relative; cursor: pointer;">
            <!-- Simulating photo display with b64 string or url -->
            <img src="${p.base64}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><rect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/><text fill=\\'%23ccc\\' x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\'>IMG</text></svg>'">
            <button onclick="deletePhoto('${p.id}', event)" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5); border:none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; color: white;">✕</button>
        </div>
    `).join('');
}
