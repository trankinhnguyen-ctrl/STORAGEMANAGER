import type { TaiKhoan } from '../interface/type.js';

const ACCOUNTS_STORAGE_KEY = 'DANH_SACH_TAI_KHOAN';
const CURRENT_USER_STORAGE_KEY = 'CURRENT_USER';

const DEFAULT_ACCOUNTS: Omit<TaiKhoan, 'id'>[] = [
    { username: 'admin', password: '123456', hoTen: 'Quản lý hệ thống', role: 'QUAN_LY' },
    { username: 'staff', password: '123456', hoTen: 'Nhân viên bán hàng', role: 'NHAN_VIEN' }
];

export function initAccounts(): void {
    const existing = getStoredAccounts();
    if (existing.length > 0) return;

    const seededAccounts: TaiKhoan[] = DEFAULT_ACCOUNTS.map((account, index) => ({
        id: `TK_${index + 1}`,
        ...account
    }));

    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(seededAccounts));
}

export function getStoredAccounts(): TaiKhoan[] {
    try {
        const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        return raw ? JSON.parse(raw) as TaiKhoan[] : [];
    } catch {
        return [];
    }
}

export function saveAccounts(accounts: TaiKhoan[]): void {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

export function login(username: string, password: string): { success: boolean; user?: TaiKhoan; message: string } {
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

export function getCurrentUser(): TaiKhoan | null {
    try {
        const raw = sessionStorage.getItem(CURRENT_USER_STORAGE_KEY);
        return raw ? JSON.parse(raw) as TaiKhoan : null;
    } catch {
        return null;
    }
}

export function logout(): void {
    sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}

export function isLoggedIn(): boolean {
    return !!getCurrentUser();
}

export function getCurrentRole(): 'QUAN_LY' | 'NHAN_VIEN' | null {
    return getCurrentUser()?.role ?? null;
}
