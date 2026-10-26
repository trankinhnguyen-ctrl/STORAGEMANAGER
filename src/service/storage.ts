import type { SanPham, tieuThuong, HoaDon } from '../interface/type.js';
const STORAGE_KEY = {
    SAN_PHAM : 'SANPHAM_LIST',
    TIEU_THUONG : 'TIEU_THUONG',
    HOA_DON : 'HOADON_LIST'
};

export function getData<T>(key: string): T[] {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Lỗi hệ thống:', error);
        return [];
    }
}

export function saveData<T>(key: string, data: T[]): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Lỗi hệ thống:', error);
    }
}

export function initLocalStorage(): void {}; 

export const getSanPhamList = (): SanPham[] =>
    getData<SanPham>(STORAGE_KEY.SAN_PHAM);
export const saveSanPhamlist = (list: SanPham[]): void => 
    saveData<SanPham>(STORAGE_KEY.SAN_PHAM, list);

export const gettieuThuongList = (): tieuThuong[] =>
    getData<tieuThuong>(STORAGE_KEY.TIEU_THUONG);
export const savetieuThuongList = (list: tieuThuong[]): void =>
    saveData<tieuThuong>(STORAGE_KEY.TIEU_THUONG, list);

export const getHoaDonList = (): HoaDon[] =>
    getData<HoaDon>(STORAGE_KEY.HOA_DON);
export const saveHoaDonlist = (list: HoaDon[]): void =>
    saveData<HoaDon>(STORAGE_KEY.HOA_DON, list);
