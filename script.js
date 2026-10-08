const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

const reservationModal = document.querySelector('#reservation-modal');
const openReservationModalButton = document.querySelector('#open-reservation-modal');
const closeReservationModalButton = document.querySelector('#close-reservation-modal');
const modalCopyPhoneButton = document.querySelector('#modal-copy-phone');
const copyStatus = document.querySelector('#copy-status');

const reservationPhone = '+359879333177';
const reservationPhoneDisplay = '087 933 3177';

let lastFocusedElement = null;

function updateNavbar() {
    if (!navbar) {
        return;
    }

    if (window.scrollY > 24) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function closeMobileMenu() {
    if (!navbar || !menuToggle) {
        return;
    }

    navbar.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Отвори менюто');
}

function openMobileMenu() {
    if (!navbar || !menuToggle) {
        return;
    }

    navbar.classList.add('menu-open');
    document.body.classList.add('menu-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Затвори менюто');
}

async function copyPhoneNumber(statusElement) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(reservationPhoneDisplay);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = reservationPhoneDisplay;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
        }

        if (statusElement) {
            statusElement.textContent = 'Номерът е копиран.';
            window.setTimeout(() => {
                statusElement.textContent = '';
            }, 2500);
        }
    } catch (error) {
        if (statusElement) {
            statusElement.textContent = 'Не успяхме да копираме номера. Моля, копирайте го ръчно.';
        }
    }
}

function getModalFocusableElements() {
    if (!reservationModal) {
        return [];
    }

    return Array.from(
        reservationModal.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
    );
}

function openReservationModal() {
    if (!reservationModal) {
        return;
    }

    lastFocusedElement = document.activeElement;
    reservationModal.hidden = false;
    document.body.classList.add('modal-open');

    window.requestAnimationFrame(() => {
        closeReservationModalButton?.focus();
    });
}

function closeReservationModal() {
    if (!reservationModal || reservationModal.hidden) {
        return;
    }

    reservationModal.hidden = true;
    document.body.classList.remove('modal-open');

    if (copyStatus) {
        copyStatus.textContent = '';
    }

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }
}

updateNavbar();
window.addEventListener('scroll', updateNavbar, { passive: true });

if (navbar && menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    mobileNavLinks.forEach((link) => {
        link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (event) => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        const clickedInsideMenu = mobileMenu.contains(event.target);
        const clickedToggle = menuToggle.contains(event.target);

        if (isOpen && !clickedInsideMenu && !clickedToggle) {
            closeMobileMenu();
        }
    });
}

openReservationModalButton?.addEventListener('click', openReservationModal);
closeReservationModalButton?.addEventListener('click', closeReservationModal);

reservationModal?.querySelector('[data-close-modal]')?.addEventListener('click', closeReservationModal);

modalCopyPhoneButton?.addEventListener('click', () => {
    copyPhoneNumber(copyStatus);
});


reservationModal?.addEventListener('click', (event) => {
    if (event.target === reservationModal) {
        closeReservationModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeMobileMenu();
        closeReservationModal();
        return;
    }

    if (event.key === 'Tab' && reservationModal && !reservationModal.hidden) {
        const focusable = getModalFocusableElements();

        if (focusable.length === 0) {
            event.preventDefault();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
        closeMobileMenu();
    }
});
