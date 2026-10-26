import { initAccounts, isLoggedIn, login, logout } from '../service/auth.js';
import { applyPermissions, hideLoginModal, renderHeaderLoginInfo, showLoginModal, toggleAppShell } from '../view/auth_view.js';
import { initBanHangModule } from './banhang_envent.js';
import { initCongNoEvents } from './congNo_envent.js';
import { initKhoApp } from './kho_event.js';
import { initTieuThuongModule } from './tieuthuong_event.js';
function bootApp() {
    initKhoApp();
    initTieuThuongModule();
    initBanHangModule();
    initCongNoEvents();
    applyPermissions();
    renderHeaderLoginInfo();
    toggleAppShell(true);
}
let hasBoundLoginForm = false;
function bindLoginForm() {
    const loginForm = document.getElementById('form-login');
    if (!loginForm || hasBoundLoginForm)
        return;
    hasBoundLoginForm = true;
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const loginError = document.getElementById('login-error');
        if (!usernameInput || !passwordInput || !loginError)
            return;
        const result = login(usernameInput.value, passwordInput.value);
        if (!result.success) {
            loginError.textContent = result.message;
            loginError.classList.remove('d-none');
            return;
        }
        loginError.textContent = '';
        loginError.classList.add('d-none');
        hideLoginModal();
        bootApp();
    });
}
export function initAuthModule() {
    initAccounts();
    if (!isLoggedIn()) {
        showLoginModal();
        bindLoginForm();
        toggleAppShell(false);
        return;
    }
    hideLoginModal();
    bootApp();
}
document.addEventListener('click', (event) => {
    const target = event.target;
    if (target.closest('#btn-logout')) {
        logout();
        toggleAppShell(false);
        const loginError = document.getElementById('login-error');
        if (loginError) {
            loginError.textContent = '';
            loginError.classList.add('d-none');
        }
        showLoginModal();
        bindLoginForm();
    }
});
