export interface SanPham{
    id: string;
    ten: string; 
    theLoai: string;
    size: number;
    mau: string;
    tonKho: number;
    gia: number;
    trangThai: `Còn Hàng`|`Hết hàng`;
}

export interface TaiKhoan {
    id: string;
    username: string;
    password: string;
    hoTen: string;
    role: 'QUAN_LY' | 'NHAN_VIEN';
}

export interface tieuThuong{
    id: string;
    ten: string;
    sdt: string;
    diaChi: string;
    ngayTao: string;
}
export interface ChiTietHoaDon{
    SanPhamid: string;
    ten: string;
    size: number;
    mau: string;
    gia: number
    soLuongMua: number;
    thanhTien: number;
}
export interface HoaDon{
    id:string;
    tieuThuongId: string;
    tenTieuThuong: string;
    danhSachSanPham: ChiTietHoaDon[];
    tongTien: number;
    daThanhToan: number;
    conNo: number;
    ngayTao: number;
    trangThaiThanhtoan: `chưa thanh toán`|`đã thanh toán`;
}