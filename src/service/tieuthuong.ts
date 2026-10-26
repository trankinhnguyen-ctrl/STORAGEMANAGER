import type { tieuThuong } from '../interface/type.js';

const STORAGE_KEY = 'TIEU_THUONG';

const DANH_SACH_MAU: Omit<tieuThuong, 'id'>[] = [
    { ten: 'Đại lý Minh Anh', sdt: '0901234567', diaChi: 'Quận 1, TP.HCM', ngayTao: '2026-10-01' },
    { ten: 'Đại lý Hồng Phúc', sdt: '0902345678', diaChi: 'Quận 3, TP.HCM', ngayTao: '2026-10-02' },
    { ten: 'Đại lý Bách Khoa', sdt: '0903456789', diaChi: 'Quận 7, TP.HCM', ngayTao: '2026-10-03' },
    { ten: 'Đại lý Long Vân', sdt: '0904567890', diaChi: 'Quận 10, TP.HCM', ngayTao: '2026-10-04' },
    { ten: 'Đại lý Sông Lam', sdt: '0905678901', diaChi: 'Quận 5, TP.HCM', ngayTao: '2026-10-05' },
    { ten: 'Đại lý Hòa Bình', sdt: '0906789012', diaChi: 'Bình Dương', ngayTao: '2026-10-06' },
    { ten: 'Đại lý Thế Giới', sdt: '0907890123', diaChi: 'Đồng Nai', ngayTao: '2026-10-07' },
    { ten: 'Đại lý Vĩnh Cửu', sdt: '0908901234', diaChi: 'Vũng Tàu', ngayTao: '2026-10-08' },
    { ten: 'Đại lý Thành Công', sdt: '0909012345', diaChi: 'Cần Thơ', ngayTao: '2026-10-09' },
    { ten: 'Đại lý Nam Việt', sdt: '0900123456', diaChi: 'Hà Nội', ngayTao: '2026-10-10' }
];

function ensureDanhSachMau(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: tieuThuong[] = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(existing)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return;
    }

    if (existing.length >= 10) {
        return;
    }

    const merged = [...existing];
    for (const item of DANH_SACH_MAU) {
        const existed = merged.some((entry) => entry.ten === item.ten && entry.sdt === item.sdt);
        if (!existed) {
            merged.push({
                id: `TT_${Date.now()}_${merged.length + 1}`,
                ...item
            });
        }
        if (merged.length >= 10) break;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged.slice(0, 10)));
}

export function getDanhSachTieuThuong(): tieuThuong[] {
    ensureDanhSachMau();
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveDanhSachTieuThuong(danhSach: tieuThuong[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(danhSach));
}

export function themTieuThuong(item: Omit<tieuThuong, 'id' | 'ngayTao'>): tieuThuong {
    const danhSach = getDanhSachTieuThuong();
    const newItem: tieuThuong = {
        id: 'TT_' + Date.now(),
        ...item,
        ngayTao: new Date().toISOString().split('T')[0]
    };
    danhSach.push(newItem);
    saveDanhSachTieuThuong(danhSach);
    return newItem;
}

export function capNhatTieuThuong(id: string, item: Partial<Omit<tieuThuong, 'id'>>): tieuThuong | null {
    const danhSach = getDanhSachTieuThuong();
    const index = danhSach.findIndex((entry) => entry.id === id);

    if (index === -1) return null;

    danhSach[index] = { ...danhSach[index], ...item };
    saveDanhSachTieuThuong(danhSach);
    return danhSach[index];
}

export function xoaTieuThuong(id: string): void {
    let danhSach = getDanhSachTieuThuong();
    danhSach = danhSach.filter((item) => item.id !== id);
    saveDanhSachTieuThuong(danhSach);
}

export function timKiemTieuThuong(keyword: string): tieuThuong[] {
    const query = keyword.trim().toLowerCase();
    if (!query) return getDanhSachTieuThuong();

    return getDanhSachTieuThuong().filter((item) =>
        item.ten.toLowerCase().includes(query) || item.sdt.toLowerCase().includes(query)
    );
}
