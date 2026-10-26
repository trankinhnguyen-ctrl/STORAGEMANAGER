import { getDanhSachTieuThuong } from './tieuthuong.js';
import { getSanPhamList, saveSanPhamlist, getHoaDonList, saveHoaDonlist } from './storage.js';
// 1. Lấy danh sách sản phẩm khả dụng từ kho
export function getKhoSanPhamChoPOS() {
    return getSanPhamList();
}
// 2. Lấy danh sách tiểu thương cho thẻ select
export function getDanhSachTieuThuongChoPOS() {
    return getDanhSachTieuThuong();
}
// 3. Xử lý logic nghiệp vụ xuất bán & thanh toán (Checkout)
export function thucHienXuatBan(tieuThuongId, cartItems, daThanhToan) {
    // Kiểm tra ràng buộc bắt buộc chọn tiểu thương
    if (!tieuThuongId) {
        return { success: false, message: 'Vui lòng chọn đại lý / tiểu thương mua hàng!' };
    }
    // Kiểm tra giỏ hàng trống
    if (cartItems.length === 0) {
        return { success: false, message: 'Giỏ hàng đang trống, vui lòng chọn sản phẩm!' };
    }
    // Lấy thông tin tiểu thương để gán vào hóa đơn
    const tieuThuongList = getDanhSachTieuThuong();
    const tt = tieuThuongList.find(t => t.id === tieuThuongId);
    const tenTieuThuong = tt ? tt.ten : 'Khách lẻ';
    // Tính tổng giá trị đơn hàng
    const tongTien = cartItems.reduce((sum, item) => sum + item.thanhTien, 0);
    // Kiểm tra tính hợp lệ của số tiền khách trả trước
    if (daThanhToan < 0 || daThanhToan > tongTien) {
        return { success: false, message: 'Số tiền khách trả trước không hợp lệ!' };
    }
    const conNo = tongTien - daThanhToan;
    const trangThaiThanhtoan = conNo === 0 ? 'đã thanh toán' : 'chưa thanh toán';
    // Chuẩn bị chi tiết hóa đơn khớp với interface ChiTietHoaDon
    const danhSachSanPham = cartItems.map(item => ({
        SanPhamid: item.SanPhamid,
        ten: item.ten,
        size: item.size,
        mau: item.mau,
        gia: item.gia,
        soLuongMua: item.soLuongMua,
        thanhTien: item.thanhTien
    }));
    // Tạo đối tượng hóa đơn mới khớp với interface HoaDon
    const newHoaDon = {
        id: 'HD_' + Date.now(),
        tieuThuongId,
        tenTieuThuong,
        danhSachSanPham,
        tongTien,
        daThanhToan,
        conNo,
        ngayTao: Date.now(),
        trangThaiThanhtoan
    };
    // --- BƯỚC A: LƯU HÓA ĐƠN VÀO LOCALSTORAGE ---
    const hoaDonList = getHoaDonList();
    hoaDonList.push(newHoaDon);
    saveHoaDonlist(hoaDonList);
    // --- BƯỚC B: TRỪ TỒN KHO GỐC THÔNG QUA STORAGE HELPER ---
    const khoList = getSanPhamList();
    cartItems.forEach(item => {
        const sanPham = khoList.find(p => p.id === item.SanPhamid);
        if (sanPham) {
            sanPham.tonKho -= item.soLuongMua;
            if (sanPham.tonKho <= 0) {
                sanPham.tonKho = 0;
                sanPham.trangThai = 'Hết hàng'; // Khớp với union type trong interface SanPham của bạn
            }
        }
    });
    saveSanPhamlist(khoList);
    return {
        success: true,
        message: conNo > 0
            ? 'Xuất bán thành công! Kho đã được trừ và khoản nợ đã được ghi nhận.'
            : 'Xuất bán thành công! Đơn hàng đã thanh toán đủ.'
    };
}
