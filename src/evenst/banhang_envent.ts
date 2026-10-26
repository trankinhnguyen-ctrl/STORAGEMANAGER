import { getKhoSanPhamChoPOS, getDanhSachTieuThuongChoPOS, CartItem, thucHienXuatBan } from '../service/banhang.js';
import { renderSelectTieuThuong, renderPosDanhSachSanPham, renderCartItems, updateTienThanhToan } from '../view/banhang_view.js';

let currentCart: CartItem[] = [];

export function initBanHangModule(): void {
    loadAndRenderPOSData();

    const dealerInput = document.getElementById('select-pos-tieuthuong') as HTMLInputElement | null;
    const suggestionEl = document.getElementById('select-pos-tieuthuong-suggestions');
    const hiddenIdEl = document.getElementById('select-pos-tieuthuong-id') as HTMLInputElement | null;

    if (dealerInput && suggestionEl) {
        const renderDealerSuggestions = (keyword: string) => {
            const list = getDanhSachTieuThuongChoPOS();
            const filtered = list.filter((tt) => {
                const text = `${tt.ten} ${tt.sdt} ${tt.diaChi}`.toLowerCase();
                return text.includes(keyword.toLowerCase());
            }).slice(0, 8);

            if (!keyword.trim() || filtered.length === 0) {
                suggestionEl.innerHTML = '<div class="list-group-item text-muted">Không tìm thấy đại lý phù hợp</div>';
                suggestionEl.classList.remove('d-none');
                return;
            }

            suggestionEl.innerHTML = filtered.map((tt) => `
                <button type="button" class="list-group-item list-group-item-action border-0 text-start" data-id="${tt.id}" data-text="${tt.ten} (${tt.sdt})">
                    <div class="fw-semibold">${tt.ten}</div>
                    <small class="text-muted">${tt.sdt} • ${tt.diaChi || 'Chưa có địa chỉ'}</small>
                </button>
            `).join('');

            suggestionEl.classList.remove('d-none');

            suggestionEl.querySelectorAll('button').forEach((item) => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-id');
                    const text = item.getAttribute('data-text') || '';
                    if (hiddenIdEl) hiddenIdEl.value = id || '';
                    dealerInput.value = text;
                    suggestionEl.classList.add('d-none');
                });
            });
        };

        dealerInput.addEventListener('input', () => renderDealerSuggestions(dealerInput.value));
        dealerInput.addEventListener('focus', () => renderDealerSuggestions(dealerInput.value));

        document.addEventListener('click', (event) => {
            const target = event.target as Node;
            if (!dealerInput.contains(target) && !suggestionEl.contains(target)) {
                suggestionEl.classList.add('d-none');
            }
        });
    }

    // 1. Tìm kiếm nhanh sản phẩm ở cột phải
    const searchInput = document.getElementById('search-pos-sp') as HTMLInputElement;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const keyword = searchInput.value.toLowerCase().trim();
            const kho = getKhoSanPhamChoPOS();
            const filtered = kho.filter(sp => sp.ten.toLowerCase().includes(keyword) || sp.theLoai.toLowerCase().includes(keyword));
            renderPosDanhSachSanPham(filtered);
        });
    }

    // 2. Thêm sản phẩm vào giỏ hàng khi click vào danh sách bên phải
    const listSanPhamEl = document.getElementById('pos-list-sanpham');
    if (listSanPhamEl) {
        listSanPhamEl.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const itemEl = target.closest('.pos-sp-item') as HTMLElement;
            if (!itemEl) return;

            const spId = itemEl.getAttribute('data-id');
            const kho = getKhoSanPhamChoPOS();
            const sp = kho.find(p => p.id === spId);

            if (!sp) return;

            const cartKey = `${sp.ten.trim()}|${sp.mau.trim().toLowerCase()}`;

            // Theo yêu cầu: khác tên thì tách dòng mới, cùng tên + cùng màu thì gộp vào 1 dòng
            const existingItem = currentCart.find(item => item.cartKey === cartKey);
            if (existingItem) {
                if (existingItem.soLuongMua + 1 > sp.tonKho) {
                    alert('Số lượng mua vượt quá tồn kho hiện tại!');
                    return;
                }
                existingItem.soLuongMua += 1;
                existingItem.thanhTien = existingItem.soLuongMua * existingItem.gia;
            } else {
                if (sp.tonKho < 1) {
                    alert('Sản phẩm này đã hết hàng!');
                    return;
                }
                currentCart.push({
                    cartKey,
                    SanPhamid: sp.id,
                    ten: sp.ten,
                    size: sp.size,
                    mau: sp.mau,
                    gia: sp.gia,
                    soLuongMua: 1,
                    thanhTien: sp.gia,
                    tonKhoHienTai: sp.tonKho
                });
            }

            refreshCartUI();
        });
    }

    // 3. Thay đổi số lượng mua hoặc xóa sản phẩm trong bảng giỏ hàng
    const cartTableBody = document.getElementById('cart-pos-items');
    if (cartTableBody) {
        cartTableBody.addEventListener('input', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('input-soluong-mua')) {
                const input = target as HTMLInputElement;
                const index = parseInt(input.getAttribute('data-index') || '0');
                let newQty = parseInt(input.value) || 1;

                if (newQty > currentCart[index].tonKhoHienTai) {
                    alert(`Số lượng tồn kho chỉ còn ${currentCart[index].tonKhoHienTai}!`);
                    newQty = currentCart[index].tonKhoHienTai;
                    input.value = newQty.toString();
                }

                if (newQty < 1) newQty = 1;

                currentCart[index].soLuongMua = newQty;
                currentCart[index].thanhTien = newQty * currentCart[index].gia;
                refreshCartUI();
            }
        });

        cartTableBody.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const btnXoa = target.closest('.btn-xoa-cart') as HTMLElement;
            if (btnXoa) {
                const index = parseInt(btnXoa.getAttribute('data-index') || '0');
                currentCart.splice(index, 1);
                refreshCartUI();
            }
        });
    }

    // 4. Lắng nghe thay đổi tiền khách trả trước để tính tiền nợ
    const inputDaThanhToan = document.getElementById('pos-da-thanhtoan') as HTMLInputElement;
    if (inputDaThanhToan) {
        inputDaThanhToan.addEventListener('input', () => {
            const tongTien = currentCart.reduce((sum, item) => sum + item.thanhTien, 0);
            const daTra = parseFloat(inputDaThanhToan.value) || 0;
            updateTienThanhToan(tongTien, daTra);
        });
    }

    // 5. Nút Xác nhận xuất bán & lưu đơn
    const btnXacNhan = document.getElementById('btn-xacnhan-xuatban');
    if (btnXacNhan) {
        btnXacNhan.addEventListener('click', () => {
            const searchInput = document.getElementById('select-pos-tieuthuong') as HTMLInputElement | null;
            const hiddenIdEl = document.getElementById('select-pos-tieuthuong-id') as HTMLInputElement | null;
            const tieuThuongId = hiddenIdEl?.value || '';
            const inputDaTra = document.getElementById('pos-da-thanhtoan') as HTMLInputElement;
            const daThanhToan = inputDaTra ? parseFloat(inputDaTra.value) || 0 : 0;

            const result = thucHienXuatBan(tieuThuongId, currentCart, daThanhToan);
            alert(result.message);

            if (result.success) {
                // Reset giỏ hàng và form
                currentCart = [];
                if (inputDaTra) inputDaTra.value = '0';
                if (searchInput) searchInput.value = '';
                if (hiddenIdEl) hiddenIdEl.value = '';
                loadAndRenderPOSData();
            }
        });
    }
}

// Hàm hỗ trợ load lại dữ liệu ban đầu cho tab POS
function loadAndRenderPOSData(): void {
    const kho = getKhoSanPhamChoPOS();
    const tieuThuongList = getDanhSachTieuThuongChoPOS();

    renderSelectTieuThuong(tieuThuongList);
    renderPosDanhSachSanPham(kho);
    refreshCartUI();
}

// Hàm hỗ trợ làm mới giao diện giỏ hàng & tính toán tiền
function refreshCartUI(): void {
    renderCartItems(currentCart);
    const tongTien = currentCart.reduce((sum, item) => sum + item.thanhTien, 0);
    const inputDaTra = document.getElementById('pos-da-thanhtoan') as HTMLInputElement;
    const daTra = inputDaTra ? parseFloat(inputDaTra.value) || 0 : 0;
    updateTienThanhToan(tongTien, daTra);
}