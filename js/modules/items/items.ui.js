import { itemsService } from '../../services/items.service.js';
import { store } from '../../state/store.js';
import { updateBreadcrumb } from '../ui/core.ui.js';

export function initItemsUI() {
    window.addEventListener('load-equipment-items', async (e) => {
        const { equipmentId } = e.detail;
        const allItems = await itemsService.loadItems();
        const eqItems = allItems.filter(i => i.equipmentId === equipmentId);
        renderItemsList(eqItems);
    });

    window.addEventListener('create-item', async (e) => {
        const { equipmentId, name } = e.detail;
        const condition = prompt('Condición (nuevo, biejo, deteriorado)?', 'nuevo') || 'nuevo';
        await itemsService.createItem({ equipmentId, name, condition });

        // Reload list
        const allItems = await itemsService.loadItems();
        renderItemsList(allItems.filter(i => i.equipmentId === equipmentId));
    });

    window.addEventListener('nav-item-detail', async (e) => {
        const { id } = e.detail;
        await renderItemDetail(id);
    });

    // Global deletion for inline DOM
    window.deleteItem = async (id, event) => {
        event.stopPropagation();
        if (confirm('¿Eliminar item/parte?')) {
            const item = store.getState().items?.find(i => i.id === id);
            await itemsService.deleteItem(id);
            if (item) {
                const allItems = await itemsService.loadItems();
                renderItemsList(allItems.filter(i => i.equipmentId === item.equipmentId));
            }
        }
    };
}

function renderItemsList(items) {
    const container = document.getElementById('equipment-items-list');
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = '<p>No hay partes o items para este equipo.</p>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="card" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="location.hash='#/item/${item.id}'">
            <div>
                <h4 style="color: var(--accent-color); margin-bottom: 4px;">${item.name}</h4>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">Estado: ${item.condition}</p>
            </div>
             <div class="actions">
                <button onclick="event.stopPropagation(); deleteItem('${item.id}', event)" class="primary-btn small" style="background-color: var(--danger-color);">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function renderItemDetail(id) {
    let baseList = store.getState().items;
    if (!baseList) {
        baseList = await itemsService.loadItems();
    }
    const item = baseList.find(i => i.id === id);

    if (!item) {
        document.getElementById('view-item-detail').innerHTML = '<p>Item no encontrado</p>';
        return;
    }

    // Grab equipment and client for breadcrumb
    let equipmentList = store.getState().equipment;
    if (!equipmentList || equipmentList.length === 0) {
        const { equipmentService } = await import('../../services/equipment.service.js');
        equipmentList = await equipmentService.loadEquipment();
    }
    let equipment = equipmentList?.find(e => e.id === item.equipmentId);

    let clients = store.getState().clients;
    if (!clients || clients.length === 0) {
        const { clientsService } = await import('../../services/clients.service.js');
        clients = await clientsService.loadClients();
    }

    let clientName = 'Cliente';
    let eqName = 'Equipo';

    if (equipment) {
        eqName = equipment.name;
        if (clients && clients.length > 0) {
            const client = clients.find(c => c.id === equipment.clientId);
            if (client) clientName = client.name;
        }
    }

    updateBreadcrumb([
        { label: 'Clientes', link: '#/clients' },
        { label: clientName, link: equipment ? `#/client/${equipment.clientId}` : '#/clients' },
        { label: eqName, link: equipment ? `#/equipment/${equipment.id}` : '#/clients' },
        { label: item.name, link: `#/item/${id}` }
    ]);

    document.getElementById('item-detail-name').textContent = item.name;
    document.getElementById('item-detail-brand').textContent = item.brand || 'No especificada';
    document.getElementById('item-detail-condition').textContent = item.condition || 'No especificada';
    document.getElementById('item-detail-power').textContent = item.power || 'N/A';

    // Set up active photo and job listener events
    window.dispatchEvent(new CustomEvent('load-item-photos', { detail: { itemId: id } }));
    window.dispatchEvent(new CustomEvent('load-item-jobs', { detail: { itemId: id } }));

    // Action hooking
    const btnAddPhoto = document.getElementById('btn-add-photo');
    if (btnAddPhoto) {
        btnAddPhoto.onclick = () => {
            // In a real device we use an input type file, simulating here:
            const b64 = prompt('Pega una url o base64 (simulación de cámara):');
            if (b64) {
                window.dispatchEvent(new CustomEvent('create-photo', { detail: { entityType: 'item', entityId: id, base64: b64 } }));
            }
        };
    }

    const btnAddJob = document.getElementById('btn-add-job');
    if (btnAddJob) {
        btnAddJob.onclick = () => {
            window.dispatchEvent(new CustomEvent('create-job', { detail: { itemId: id } }));
        };
    }
}
