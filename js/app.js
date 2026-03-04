import { initPWA } from './modules/ui/core.ui.js';
import { initRouter } from './router.js';
import { initClientsUI } from './modules/clients/clients.ui.js';
import { initEquipmentUI } from './modules/equipment/equipment.ui.js';
import { initItemsUI } from './modules/items/items.ui.js';
import { initJobsUI } from './modules/jobs/jobs.ui.js';
import { initPhotosUI } from './modules/photos/photos.ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('CRM App iniciando...');

    initPWA();

    initClientsUI();
    initEquipmentUI();
    initItemsUI();
    initJobsUI();
    initPhotosUI();

    initRouter();
});
