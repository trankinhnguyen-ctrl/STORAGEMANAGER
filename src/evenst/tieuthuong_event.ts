import { capNhatTieuThuong, getDanhSachTieuThuong, themTieuThuong, timKiemTieuThuong, xoaTieuThuong } from '../service/tieuthuong.js';
import { renderBangTieuThuong, renderTieuThuongSelectOptions } from '../view/tieuThuong_view.js';

export function initTieuThuongModule(): void {
    renderTieuThuongSelectOptions();
    loadAndRenderTieuThuong();

    const searchInput = document.getElementById('search-tieuthuong') as HTMLInputElement | null;
    searchInput?.addEventListener('input', (event) => {
        const value = (event.target as HTMLInputElement).value;
        loadAndRenderTieuThuong(value);
    });

    const formThem = document.getElementById('form-tieuthuong') as HTMLFormElement | null;
    if (formThem) {
        formThem.addEventListener('submit', (e) => {
            e.preventDefault();

            const idInput = document.getElementById('tt-id') as HTMLInputElement | null;
            const tenInput = document.getElementById('tt-ten') as HTMLInputElement | null;
            const sdtInput = document.getElementById('tt-sdt') as HTMLInputElement | null;
            const diaChiInput = document.getElementById('tt-diachi') as HTMLInputElement | null;

            if (!tenInput || !sdtInput || !diaChiInput) return;

            const ten = tenInput.value.trim();
            const sdt = sdtInput.value.trim();
            const diaChi = diaChiInput.value.trim();

            if (!ten || !sdt) {
                window.alert('Vui lòng nhập tên và số điện thoại đại lý');
                return;
            }

            if (idInput && idInput.value) {
                capNhatTieuThuong(idInput.value, { ten, sdt, diaChi, ngayTao: new Date().toISOString().split('T')[0] });
            } else {
                themTieuThuong({ ten, sdt, diaChi });
            }

            formThem.reset();
            if (idInput) idInput.value = '';

            const label = document.getElementById('modalTieuThuongLabel');
            if (label) label.textContent = 'Thông Tin Đại Lý';

            loadAndRenderTieuThuong();
            renderTieuThuongSelectOptions();

            const modalEl = document.getElementById('modalTieuThuong');
            if (modalEl) {
                const modalInstance = (window as any).bootstrap?.Modal;
                if (modalInstance) {
                    const instance = modalInstance.getInstance(modalEl) ?? new modalInstance(modalEl);
                    instance.hide();
                }
            }
        });
    }

    const tbody = document.getElementById('table-danhsach-tt');
    if (tbody) {
        tbody.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const btnSua = target.closest('.btn-sua-tt') as HTMLButtonElement | null;
            const btnXoa = target.closest('.btn-xoa-tt') as HTMLButtonElement | null;

            if (btnSua) {
                const id = btnSua.getAttribute('data-id');
                if (!id) return;

                const item = getDanhSachTieuThuong().find((entry) => entry.id === id);
                if (!item) return;

                const idInput = document.getElementById('tt-id') as HTMLInputElement | null;
                const tenInput = document.getElementById('tt-ten') as HTMLInputElement | null;
                const sdtInput = document.getElementById('tt-sdt') as HTMLInputElement | null;
                const diaChiInput = document.getElementById('tt-diachi') as HTMLInputElement | null;
                const label = document.getElementById('modalTieuThuongLabel');

                if (idInput) idInput.value = item.id;
                if (tenInput) tenInput.value = item.ten;
                if (sdtInput) sdtInput.value = item.sdt;
                if (diaChiInput) diaChiInput.value = item.diaChi;
                if (label) label.textContent = 'Chỉnh Sửa Đại Lý';

                const modalEl = document.getElementById('modalTieuThuong');
                if (modalEl) {
                    const modalInstance = (window as any).bootstrap?.Modal;
                    if (modalInstance) new modalInstance(modalEl).show();
                }
                return;
            }

            if (btnXoa) {
                const id = btnXoa.getAttribute('data-id');
                if (!id) return;

                const confirmed = window.confirm('Bạn có chắc chắn muốn xóa đại lý này khỏi hệ thống không?');
                if (!confirmed) return;

                xoaTieuThuong(id);
                loadAndRenderTieuThuong();
                renderTieuThuongSelectOptions();
            }
        });
    }
}

function loadAndRenderTieuThuong(keyword = ''): void {
    const danhSach = timKiemTieuThuong(keyword);
    renderBangTieuThuong(danhSach);
}
