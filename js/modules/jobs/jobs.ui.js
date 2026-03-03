import { jobsService } from '../../services/jobs.service.js';
import { store } from '../../state/store.js';

export function initJobsUI() {
    const container = document.getElementById('view-jobs');

    container.innerHTML = `
        <div class="header-actions" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--spacing-md)">
            <h2>Órdenes de Trabajo</h2>
            <button id="btn-add-job" class="btn">+ Nueva Orden</button>
        </div>

        <div id="jobs-list"></div>

        <div id="job-form-container" class="card" style="display:none;">
            <h3 id="job-form-title">Nueva Orden</h3>
            <form id="job-form">
                <input type="hidden" id="job-id">
                
                <div class="form-group">
                    <label>Cliente *</label>
                    <select id="job-client-id" class="form-control" required></select>
                </div>
                <div class="form-group">
                    <label>Dispositivo/Equipo *</label>
                    <input type="text" id="job-device" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Estado *</label>
                    <select id="job-status" class="form-control" required>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="Entregado">Entregado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Precio Estimado / Final ($)</label>
                    <input type="number" id="job-price" class="form-control" step="0.01">
                </div>
                <div class="form-group">
                    <label>Notas</label>
                    <textarea id="job-notes" class="form-control" rows="3"></textarea>
                </div>
                <div style="display:flex; gap:10px; margin-top:15px;">
                    <button type="submit" class="btn">Guardar</button>
                    <button type="button" id="btn-cancel-job" class="btn" style="background:#555; color:#fff;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    const jobsList = document.getElementById('jobs-list');
    const formContainer = document.getElementById('job-form-container');
    const form = document.getElementById('job-form');
    const clientSelect = document.getElementById('job-client-id');

    const statusColors = {
        'Pendiente': '#FFD600',
        'En proceso': '#29B6F6',
        'Finalizado': '#00E676',
        'Entregado': '#B3B3B3'
    };

    function renderJobs(jobs) {
        if (jobs.length === 0) {
            jobsList.innerHTML = '<p style="color:var(--text-secondary)">No hay órdenes registradas.</p>';
            return;
        }

        jobsList.innerHTML = jobs.map(j => `
            <div class="card" style="margin-bottom:var(--spacing-md)">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <h4 style="margin-bottom:4px">${j.device}</h4>
                        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:8px">
                            👤 ${j.client ? j.client.name : 'Desconocido'}
                        </p>
                    </div>
                    <span style="background:${statusColors[j.status]}; color:#000; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">
                        ${j.status}
                    </span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold; color:var(--accent-color)">$${j.price || '0.00'}</span>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-edit-job" data-id="${j.id}" style="padding:6px 10px; font-size:0.8rem;">Editar</button>
                        <button class="btn btn-danger btn-delete-job" data-id="${j.id}" style="padding:6px 10px; font-size:0.8rem;">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.btn-edit-job').forEach(btn => {
            btn.addEventListener('click', (e) => editJob(e.target.dataset.id));
        });
        document.querySelectorAll('.btn-delete-job').forEach(btn => {
            btn.addEventListener('click', (e) => deleteJob(e.target.dataset.id));
        });
    }

    function populateClientSelect() {
        const clients = store.getState().clients;
        if (clients.length === 0) {
            clientSelect.innerHTML = '<option value="">(Agrega un cliente primero)</option>';
            return;
        }
        clientSelect.innerHTML = clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    store.subscribe('JOBS_UPDATED', renderJobs);
    store.subscribe('CLIENTS_UPDATED', populateClientSelect);

    jobsService.loadJobs();

    document.getElementById('btn-add-job').addEventListener('click', () => {
        populateClientSelect();
        form.reset();
        document.getElementById('job-id').value = '';
        document.getElementById('job-form-title').innerText = 'Nueva Orden';
        formContainer.style.display = 'block';
        jobsList.style.display = 'none';
    });

    document.getElementById('btn-cancel-job').addEventListener('click', () => {
        formContainer.style.display = 'none';
        jobsList.style.display = 'block';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('job-id').value;
        const data = {
            clientId: document.getElementById('job-client-id').value,
            device: document.getElementById('job-device').value,
            status: document.getElementById('job-status').value,
            price: document.getElementById('job-price').value,
            notes: document.getElementById('job-notes').value
        };

        try {
            if (id) {
                await jobsService.updateJob(id, data);
            } else {
                await jobsService.createJob(data);
            }
            formContainer.style.display = 'none';
            jobsList.style.display = 'block';
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        }
    });

    function editJob(id) {
        const job = store.getState().jobs.find(j => j.id === id);
        if (!job) return;

        populateClientSelect();
        document.getElementById('job-id').value = job.id;
        document.getElementById('job-client-id').value = job.clientId;
        document.getElementById('job-device').value = job.device;
        document.getElementById('job-status').value = job.status;
        document.getElementById('job-price').value = job.price || '';
        document.getElementById('job-notes').value = job.notes || '';

        document.getElementById('job-form-title').innerText = 'Editar Orden';
        formContainer.style.display = 'block';
        jobsList.style.display = 'none';
    }

    async function deleteJob(id) {
        if (confirm('¿Estás seguro de eliminar esta orden?')) {
            try {
                await jobsService.deleteJob(id);
            } catch (err) {
                alert('Hubo un error al eliminar: ' + err.message);
            }
        }
    }
}
