export function renderBangTieuThuong(danhSach) {
    const tbody = document.getElementById('table-danhsach-tt');
    if (!tbody)
        return;
    if (danhSach.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    Chưa có đại lý / tiểu thương nào trong hệ thống.
                </td>
            </tr>`;
        return;
    }
    tbody.innerHTML = danhSach.map((tt, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${tt.ten}</strong></td>
            <td>${tt.sdt}</td>
            <td>${tt.diaChi || '—'}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning btn-sua-tt me-2" data-id="${tt.id}" data-role-guard="manager" title="Sửa đại lý">
                    <i class="fa-solid fa-pen"></i> Sửa
                </button>
                <button class="btn btn-sm btn-outline-danger btn-xoa-tt" data-id="${tt.id}" data-role-guard="manager" title="Xóa đại lý">
                    <i class="fa-solid fa-trash"></i> Xóa
                </button>
            </td>
        </tr>
    `).join('');
}
export function renderTieuThuongSelectOptions(selectedValue = '') {
    const select = document.getElementById('select-pos-tieuthuong');
    if (!select)
        return;
    const list = JSON.parse(localStorage.getItem('TIEU_THUONG') || '[]');
    select.innerHTML = ['<option value="">-- Chọn đại lý --</option>']
        .concat(list.map((item) => `<option value="${item.id}">${item.ten} (${item.sdt})</option>`))
        .join('');
    if (selectedValue) {
        select.value = selectedValue;
    }
}
