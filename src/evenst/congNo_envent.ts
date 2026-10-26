import { capNhatCongNo, getHoaDonTheoId, thucHienThuNo } from '../service/congno.js';
import { renderCongNo, renderCongNoSuggestions } from '../view/congNo_view.js';

function openHoaDonDetailModal(hoaDonId: string): void {
    const hoaDon = getHoaDonTheoId(hoaDonId);
    if (!hoaDon) return;

    const modal = document.getElementById('modalChiTietHoaDon');
    const title = document.getElementById('modalChiTietHoaDonTitle');
    const body = document.getElementById('modalChiTietHoaDonBody');
    if (!modal || !title || !body) return;

    title.textContent = `Hóa đơn của ${hoaDon.tenTieuThuong}`;

    const rows = hoaDon.danhSachSanPham.length
        ? hoaDon.danhSachSanPham.map((item: typeof hoaDon.danhSachSanPham[number]) => `
            <tr>
                <td>${item.ten}</td>
                <td>${item.size}</td>
                <td>${item.mau}</td>
                <td>${item.soLuongMua}</td>
                <td>${item.gia.toLocaleString('vi-VN')} đ</td>
                <td>${item.thanhTien.toLocaleString('vi-VN')} đ</td>
            </tr>
        `).join('')
        : '<tr><td colspan="6" class="text-center text-muted">Không có sản phẩm trong hóa đơn</td></tr>';

    body.innerHTML = `
        <div class="mb-3 small text-muted">
            <div>Mã hóa đơn: <strong>${hoaDon.id}</strong></div>
            <div>Ngày: ${new Date(hoaDon.ngayTao).toLocaleDateString('vi-VN')}</div>
            <div>Tổng tiền: <strong>${hoaDon.tongTien.toLocaleString('vi-VN')} đ</strong></div>
            <div>Đã thanh toán: ${hoaDon.daThanhToan.toLocaleString('vi-VN')} đ</div>
            <div>Còn nợ: <strong class="text-danger">${hoaDon.conNo.toLocaleString('vi-VN')} đ</strong></div>
        </div>
        <table class="table table-sm table-bordered align-middle mb-0">
            <thead class="table-light">
                <tr>
                    <th>Tên sản phẩm</th>
                    <th>Size</th>
                    <th>Màu</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;

    const bootstrapModal = (window as any).bootstrap?.Modal;
    if (bootstrapModal) {
        const instance = bootstrapModal.getInstance(modal) ?? new bootstrapModal(modal);
        instance.show();
    }
}

export function initCongNoEvents(): void {
    renderCongNo();

    const searchInput = document.getElementById('search-congno') as HTMLInputElement | null;
    const invoiceSearchInput = document.getElementById('search-congno-ma') as HTMLInputElement | null;
    const dateFilterInput = document.getElementById('filter-congno-ngay') as HTMLInputElement | null;
    const suggestions = document.getElementById('congno-suggestions');
    const tbody = document.getElementById('table-danhsach-congno');

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const value = (event.target as HTMLInputElement).value;
            renderCongNoSuggestions(value);
            const selectedDealer = searchInput.value.trim();
            renderCongNo(selectedDealer, invoiceSearchInput?.value || '', dateFilterInput?.value || '');
        });

        searchInput.addEventListener('focus', () => {
            renderCongNoSuggestions(searchInput.value);
        });
    }

    if (invoiceSearchInput) {
        invoiceSearchInput.addEventListener('input', () => {
            const selectedDealer = searchInput?.value.trim() || '';
            renderCongNo(selectedDealer, invoiceSearchInput.value, dateFilterInput?.value || '');
        });
    }

    if (dateFilterInput) {
        dateFilterInput.addEventListener('change', () => {
            const selectedDealer = searchInput?.value.trim() || '';
            renderCongNo(selectedDealer, invoiceSearchInput?.value || '', dateFilterInput.value);
        });
    }

    if (suggestions) {
        suggestions.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const option = target.closest('.btn-congno-dealer-option') as HTMLButtonElement | null;
            if (!option || !searchInput) return;

            const dealerName = option.getAttribute('data-name') || '';
            searchInput.value = dealerName;
            renderCongNoSuggestions('');
            renderCongNo(dealerName, invoiceSearchInput?.value || '', dateFilterInput?.value || '');
        });
    }

    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!suggestions) return;
        if (!suggestions.contains(target) && target !== searchInput) {
            suggestions.classList.add('d-none');
            suggestions.innerHTML = '';
        }
    });

    if (!tbody) return;

    tbody.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLElement;
        const chinhSuaButton = target.closest('.btn-chi-tiet-hoa-don') as HTMLButtonElement | null;
        const thuNoButton = target.closest('.btn-thu-no') as HTMLButtonElement | null;
        const suaNoButton = target.closest('.btn-sua-no') as HTMLButtonElement | null;

        if (chinhSuaButton) {
            const hoaDonId = chinhSuaButton.getAttribute('data-id');
            if (!hoaDonId) return;
            openHoaDonDetailModal(hoaDonId);
            return;
        }

        if (thuNoButton) {
            const hoaDonId = thuNoButton.getAttribute('data-id');
            const maxConNo = Number(thuNoButton.getAttribute('data-conno') || '0');
            if (!hoaDonId) return;

            const inputVal = prompt(`Nhập số tiền tiểu thương trả thêm (Tối đa: ${maxConNo.toLocaleString('vi-VN')} đ):`);
            if (inputVal === null) return;

            const soTienTraThem = Number(inputVal);
            if (Number.isNaN(soTienTraThem)) {
                alert('Vui lòng nhập một số hợp lệ!');
                return;
            }

            const ketQua = thucHienThuNo(hoaDonId, soTienTraThem);
            alert(ketQua.message);

            if (ketQua.success) {
                const selectedDealerName = searchInput?.value.trim() || '';
                renderCongNo(selectedDealerName, invoiceSearchInput?.value || '', dateFilterInput?.value || '');
            }
            return;
        }

        if (suaNoButton) {
            const hoaDonId = suaNoButton.getAttribute('data-id');
            const currentDebt = Number(suaNoButton.getAttribute('data-conno') || '0');
            if (!hoaDonId) return;

            const inputVal = prompt(`Nhập số nợ mới cần chỉnh sửa (Hiện tại: ${currentDebt.toLocaleString('vi-VN')} đ):`);
            if (inputVal === null) return;

            const soTienNoMoi = Number(inputVal);
            if (Number.isNaN(soTienNoMoi)) {
                alert('Vui lòng nhập một số hợp lệ!');
                return;
            }

            const ketQua = capNhatCongNo(hoaDonId, soTienNoMoi);
            alert(ketQua.message);

            if (ketQua.success) {
                const selectedDealerName = searchInput?.value.trim() || '';
                renderCongNo(selectedDealerName, invoiceSearchInput?.value || '', dateFilterInput?.value || '');
            }
        }
    });
}
