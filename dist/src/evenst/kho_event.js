import { capNhapSanPham, layDanhSachSanPham, themSanPham, xoaSanPham } from '../service/kho.js';
import { fillProductForm, getCategoryList, renderCategoryFilterOptions, renderKhoTable, renderInitialKhoState, renderProductCategoryOptions, resetProductForm, saveCategoryList } from '../view/kho_view.js';
export function initKhoEvents() {
    const keywordInput = document.getElementById('search-sp-ten');
    const typeFilter = document.getElementById('filter-sp-theloai');
    const statusFilter = document.getElementById('filter-sp-trangthai');
    const addBtn = document.getElementById('btn-open-add-sp');
    const form = document.getElementById('form-sanpham');
    const tbody = document.getElementById('table-danhsach-sp');
    const addCategoryBtn = document.getElementById('btn-save-category');
    const removeCategoryBtn = document.getElementById('btn-remove-category');
    const categoryInput = document.getElementById('sp-new-category');
    const categorySelect = document.getElementById('sp-theloai');
    keywordInput?.addEventListener('input', renderKhoTable);
    typeFilter?.addEventListener('change', renderKhoTable);
    statusFilter?.addEventListener('change', renderKhoTable);
    addCategoryBtn?.addEventListener('click', () => {
        const value = categoryInput?.value.trim();
        if (!value) {
            window.alert('Vui lòng nhập tên thể loại mới');
            return;
        }
        const list = getCategoryList();
        if (!list.includes(value)) {
            const newList = [...list, value];
            saveCategoryList(newList);
            renderProductCategoryOptions(value);
            renderCategoryFilterOptions(value);
        }
        else {
            renderProductCategoryOptions(value);
            renderCategoryFilterOptions(value);
        }
        if (categoryInput)
            categoryInput.value = '';
    });
    removeCategoryBtn?.addEventListener('click', () => {
        const selectedValue = categorySelect?.value.trim();
        if (!selectedValue) {
            window.alert('Vui lòng chọn thể loại cần xóa');
            return;
        }
        const list = getCategoryList();
        if (list.length <= 1) {
            window.alert('Phải giữ tối thiểu 1 thể loại trong danh sách');
            return;
        }
        const usedByProduct = layDanhSachSanPham().some((item) => item.theLoai === selectedValue);
        if (usedByProduct) {
            window.alert('Không thể xóa thể loại đang được sử dụng bởi ít nhất một sản phẩm. Hãy đổi thể loại cho sản phẩm trước khi xóa.');
            return;
        }
        const confirmed = window.confirm(`Bạn có chắc muốn xóa thể loại "${selectedValue}"?`);
        if (!confirmed)
            return;
        const newList = list.filter((item) => item !== selectedValue);
        saveCategoryList(newList);
        renderProductCategoryOptions(newList[0] ?? '');
        renderCategoryFilterOptions('');
    });
    addBtn?.addEventListener('click', () => {
        resetProductForm();
    });
    tbody?.addEventListener('click', (event) => {
        const target = event.target;
        const button = target.closest('[data-action]');
        if (!button)
            return;
        const id = button.dataset.id;
        if (!id)
            return;
        if (button.dataset.action === 'edit') {
            fillProductForm(id);
            return;
        }
        if (button.dataset.action === 'delete') {
            const confirmed = window.confirm('Bạn có chắc muốn xóa sản phẩm này?');
            if (!confirmed)
                return;
            xoaSanPham(id);
            renderKhoTable();
        }
    });
    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const id = document.getElementById('sp-id')?.value ?? '';
        const ten = document.getElementById('sp-ten')?.value.trim() ?? '';
        const theLoai = categorySelect?.value.trim() ?? '';
        const mau = document.getElementById('sp-mau')?.value.trim() ?? '';
        const size = Number(document.getElementById('sp-size')?.value ?? 0);
        const tonKho = Number(document.getElementById('sp-tonkho')?.value ?? 0);
        const gia = Number(document.getElementById('sp-gia')?.value ?? 0);
        if (!ten || !theLoai || !mau || !size || !gia) {
            window.alert('Vui lòng điền đầy đủ thông tin sản phẩm');
            return;
        }
        const payload = {
            ten,
            theLoai,
            size,
            mau,
            tonKho,
            gia,
            trangThai: tonKho > 0 ? 'Còn Hàng' : 'Hết hàng'
        };
        if (id) {
            capNhapSanPham(id, payload);
        }
        else {
            themSanPham(payload);
        }
        renderKhoTable();
        resetProductForm();
        const modal = document.getElementById('modalSanPham');
        const modalInstance = window.bootstrap?.Modal;
        if (modalInstance && modal) {
            const instance = modalInstance.getInstance(modal) ?? new modalInstance(modal);
            instance.hide();
        }
    });
}
export function initKhoApp() {
    renderInitialKhoState();
    initKhoEvents();
}
