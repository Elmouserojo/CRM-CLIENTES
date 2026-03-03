import { initPWA } from './modules/ui/core.ui.js';
import { initRouter } from './router.js';
import { initClientsUI } from './modules/clients/clients.ui.js';
import { initJobsUI } from './modules/jobs/jobs.ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('CRM App iniciando...');

    initPWA();

    initClientsUI();
    initJobsUI();

    initRouter();
});
