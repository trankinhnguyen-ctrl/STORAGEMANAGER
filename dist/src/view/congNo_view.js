import { getDanhSachCongNo } from '../service/congno.js';
import { getDanhSachTieuThuong } from '../service/tieuthuong.js';
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
export function getCongNoSuggestions(keyword) {
    const danhSach = getDanhSachCongNo();
    const tenDaiLy = Array.from(new Set([
        ...getDanhSachTieuThuong().map((item) => item.ten),
        ...danhSach.map((item) => item.tenTieuThuong)
    ])).sort((a, b) => a.localeCompare(b, 'vi'));
    const query = keyword.trim().toLowerCase();
    if (!query) {
        return tenDaiLy.slice(0, 8);
    }
    return tenDaiLy.filter((ten) => ten.toLowerCase().includes(query)).slice(0, 8);
}
export function renderCongNoSuggestions(keyword) {
    const container = document.getElementById('congno-suggestions');
    if (!container)
        return;
    const suggestions = getCongNoSuggestions(keyword);
    if (!keyword.trim() || suggestions.length === 0) {
        container.innerHTML = '';
        container.classList.add('d-none');
        return;
    }
    container.classList.remove('d-none');
    container.innerHTML = suggestions.map((ten) => `
        <button type="button" class="list-group-item list-group-item-action btn-congno-dealer-option" data-name="${escapeHtml(ten)}">${ten}</button>
    `).join('');
}
export function renderCongNo(selectedDealerName = '', invoiceCodeKeyword = '', selectedDate = '') {
    const tbody = document.getElementById('table-danhsach-congno');
    const totalDebtEl = document.getElementById('congno-total-debt');
    const overviewDebtEl = document.getElementById('kpi-tong-congno');
    if (!tbody)
        return;
    const danhSach = getDanhSachCongNo();
    const totalOutstandingDebt = danhSach.reduce((sum, item) => sum + item.conNo, 0);
    if (overviewDebtEl) {
        overviewDebtEl.textContent = `${totalOutstandingDebt.toLocaleString('vi-VN')} VNĐ`;
    }
    const selectedName = selectedDealerName.trim();
    if (!selectedName) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4 text-muted">
                    Vui lòng tìm đại lý để hiển thị hóa đơn và tổng nợ.
                </td>
            </tr>
        `;
        if (totalDebtEl)
            totalDebtEl.textContent = '0 đ';
        return;
    }
    let hoaDonCuaDaiLy = danhSach
        .filter((hd) => hd.tenTieuThuong.toLowerCase() === selectedName.toLowerCase())
        .sort((a, b) => Number(b.ngayTao) - Number(a.ngayTao));
    const invoiceKeyword = invoiceCodeKeyword.trim().toLowerCase();
    if (invoiceKeyword) {
        hoaDonCuaDaiLy = hoaDonCuaDaiLy.filter((hd) => hd.id.toLowerCase().includes(invoiceKeyword));
    }
    if (selectedDate) {
        hoaDonCuaDaiLy = hoaDonCuaDaiLy.filter((hd) => {
            const dateString = new Date(hd.ngayTao).toISOString().slice(0, 10);
            return dateString === selectedDate;
        });
    }
    const tongNo = hoaDonCuaDaiLy.reduce((sum, item) => sum + item.conNo, 0);
    if (totalDebtEl)
        totalDebtEl.textContent = `${tongNo.toLocaleString('vi-VN')} đ`;
    if (hoaDonCuaDaiLy.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4 text-muted">
                    Không có hóa đơn nào phù hợp cho đại lý <strong>${selectedName}</strong>.
                </td>
            </tr>
        `;
        return;
    }
    tbody.innerHTML = hoaDonCuaDaiLy.map((hd, index) => {
        const isCompleted = hd.conNo === 0 || hd.trangThaiThanhtoan === 'đã thanh toán';
        const badgeClass = isCompleted ? 'bg-success' : 'bg-danger';
        const trangThaiText = isCompleted ? 'Đã thanh toán' : 'Chưa thanh toán';
        const ngayTaoFormatted = new Date(hd.ngayTao).toLocaleDateString('vi-VN');
        return `
            <tr>
                <td>${index + 1}</td>
                <td><code>${hd.id}</code></td>
                <td>
                    <button class="btn btn-link p-0 text-primary text-decoration-none btn-chi-tiet-hoa-don" data-id="${hd.id}" type="button">
                        <strong>${hd.tenTieuThuong}</strong>
                    </button>
                </td>
                <td>${hd.tongTien.toLocaleString('vi-VN')} đ</td>
                <td>${hd.daThanhToan.toLocaleString('vi-VN')} đ</td>
                <td><strong class="text-danger">${hd.conNo.toLocaleString('vi-VN')} đ</strong></td>
                <td>${ngayTaoFormatted}</td>
                <td><span class="badge ${badgeClass}">${trangThaiText}</span></td>
                <td>
                    ${hd.conNo > 0
            ? `
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-primary btn-thu-no" data-id="${hd.id}" data-conno="${hd.conNo}">Thu nợ</button>
                                <button class="btn btn-sm btn-outline-warning btn-sua-no" data-id="${hd.id}" data-conno="${hd.conNo}">Sửa nợ</button>
                            </div>
                        `
            : `
                            <div class="d-flex gap-2 align-items-center">
                                <span class="text-muted small">Hoàn tất</span>
                                <button class="btn btn-sm btn-outline-warning btn-sua-no" data-id="${hd.id}" data-conno="${hd.conNo}">Sửa nợ</button>
                            </div>
                        `}
                </td>
            </tr>
        `;
    }).join('');
}
