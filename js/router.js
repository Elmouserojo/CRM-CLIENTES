import { updateBreadcrumb } from './modules/ui/core.ui.js';

export function initRouter() {
    window.addEventListener('hashchange', handleRouteChange);

    // Trigger on first load
    handleRouteChange();
}

function handleRouteChange() {
    const hash = window.location.hash || '#/clients';

    // Hide all views first
    document.querySelectorAll('.view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    // Simple mock router logic for drill-down views
    if (hash === '#/clients' || hash === '') {
        document.getElementById('view-clients').style.display = 'block';
        document.getElementById('nav-clients')?.classList.add('active');
        updateBreadcrumb([]); // Hide breadcrumb on root
    } else if (hash.startsWith('#/client/')) {
        const id = hash.split('/')[2];
        const view = document.getElementById('view-client-detail');
        if (view) {
            view.style.display = 'block';
            view.dataset.id = id;
            // trigger custom event to notify module
            window.dispatchEvent(new CustomEvent('nav-client-detail', { detail: { id } }));
        }
    } else if (hash.startsWith('#/equipment/')) {
        const id = hash.split('/')[2];
        const view = document.getElementById('view-equipment-detail');
        if (view) {
            view.style.display = 'block';
            view.dataset.id = id;
            window.dispatchEvent(new CustomEvent('nav-equipment-detail', { detail: { id } }));
        }
    } else if (hash.startsWith('#/item/')) {
        const id = hash.split('/')[2];
        const view = document.getElementById('view-item-detail');
        if (view) {
            view.style.display = 'block';
            view.dataset.id = id;
            window.dispatchEvent(new CustomEvent('nav-item-detail', { detail: { id } }));
        }
    } else if (hash === '#/jobs') {
        document.getElementById('view-jobs').style.display = 'block';
        document.getElementById('nav-jobs')?.classList.add('active');
        updateBreadcrumb([]); // Hide breadcrumb on root
    }
}
