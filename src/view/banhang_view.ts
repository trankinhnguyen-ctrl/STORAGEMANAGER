import type { SanPham, tieuThuong } from '../interface/type.js';
import type { CartItem } from '../service/banhang.js';

// 1. Render dropdown danh sách tiểu thương
export function renderSelectTieuThuong(danhSach: tieuThuong[]): void {
    const inputEl = document.getElementById('select-pos-tieuthuong') as HTMLInputElement | null;
    const suggestionEl = document.getElementById('select-pos-tieuthuong-suggestions');
    const hiddenIdEl = document.getElementById('select-pos-tieuthuong-id') as HTMLInputElement | null;

    if (!inputEl || !suggestionEl || !hiddenIdEl) return;

    if (danhSach.length === 0) {
        inputEl.value = '';
        hiddenIdEl.value = '';
        suggestionEl.innerHTML = '<div class="list-group-item text-muted">Chưa có đại lý nào</div>';
        suggestionEl.classList.remove('d-none');
        return;
    }

    hiddenIdEl.value = '';
    inputEl.value = '';
    inputEl.placeholder = 'Tìm kiếm đại lý / tiểu thương...';
    suggestionEl.innerHTML = '';
    suggestionEl.classList.add('d-none');
}

// 2. Render danh sách sản phẩm khả dụng (tonKho > 0) ở cột phải
export function renderPosDanhSachSanPham(danhSach: SanPham[]): void {
    const listEl = document.getElementById('pos-list-sanpham');
    if (!listEl) return;

    const sanPhamKhaDung = danhSach.filter(sp => sp.tonKho > 0);

    if (sanPhamKhaDung.length === 0) {
        listEl.innerHTML = `<div class="p-3 text-center text-muted">Không có sản phẩm nào khả dụng trong kho.</div>`;
        return;
    }

    listEl.innerHTML = sanPhamKhaDung.map(sp => `
        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 pos-sp-item" data-id="${sp.id}">
            <div>
                <h6 class="mb-1 fw-bold text-dark">${sp.ten}</h6>
                <small class="text-muted">Thể loại: ${sp.theLoai} | Size: ${sp.size} | Màu: ${sp.mau}</small><br>
                <small class="text-primary fw-semibold">Kho: ${sp.tonKho} | Giá: ${sp.gia.toLocaleString()} VNĐ</small>
            </div>
            <button class="btn btn-sm btn-outline-primary fw-bold px-2 py-1">
                <i class="fa-solid fa-cart-plus"></i> Chọn
            </button>
        </div>
    `).join('');
}

// 3. Render bảng giỏ hàng (cart items)
export function renderCartItems(cartItems: CartItem[]): void {
    const tbody = document.getElementById('cart-pos-items');
    if (!tbody) return;

    if (cartItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    Chưa có sản phẩm nào trong giỏ hàng.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = cartItems.map((item, index) => `
        <tr>
            <td>
                <strong>${item.ten}</strong>
            </td>
            <td>Size ${item.size} / ${item.mau}</td>
            <td>
                <input type="number" class="form-control form-control-sm input-soluong-mua" 
                       data-index="${index}" value="${item.soLuongMua}" min="1" max="${item.tonKhoHienTai}" style="width: 70px;">
            </td>
            <td>${item.gia.toLocaleString()} VNĐ</td>
            <td class="fw-bold text-success">${item.thanhTien.toLocaleString()} VNĐ</td>
            <td>
                <button class="btn btn-sm btn-outline-danger btn-xoa-cart" data-index="${index}" title="Xóa món">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 4. Cập nhật tổng tiền và tính tiền còn nợ lên giao diện
export function updateTienThanhToan(tongTien: number, daThanhToan: number): void {
    const lblTongTien = document.getElementById('pos-tong-tien');
    const inputConNo = document.getElementById('pos-con-no') as HTMLInputElement;

    if (lblTongTien) {
        lblTongTien.textContent = `${tongTien.toLocaleString()} VNĐ`;
    }

    if (inputConNo) {
        const conNo = Math.max(0, tongTien - daThanhToan);
        inputConNo.value = `${conNo.toLocaleString()} VNĐ`;
    }
}