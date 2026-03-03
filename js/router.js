export function initRouter() {
    const navClients = document.getElementById('nav-clients');
    const navJobs = document.getElementById('nav-jobs');

    const viewClients = document.getElementById('view-clients');
    const viewJobs = document.getElementById('view-jobs');

    function switchView(viewName) {
        if (viewName === 'clients') {
            navClients.classList.add('active');
            navJobs.classList.remove('active');
            viewClients.style.display = 'block';
            viewJobs.style.display = 'none';
        } else {
            navClients.classList.remove('active');
            navJobs.classList.add('active');
            viewClients.style.display = 'none';
            viewJobs.style.display = 'block';
        }
    }

    navClients.addEventListener('click', () => switchView('clients'));
    navJobs.addEventListener('click', () => switchView('jobs'));
}
