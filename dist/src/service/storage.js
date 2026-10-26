const STORAGE_KEY = {
    SAN_PHAM: 'SANPHAM_LIST',
    TIEU_THUONG: 'TIEU_THUONG',
    HOA_DON: 'HOADON_LIST'
};
export function getData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }
    catch (error) {
        console.error('Lỗi hệ thống:', error);
        return [];
    }
}
export function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    }
    catch (error) {
        console.error('Lỗi hệ thống:', error);
    }
}
export function initLocalStorage() { }
;
export const getSanPhamList = () => getData(STORAGE_KEY.SAN_PHAM);
export const saveSanPhamlist = (list) => saveData(STORAGE_KEY.SAN_PHAM, list);
export const gettieuThuongList = () => getData(STORAGE_KEY.TIEU_THUONG);
export const savetieuThuongList = (list) => saveData(STORAGE_KEY.TIEU_THUONG, list);
export const getHoaDonList = () => getData(STORAGE_KEY.HOA_DON);
export const saveHoaDonlist = (list) => saveData(STORAGE_KEY.HOA_DON, list);
