export function initPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registrado con éxito con el scope: ', registration.scope);
                })
                .catch(err => {
                    console.error('Falló el registro del ServiceWorker: ', err);
                });
        });
    }
}
