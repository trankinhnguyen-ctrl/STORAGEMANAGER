import { getHoaDonList, saveHoaDonlist } from './storage.js';
export function getDanhSachCongNo() {
    const hoaDonList = getHoaDonList();
    return hoaDonList.filter((hd) => hd.conNo >= 0);
}
export function getHoaDonTheoId(hoaDonId) {
    return getHoaDonList().find((hd) => hd.id === hoaDonId);
}
export function thucHienThuNo(hoaDonId, soTienTraThem) {
    const hoaDonList = getHoaDonList();
    const hoaDon = hoaDonList.find((hd) => hd.id === hoaDonId);
    if (!hoaDon) {
        return { success: false, message: 'Không tìm thấy hóa đơn công nợ trong hệ thống!' };
    }
    if (soTienTraThem <= 0) {
        return { success: false, message: 'Số tiền trả thêm phải lớn hơn 0!' };
    }
    if (soTienTraThem > hoaDon.conNo) {
        return {
            success: false,
            message: `Số tiền trả không được vượt quá số tiền còn nợ (${hoaDon.conNo.toLocaleString('vi-VN')} đ)!`
        };
    }
    hoaDon.daThanhToan += soTienTraThem;
    hoaDon.conNo -= soTienTraThem;
    if (hoaDon.conNo === 0) {
        hoaDon.trangThaiThanhtoan = 'đã thanh toán';
    }
    saveHoaDonlist(hoaDonList);
    return { success: true, message: 'Thu nợ thành công và đã cập nhật hệ thống!' };
}
export function capNhatCongNo(hoaDonId, soTienNoMoi) {
    const hoaDonList = getHoaDonList();
    const hoaDon = hoaDonList.find((hd) => hd.id === hoaDonId);
    if (!hoaDon) {
        return { success: false, message: 'Không tìm thấy hóa đơn công nợ trong hệ thống!' };
    }
    if (soTienNoMoi < 0) {
        return { success: false, message: 'Số nợ mới không được nhỏ hơn 0!' };
    }
    if (soTienNoMoi > hoaDon.tongTien) {
        return {
            success: false,
            message: `Số nợ mới không được vượt quá tổng tiền hóa đơn (${hoaDon.tongTien.toLocaleString('vi-VN')} đ)!`
        };
    }
    hoaDon.conNo = soTienNoMoi;
    hoaDon.daThanhToan = Math.max(0, hoaDon.tongTien - soTienNoMoi);
    hoaDon.trangThaiThanhtoan = soTienNoMoi === 0 ? 'đã thanh toán' : 'chưa thanh toán';
    saveHoaDonlist(hoaDonList);
    return {
        success: true,
        message: `Cập nhật số nợ thành công. Số nợ hiện tại: ${hoaDon.conNo.toLocaleString('vi-VN')} đ.`
    };
}
