import { equipmentService } from '../../services/equipment.service.js';
import { store } from '../../state/store.js';
import { updateBreadcrumb } from '../ui/core.ui.js';

export function initEquipmentUI() {
    window.addEventListener('load-client-equipment', async (e) => {
        const { clientId } = e.detail;
        const equipmentList = await equipmentService.loadEquipment();
        const clientEqs = equipmentList.filter(eq => eq.clientId === clientId);
        renderEquipmentList(clientEqs);
    });

    window.addEventListener('create-equipment', async (e) => {
        const { clientId, type, brand } = e.detail;
        await equipmentService.createEquipment({ clientId, type, brand, name: `${type} ${brand}` });

        // Reload list
        const equipmentList = await equipmentService.loadEquipment();
        renderEquipmentList(equipmentList.filter(eq => eq.clientId === clientId));
    });

    window.addEventListener('nav-equipment-detail', async (e) => {
        const { id } = e.detail;
        await renderEquipmentDetail(id);
    });

    // Make functions global for inline onclick
    window.deleteEquipment = async (id, event) => {
        event.stopPropagation();
        if (confirm('¿Eliminar equipo?')) {
            const eq = store.getState().equipment?.find(e => e.id === id);
            await equipmentService.deleteEquipment(id);
            if (eq) {
                const equipmentList = await equipmentService.loadEquipment();
                renderEquipmentList(equipmentList.filter(e => e.clientId === eq.clientId));
            }
        }
    };
}

function renderEquipmentList(equipment) {
    const container = document.getElementById('client-equipment-list');
    if (!container) return;

    if (!equipment || equipment.length === 0) {
        container.innerHTML = '<p>No hay equipos registrados para este cliente.</p>';
        return;
    }

    // Drill-down link around eq name/card
    container.innerHTML = equipment.map(eq => `
        <div class="card" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="location.hash='#/equipment/${eq.id}'">
            <div>
                <h4 style="color: var(--accent-color); margin-bottom: 4px;">${eq.type}</h4>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">Marca: ${eq.brand}</p>
            </div>
            <div class="actions">
                <button onclick="event.stopPropagation(); deleteEquipment('${eq.id}', event)" class="primary-btn small" style="background-color: var(--danger-color);">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function renderEquipmentDetail(id) {
    let eqBaseList = store.getState().equipment;
    if (!eqBaseList) {
        eqBaseList = await equipmentService.loadEquipment();
    }
    const equipment = eqBaseList.find(e => e.id === id);

    if (!equipment) {
        document.getElementById('view-equipment-detail').innerHTML = '<p>Equipo no encontrado</p>';
        return;
    }

    // Grab client info for breadcrumb
    let clients = store.getState().clients;
    if (!clients || clients.length === 0) {
        const { clientsService } = await import('../../services/clients.service.js');
        clients = await clientsService.loadClients();
    }
    const client = clients.find(c => c.id === equipment.clientId);
    const clientName = client ? client.name : 'Cliente Anónimo';

    updateBreadcrumb([
        { label: 'Clientes', link: '#/clients' },
        { label: clientName, link: `#/client/${equipment.clientId}` },
        { label: equipment.name, link: `#/equipment/${id}` }
    ]);

    document.getElementById('equipment-detail-name').textContent = equipment.name;
    document.getElementById('equipment-detail-type').textContent = equipment.type || 'No especificado';
    document.getElementById('equipment-detail-brand').textContent = equipment.brand || 'No especificada';

    // Hook add item
    const btnAddItem = document.getElementById('btn-add-item');
    if (btnAddItem) {
        btnAddItem.onclick = () => {
            const name = prompt('Nombre del item/parte:');
            if (name) {
                window.dispatchEvent(new CustomEvent('create-item', { detail: { equipmentId: id, name } }));
            }
        };
    }

    // Trigger loading of items for this equipment
    window.dispatchEvent(new CustomEvent('load-equipment-items', { detail: { equipmentId: id } }));
}
