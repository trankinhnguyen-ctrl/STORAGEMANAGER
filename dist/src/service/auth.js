const ACCOUNTS_STORAGE_KEY = 'DANH_SACH_TAI_KHOAN';
const CURRENT_USER_STORAGE_KEY = 'CURRENT_USER';
const DEFAULT_ACCOUNTS = [
    { username: 'admin', password: '123456', hoTen: 'Quản lý hệ thống', role: 'QUAN_LY' },
    { username: 'staff', password: '123456', hoTen: 'Nhân viên bán hàng', role: 'NHAN_VIEN' }
];
export function initAccounts() {
    const existing = getStoredAccounts();
    if (existing.length > 0)
        return;
    const seededAccounts = DEFAULT_ACCOUNTS.map((account, index) => ({
        id: `TK_${index + 1}`,
        ...account
    }));
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(seededAccounts));
}
export function getStoredAccounts() {
    try {
        const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    catch {
        return [];
    }
}
export function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}
export function login(username, password) {
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();
    if (!normalizedUsername || !normalizedPassword) {
        return { success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' };
    }
    const account = getStoredAccounts().find((item) => {
        return item.username === normalizedUsername && item.password === normalizedPassword;
    });
    if (!account) {
        return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' };
    }
    sessionStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(account));
    return { success: true, user: account, message: 'Đăng nhập thành công.' };
}
export function getCurrentUser() {
    try {
        const raw = sessionStorage.getItem(CURRENT_USER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
export function logout() {
    sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}
export function isLoggedIn() {
    return !!getCurrentUser();
}
export function getCurrentRole() {
    return getCurrentUser()?.role ?? null;
}
