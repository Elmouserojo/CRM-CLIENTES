import { clientsService } from '../../services/clients.service.js';
import { store } from '../../state/store.js';
import { updateBreadcrumb } from '../ui/core.ui.js';

export function initClientsUI() {
    const btnAdd = document.getElementById('btn-add-client');
    const container = document.getElementById('clients-list');

    window.deleteClient = async (id, event) => {
        event.stopPropagation(); // prevent drill-down
        if (confirm('¿Eliminar cliente?')) {
            await clientsService.deleteClient(id);
        }
    };

    window.editClient = async (id, event) => {
        event.stopPropagation(); // prevent drill-down
        const name = prompt('Nuevo nombre:');
        if (name) {
            await clientsService.updateClient(id, { name });
        }
    };

    btnAdd.addEventListener('click', async () => {
        const name = prompt('Nombre del cliente:');
        const phone = prompt('Teléfono del cliente (opcional):');
        if (name) {
            await clientsService.createClient({ name, phone });
        }
    });

    store.subscribe('CLIENTS_UPDATED', renderClientsList);

    // Initial load
    clientsService.loadClients();

    // Listen to hash router events
    window.addEventListener('nav-client-detail', async (e) => {
        const clientId = e.detail.id;
        await renderClientDetail(clientId);
    });
}

function renderClientsList(clients) {
    const container = document.getElementById('clients-list');
    if (!container) return;

    if (!clients || clients.length === 0) {
        container.innerHTML = '<p>No hay clientes.</p>';
        return;
    }

    // Drill-down link around client name/card
    container.innerHTML = clients.map(c => `
        <div class="card" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="location.hash='#/client/${c.id}'">
            <div>
                <h3 style="color: var(--accent-color);">${c.name}</h3>
                ${c.phone ? `<p style="font-size: 0.9rem; color: var(--text-secondary);">📞 ${c.phone}</p>` : ''}
            </div>
            <div class="actions">
                <button onclick="event.stopPropagation(); editClient('${c.id}', event)" class="secondary-btn small">✏️</button>
                <button onclick="event.stopPropagation(); deleteClient('${c.id}', event)" class="primary-btn small" style="background-color: var(--danger-color);">🗑️</button>
            </div>
        </div>
    `).join('');

    // reset breadcrumbs on root view
    updateBreadcrumb([]);
}

async function renderClientDetail(clientId) {
    let client = store.getState().clients.find(c => c.id === clientId);
    if (!client) {
        // Fallback fetch if deep linked
        const clients = await clientsService.loadClients();
        client = clients.find(c => c.id === clientId);
    }

    if (!client) {
        document.getElementById('view-client-detail').innerHTML = '<p>Cliente no encontrado</p>';
        return;
    }

    updateBreadcrumb([
        { label: 'Clientes', link: '#/clients' },
        { label: client.name, link: `#/client/${clientId}` }
    ]);

    document.getElementById('client-detail-name').textContent = client.name;
    document.getElementById('client-detail-phone').textContent = client.phone || 'No registrado';
    document.getElementById('client-detail-email').textContent = client.email || 'No registrado';

    // Hook edit
    const btnEdit = document.getElementById('btn-edit-client');
    btnEdit.onclick = () => window.editClient(clientId, { stopPropagation: () => { } });

    // Hook add equipment
    const btnAddEq = document.getElementById('btn-add-equipment');
    if (btnAddEq) {
        btnAddEq.onclick = () => {
            const type = prompt('Tipo de equipo (Ej: Heladera, Aire):');
            const brand = prompt('Marca del equipo:');
            if (type && brand) {
                // Dispach event to equipment module to create it
                window.dispatchEvent(new CustomEvent('create-equipment', { detail: { clientId, type, brand } }));
            }
        };
    }

    // Trigger load of equipment for this client
    window.dispatchEvent(new CustomEvent('load-client-equipment', { detail: { clientId } }));
}
