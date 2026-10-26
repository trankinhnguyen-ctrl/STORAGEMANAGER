import type {SanPham} from '../interface/type.js';
import {getSanPhamList, saveSanPhamlist} from './storage.js';

function generateUniqueProductId(existing: SanPham[]): string {
    let id = '';
    let attempts = 0;

    do {
        id = `SP_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        attempts += 1;
    } while (existing.some(item => item.id === id) && attempts < 20);

    return id;
}

function normalizeProductIds(list: SanPham[]): SanPham[] {
    const normalized: SanPham[] = [];
    const seen = new Set<string>();

    for (const item of list) {
        let id = item.id;

        if (!id || seen.has(id)) {
            id = generateUniqueProductId(normalized);
        }

        seen.add(id);
        normalized.push({ ...item, id });
    }

    return normalized;
}

export function layDanhSachSanPham(): SanPham[]{
    const danhSach = getSanPhamList();
    const normalized = normalizeProductIds(danhSach);

    if (normalized.length !== danhSach.length || normalized.some((item, index) => item.id !== danhSach[index]?.id)) {
        saveSanPhamlist(normalized);
    }

    return normalized;
}

export function themSanPham(sanPhamMoi: Omit<SanPham, 'id'>): SanPham{
    const danhSach = layDanhSachSanPham();
    const sanPhamHoanChinh: SanPham = {
        id: generateUniqueProductId(danhSach),
        ...sanPhamMoi,
        trangThai: sanPhamMoi.trangThai || `Còn Hàng`
    };
    const danhSachMoi = [...danhSach, sanPhamHoanChinh];
    saveSanPhamlist(danhSachMoi);
    return sanPhamHoanChinh;
}

export function capNhapSanPham(id: string, thongTinCapNhap: Partial<SanPham>): SanPham | null{
    const danhSach = layDanhSachSanPham();
    const index = danhSach.findIndex(sp => sp.id === id);
    if (index === -1){
        console.error("không tìm thấy sản phẩm");
        return null;
    }
    const danhSachMoi = [...danhSach];
    danhSachMoi[index] = {
        ...danhSachMoi[index],
        ...thongTinCapNhap
    };
    saveSanPhamlist(danhSachMoi);
    return danhSachMoi[index];
}

export function xoaSanPham(id: string): boolean{
    const danhSach = layDanhSachSanPham();
    const lengthBanDau = danhSach.length;
    const danhSachMoi = danhSach.filter(sp => sp.id !== id);

    if (danhSachMoi.length === lengthBanDau) {
        console.error(`Không tìm thấy sản phẩm để xóa với ID: ${id}`);
        return false;
    }

    saveSanPhamlist(danhSachMoi);
    return true;
}

export function timKiemSanPham(tuKhoa: string): SanPham[] {
    const danhSach = layDanhSachSanPham();
    const keyword = tuKhoa.toLowerCase().trim();
    if (!keyword) return danhSach;

    return danhSach.filter(sp => sp.ten.toLowerCase().includes(keyword));
}

export function locTheoTheLoai(theLoai: string): SanPham[] {
    const danhSach = layDanhSachSanPham();
    if (!theLoai || theLoai === 'Tất cả') return danhSach;

    return danhSach.filter(sp => sp.theLoai === theLoai);
}