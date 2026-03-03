import { clientsService } from '../../services/clients.service.js';
import { store } from '../../state/store.js';

export function initClientsUI() {
    const container = document.getElementById('view-clients');

    container.innerHTML = `
        <div class="header-actions" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--spacing-md)">
            <h2>Clientes</h2>
            <button id="btn-add-client" class="btn">+ Nuevo Cliente</button>
        </div>
        
        <div class="form-group">
            <input type="text" id="search-client" class="form-control" placeholder="Buscar cliente...">
        </div>

        <div id="clients-list"></div>

        <div id="client-form-container" class="card" style="display:none;">
            <h3 id="client-form-title">Nuevo Cliente</h3>
            <form id="client-form">
                <input type="hidden" id="client-id">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="client-name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Teléfono *</label>
                    <input type="tel" id="client-phone" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="client-email" class="form-control">
                </div>
                <div style="display:flex; gap:10px; margin-top:15px;">
                    <button type="submit" class="btn">Guardar</button>
                    <button type="button" id="btn-cancel-client" class="btn" style="background:#555; color:#fff;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    const clientsList = document.getElementById('clients-list');
    const formContainer = document.getElementById('client-form-container');
    const form = document.getElementById('client-form');
    const searchInput = document.getElementById('search-client');

    function renderClients(clients) {
        if (clients.length === 0) {
            clientsList.innerHTML = '<p style="color:var(--text-secondary)">No hay clientes registrados.</p>';
            return;
        }

        clientsList.innerHTML = clients.map(c => `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h4 style="margin-bottom:4px">${c.name}</h4>
                    <p style="color:var(--text-secondary); font-size:0.9rem;">
                        📞 ${c.phone} ${c.email ? `| ✉️ ${c.email}` : ''}
                    </p>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-edit-client" data-id="${c.id}" style="padding:6px 10px; font-size:0.8rem;">Editar</button>
                    <button class="btn btn-danger btn-delete-client" data-id="${c.id}" style="padding:6px 10px; font-size:0.8rem;">Eliminar</button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.btn-edit-client').forEach(btn => {
            btn.addEventListener('click', (e) => editClient(e.target.dataset.id));
        });
        document.querySelectorAll('.btn-delete-client').forEach(btn => {
            btn.addEventListener('click', (e) => deleteClient(e.target.dataset.id));
        });
    }

    store.subscribe('CLIENTS_UPDATED', renderClients);
    clientsService.loadClients();

    document.getElementById('btn-add-client').addEventListener('click', () => {
        form.reset();
        document.getElementById('client-id').value = '';
        document.getElementById('client-form-title').innerText = 'Nuevo Cliente';
        formContainer.style.display = 'block';
        clientsList.style.display = 'none';
    });

    document.getElementById('btn-cancel-client').addEventListener('click', () => {
        formContainer.style.display = 'none';
        clientsList.style.display = 'block';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('client-id').value;
        const data = {
            name: document.getElementById('client-name').value,
            phone: document.getElementById('client-phone').value,
            email: document.getElementById('client-email').value
        };

        try {
            if (id) {
                await clientsService.updateClient(id, data);
            } else {
                await clientsService.createClient(data);
            }
            formContainer.style.display = 'none';
            clientsList.style.display = 'block';
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        }
    });

    searchInput.addEventListener('input', (e) => {
        const filtered = clientsService.searchClients(e.target.value);
        renderClients(filtered);
    });

    function editClient(id) {
        const client = store.getState().clients.find(c => c.id === id);
        if (!client) return;

        document.getElementById('client-id').value = client.id;
        document.getElementById('client-name').value = client.name;
        document.getElementById('client-phone').value = client.phone;
        document.getElementById('client-email').value = client.email || '';

        document.getElementById('client-form-title').innerText = 'Editar Cliente';
        formContainer.style.display = 'block';
        clientsList.style.display = 'none';
    }

    async function deleteClient(id) {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            try {
                await clientsService.deleteClient(id);
            } catch (err) {
                alert('Hubo un error al eliminar: ' + err.message);
            }
        }
    }
}
