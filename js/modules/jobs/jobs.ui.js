import { jobsService } from '../services/jobs.service.js';
import { store } from '../../state/store.js';

export function initJobsUI() {
    // 1. Root level jobs listing (all jobs)
    store.subscribe('JOBS_UPDATED', renderAllJobsList);
    jobsService.loadJobs();

    // 2. Drill-down item-specific jobs
    window.addEventListener('load-item-jobs', async (e) => {
        const { itemId } = e.detail;
        const allJobs = await jobsService.loadJobs();
        const itemJobs = allJobs.filter(j => j.itemId === itemId);
        renderItemJobsList(itemJobs);
    });

    window.addEventListener('create-job', async (e) => {
        const { itemId } = e.detail;
        const description = prompt('Descripción del trabajo:');
        const price = prompt('Precio de la orden:');
        if (description) {
            await jobsService.createJob({
                itemId,
                description,
                price: parseFloat(price) || 0,
                status: 'pendiente'
            });

            // Reload list for drill-down view
            const allJobs = await jobsService.loadJobs();
            renderItemJobsList(allJobs.filter(j => j.itemId === itemId));
        }
    });

    // Make functions global for inline onclick
    window.deleteJob = async (id, event) => {
        event.stopPropagation();
        if (confirm('¿Eliminar trabajo?')) {
            const job = store.getState().jobs?.find(j => j.id === id);
            await jobsService.deleteJob(id);
            if (job) {
                // Re-render item list if we are in drill-down
                const allJobs = await jobsService.loadJobs();
                renderItemJobsList(allJobs.filter(j => j.itemId === job.itemId));
            }
        }
    };

    window.finishJob = async (id, event) => {
        event.stopPropagation();
        if (confirm('¿Marcar como terminado?')) {
            const job = store.getState().jobs?.find(j => j.id === id);
            await jobsService.updateJob(id, { status: 'terminado' });
            if (job) {
                const allJobs = await jobsService.loadJobs();
                renderItemJobsList(allJobs.filter(j => j.itemId === job.itemId));
            }
        }
    }
}

function renderAllJobsList(jobs) {
    const container = document.getElementById('jobs-list');
    if (!container) return;

    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p>No hay órdenes de trabajo.</p>';
        return;
    }

    container.innerHTML = jobs.map(j => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h4 style="color: var(--accent-color); margin-bottom: 4px;">${j.description || 'Sin descripción'}</h4>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">Estado: ${j.status}</p>
                <p style="font-size: 0.9rem; color: var(--accent-hover);">$${j.price || 0}</p>
                <!-- We would normally resolve the Client and Equipment names here, simplifying for POC -->
            </div>
             <div class="actions" style="display: flex; flex-direction: column; gap: 8px;">
                ${j.status !== 'terminado' ? `<button onclick="finishJob('${j.id}', event)" class="secondary-btn small" style="color: var(--accent-color);">✔️ Terminar</button>` : ''}
                <button onclick="deleteJob('${j.id}', event)" class="primary-btn small" style="background-color: var(--danger-color);">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

function renderItemJobsList(jobs) {
    const container = document.getElementById('item-jobs-list');
    if (!container) return;

    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p>No hay trabajos para este item.</p>';
        return;
    }

    container.innerHTML = jobs.map(j => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h4 style="color: var(--accent-color); margin-bottom: 4px;">${j.description || 'Sin descripción'}</h4>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">Estado: ${j.status}</p>
                <p style="font-size: 0.9rem; color: var(--accent-hover);">$${j.price || 0}</p>
            </div>
             <div class="actions" style="display: flex; flex-direction: column; gap: 8px;">
                ${j.status !== 'terminado' ? `<button onclick="finishJob('${j.id}', event)" class="secondary-btn small" style="color: var(--accent-color);">✔️</button>` : ''}
                <button onclick="deleteJob('${j.id}', event)" class="primary-btn small" style="background-color: var(--danger-color);">🗑️</button>
            </div>
        </div>
    `).join('');
}
