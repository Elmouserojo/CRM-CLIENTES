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

    initAccordion();
}

function initAccordion() {
    document.addEventListener('click', (e) => {
        const header = e.target.closest('.accordion-header');
        if (!header) return;

        const currentItem = header.parentElement;
        const accordion = currentItem.closest('.accordion');

        // Close all other items in this accordion
        accordion.querySelectorAll('.accordion-item').forEach(item => {
            if (item !== currentItem) {
                const itemHeader = item.querySelector('.accordion-header');
                const itemContent = item.querySelector('.accordion-content');
                if (itemHeader && itemContent) {
                    itemHeader.setAttribute('aria-expanded', 'false');
                    itemHeader.querySelector('.icon').textContent = '▶️';
                    itemContent.style.display = 'none';
                }
            }
        });

        // Toggle current item
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        const content = currentItem.querySelector('.accordion-content');
        const icon = header.querySelector('.icon');

        if (isExpanded) {
            header.setAttribute('aria-expanded', 'false');
            icon.textContent = '▶️';
            content.style.display = 'none';
        } else {
            header.setAttribute('aria-expanded', 'true');
            icon.textContent = '🔽';
            content.style.display = 'block';
        }
    });
}

export function updateBreadcrumb(items) {
    const container = document.getElementById('breadcrumb-area');
    const backBtn = document.getElementById('header-back-btn');

    if (!items || items.length === 0) {
        container.style.display = 'none';
        backBtn.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    backBtn.style.display = 'flex';

    // Set back button link to the previous item, or root if only 1 item
    if (items.length > 1) {
        backBtn.href = items[items.length - 2].link;
    } else {
        backBtn.href = '#/';
    }

    container.innerHTML = items.map((item, index) => {
        const isLast = index === items.length - 1;
        return isLast
            ? `<span>${item.label}</span>`
            : `<a href="${item.link}">${item.label}</a> <span>></span>`;
    }).join(' ');
}
