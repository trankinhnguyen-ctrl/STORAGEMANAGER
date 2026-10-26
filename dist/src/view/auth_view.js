import { getCurrentUser } from '../service/auth.js';
export function renderLoginModal() {
    const existing = document.getElementById('loginModal');
    if (existing)
        return;
    const modalHtml = `
        <div class="modal fade" id="loginModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content shadow-lg border-0">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title fw-bold"><i class="fa-solid fa-right-to-bracket me-2"></i>Đăng nhập hệ thống</h5>
                    </div>
                    <div class="modal-body p-4">
                        <form id="form-login">
                            <div class="mb-3">
                                <label class="form-label fw-semibold">Tên đăng nhập</label>
                                <input type="text" id="login-username" class="form-control" placeholder="Nhập username" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-semibold">Mật khẩu</label>
                                <input type="password" id="login-password" class="form-control" placeholder="Nhập mật khẩu" required>
                            </div>
                            <div class="alert alert-danger d-none" id="login-error"></div>
                            <button type="submit" class="btn btn-primary w-100 fw-bold">Đăng nhập</button>
                        </form>
                        <div class="mt-3 small text-muted">
                            Tài khoản mẫu: <strong>admin / 123456</strong> hoặc <strong>staff / 123456</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}
export function showLoginModal() {
    renderLoginModal();
    const modalEl = document.getElementById('loginModal');
    if (!modalEl)
        return;
    const modalInstance = window.bootstrap?.Modal;
    if (modalInstance) {
        const instance = modalInstance.getInstance(modalEl) ?? new modalInstance(modalEl);
        instance.show();
    }
}
export function hideLoginModal() {
    const modalEl = document.getElementById('loginModal');
    if (!modalEl)
        return;
    const modalInstance = window.bootstrap?.Modal;
    if (modalInstance) {
        const instance = modalInstance.getInstance(modalEl) ?? new modalInstance(modalEl);
        instance.hide();
    }
}
export function toggleAppShell(visible) {
    const shell = document.getElementById('app-shell');
    if (!shell)
        return;
    shell.classList.toggle('hidden', !visible);
}
export function applyPermissions() {
    const currentUser = getCurrentUser();
    const isManager = currentUser?.role === 'QUAN_LY';
    const managerOnlyControls = document.querySelectorAll('[data-role-guard="manager"]');
    managerOnlyControls.forEach((element) => {
        const htmlElement = element;
        htmlElement.style.display = isManager ? '' : 'none';
        if (htmlElement instanceof HTMLButtonElement) {
            htmlElement.disabled = !isManager;
        }
    });
    const tabs = document.querySelectorAll('#mainTab .nav-link');
    tabs.forEach((tab) => {
        const target = tab.getAttribute('data-bs-target');
        if (!target)
            return;
        const shouldHide = !isManager && (target === '#content-tieuthuong' || target === '#content-congno');
        tab.style.display = shouldHide ? 'none' : '';
    });
    const userLabel = document.getElementById('user-role-label');
    if (userLabel) {
        userLabel.textContent = currentUser ? `${currentUser.hoTen} (${currentUser.role === 'QUAN_LY' ? 'Quản lý' : 'Nhân viên'})` : 'Chưa đăng nhập';
    }
}
export function renderHeaderLoginInfo() {
    const navbar = document.querySelector('.navbar');
    if (!navbar)
        return;
    const user = getCurrentUser();
    const username = user ? user.hoTen : 'Khách';
    const roleText = user ? (user.role === 'QUAN_LY' ? 'Quản lý' : 'Nhân viên') : 'Chưa đăng nhập';
    const existing = document.getElementById('auth-user-badge');
    if (existing)
        existing.remove();
    const badge = document.createElement('div');
    badge.id = 'auth-user-badge';
    badge.className = 'd-flex align-items-center gap-2 ms-3 text-white';
    badge.innerHTML = `
        <span class="badge bg-white text-dark px-3 py-2 rounded-pill fw-semibold">
            <i class="fa-solid fa-user me-1"></i> ${username}
        </span>
        <span class="small text-white-50">${roleText}</span>
        <button class="btn btn-sm btn-outline-light" id="btn-logout" type="button">
            <i class="fa-solid fa-right-from-bracket me-1"></i> Đăng xuất
        </button>
    `;
    navbar.querySelector('.navbar-collapse')?.appendChild(badge);
}
