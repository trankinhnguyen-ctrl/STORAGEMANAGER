import { layDanhSachSanPham, themSanPham } from '../service/kho.js';
import { getHoaDonList } from '../service/storage.js';
import { renderOverviewAnalytics } from './tongQuan.js';
import type { SanPham } from '../interface/type.js';

const normalizeStatus = (value: string): string => value.toLowerCase().trim();
const DEFAULT_CATEGORIES = ['Dép sục', 'Sneaker', 'Sandal', 'Giày Tây', '2 lớp'];
const CATEGORY_KEY = 'SANPHAM_THELOAI_LIST';
const DEMO_PRODUCTS: Omit<SanPham, 'id'>[] = [
    { ten: 'Crocs Classic Clog', theLoai: 'Dép sục', size: 39, mau: 'Trắng', tonKho: 100, gia: 850000, trangThai: 'Còn Hàng' },
    { ten: 'Crocs Daily Sport', theLoai: 'Dép sục', size: 40, mau: 'Đen', tonKho: 100, gia: 890000, trangThai: 'Còn Hàng' },
    { ten: 'Crocs Summer Flex', theLoai: 'Dép sục', size: 41, mau: 'Nâu', tonKho: 100, gia: 920000, trangThai: 'Còn Hàng' },
    { ten: 'Crocs Active Step', theLoai: 'Dép sục', size: 38, mau: 'Xám', tonKho: 100, gia: 870000, trangThai: 'Còn Hàng' },
    { ten: 'Sneaker Ultra Air', theLoai: 'Sneaker', size: 41, mau: 'Đen', tonKho: 100, gia: 1200000, trangThai: 'Còn Hàng' },
    { ten: 'Sneaker City Run', theLoai: 'Sneaker', size: 42, mau: 'Xanh', tonKho: 100, gia: 1250000, trangThai: 'Còn Hàng' },
    { ten: 'Sneaker Pulse Lite', theLoai: 'Sneaker', size: 39, mau: 'Trắng', tonKho: 100, gia: 1180000, trangThai: 'Còn Hàng' },
    { ten: 'Sneaker Trail Pro', theLoai: 'Sneaker', size: 43, mau: 'Đen', tonKho: 100, gia: 1320000, trangThai: 'Còn Hàng' },
    { ten: 'Sandal Nâu Basic', theLoai: 'Sandal', size: 40, mau: 'Nâu', tonKho: 100, gia: 550000, trangThai: 'Còn Hàng' },
    { ten: 'Sandal Coastal', theLoai: 'Sandal', size: 38, mau: 'Be', tonKho: 100, gia: 600000, trangThai: 'Còn Hàng' },
    { ten: 'Sandal Summer Wave', theLoai: 'Sandal', size: 41, mau: 'Đỏ', tonKho: 100, gia: 620000, trangThai: 'Còn Hàng' },
    { ten: 'Sandal Studio', theLoai: 'Sandal', size: 39, mau: 'Vàng', tonKho: 100, gia: 580000, trangThai: 'Còn Hàng' },
    { ten: 'Giày Tây Nam Đen', theLoai: 'Giày Tây', size: 42, mau: 'Đen', tonKho: 100, gia: 1450000, trangThai: 'Còn Hàng' },
    { ten: 'Giày Tây Oxford', theLoai: 'Giày Tây', size: 40, mau: 'Nâu', tonKho: 100, gia: 1500000, trangThai: 'Còn Hàng' },
    { ten: 'Giày Tây Executive', theLoai: 'Giày Tây', size: 43, mau: 'Xám', tonKho: 100, gia: 1680000, trangThai: 'Còn Hàng' },
    { ten: 'Giày Tây Classic', theLoai: 'Giày Tây', size: 41, mau: 'Đen', tonKho: 100, gia: 1520000, trangThai: 'Còn Hàng' },
    { ten: 'Dép Quai Ngang A', theLoai: 'Dép sục', size: 37, mau: 'Đen', tonKho: 100, gia: 450000, trangThai: 'Còn Hàng' },
    { ten: 'Dép Quai Ngang B', theLoai: 'Dép sục', size: 38, mau: 'Trắng', tonKho: 100, gia: 470000, trangThai: 'Còn Hàng' },
    { ten: 'Dép Quai Ngang C', theLoai: 'Dép sục', size: 39, mau: 'Xám', tonKho: 100, gia: 490000, trangThai: 'Còn Hàng' },
    { ten: 'Giày Tây Smart', theLoai: 'Giày Tây', size: 44, mau: 'Nâu', tonKho: 100, gia: 1700000, trangThai: 'Còn Hàng' },
];

function ensureDemoInventory(): void {
    const existing = layDanhSachSanPham();
    const existingKeySet = new Set(existing.map((item) => `${item.ten}::${item.theLoai}::${item.mau}::${item.size}`));

    for (const item of DEMO_PRODUCTS) {
        const key = `${item.ten}::${item.theLoai}::${item.mau}::${item.size}`;
        if (!existingKeySet.has(key)) {
            themSanPham(item);
            existingKeySet.add(key);
        }
    }
}

export function getCategoryList(): string[] {
    try {
        const saved = localStorage.getItem(CATEGORY_KEY);
        if (!saved) return [...DEFAULT_CATEGORIES];
        const parsed = JSON.parse(saved) as string[];
        return parsed.length ? parsed : [...DEFAULT_CATEGORIES];
    } catch {
        return [...DEFAULT_CATEGORIES];
    }
}

export function saveCategoryList(list: string[]): void {
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(list));
}

export function renderCategoryFilterOptions(selectedValue = ''): void {
    const filter = document.getElementById('filter-sp-theloai') as HTMLSelectElement | null;
    if (!filter) return;

    const categories = getCategoryList();
    filter.innerHTML = ['<option value="">-- Tất cả thể loại --</option>']
        .concat(categories.map((category) => `<option value="${category}">${category}</option>`))
        .join('');

    if (selectedValue) {
        filter.value = selectedValue;
    }
}

export function renderProductCategoryOptions(selectedValue = ''): void {
    const select = document.getElementById('sp-theloai') as HTMLSelectElement | null;
    if (!select) return;

    const categories = getCategoryList();
    select.innerHTML = categories.map((category) => `<option value="${category}">${category}</option>`).join('');
    if (selectedValue) {
        select.value = selectedValue;
    } else if (categories.length) {
        select.value = categories[0];
    }
}

export function renderDashboard(): void {
    const list = layDanhSachSanPham();

    const tongMau = document.getElementById('kpi-tong-mau');
    const tongTonKho = document.getElementById('kpi-tong-tonkho');
    const tongGiaTri = document.getElementById('kpi-tong-giatri');
    const tongCongNo = document.getElementById('kpi-tong-congno');
    const alertBody = document.getElementById('table-canhbao-tonkho');

    const totalQty = list.reduce((sum, item) => sum + item.tonKho, 0);
    const totalValue = list.reduce((sum, item) => sum + item.tonKho * item.gia, 0);
    const totalDebt = getHoaDonList().reduce((sum, invoice) => sum + invoice.conNo, 0);
    const lowStock = list.filter((item) => item.tonKho <= 3);

    if (tongMau) tongMau.textContent = String(list.length);
    if (tongTonKho) tongTonKho.textContent = String(totalQty);
    if (tongGiaTri) tongGiaTri.textContent = `${totalValue.toLocaleString('vi-VN')} VNĐ`;
    if (tongCongNo) tongCongNo.textContent = `${totalDebt.toLocaleString('vi-VN')} VNĐ`;

    if (alertBody) {
        if (!lowStock.length) {
            alertBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-3">Không có sản phẩm nào ở mức cảnh báo tồn kho.</td>
                </tr>
            `;
        } else {
            alertBody.innerHTML = lowStock.map((item) => `
                <tr>
                    <td>${item.ten}</td>
                    <td>${item.theLoai}</td>
                    <td>${item.size}</td>
                    <td>${item.mau}</td>
                    <td>${item.tonKho}</td>
                    <td><span class="badge bg-danger">${item.tonKho <= 0 ? 'Hết hàng' : 'Sắp hết'}</span></td>
                </tr>
            `).join('');
        }
    }

    renderOverviewAnalytics();
}

export function renderKhoTable(): void {
    const tbody = document.getElementById('table-danhsach-sp');
    if (!tbody) return;

    const keyword = (document.getElementById('search-sp-ten') as HTMLInputElement | null)?.value.trim().toLowerCase() ?? '';
    const theLoai = (document.getElementById('filter-sp-theloai') as HTMLSelectElement | null)?.value ?? '';
    const trangThai = (document.getElementById('filter-sp-trangthai') as HTMLSelectElement | null)?.value ?? '';

    let list = layDanhSachSanPham();

    if (keyword) {
        list = list.filter((item) => item.ten.toLowerCase().includes(keyword));
    }
    if (theLoai) {
        list = list.filter((item) => item.theLoai === theLoai);
    }
    if (trangThai) {
        list = list.filter((item) => normalizeStatus(item.trangThai) === normalizeStatus(trangThai));
    }

    tbody.innerHTML = list.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.ten}</td>
            <td>${item.theLoai}</td>
            <td>${item.size}</td>
            <td>${item.mau}</td>
            <td>${item.tonKho}</td>
            <td>${item.gia.toLocaleString('vi-VN')} VNĐ</td>
            <td>
                <span class="badge ${item.tonKho > 0 ? 'bg-success' : 'bg-secondary'}">${item.trangThai}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning me-2" type="button" data-action="edit" data-id="${item.id}" data-role-guard="manager">Sửa</button>
                <button class="btn btn-sm btn-danger" type="button" data-action="delete" data-id="${item.id}" data-role-guard="manager">Xóa</button>
            </td>
        </tr>
    `).join('');

    renderDashboard();
}

export function resetProductForm(): void {
    const form = document.getElementById('form-sanpham') as HTMLFormElement | null;
    if (form) form.reset();

    const hiddenId = document.getElementById('sp-id') as HTMLInputElement | null;
    if (hiddenId) hiddenId.value = '';

    const newCategoryInput = document.getElementById('sp-new-category') as HTMLInputElement | null;
    if (newCategoryInput) newCategoryInput.value = '';

    renderProductCategoryOptions();

    const label = document.getElementById('modalSanPhamLabel');
    if (label) label.textContent = 'Thêm / Chỉnh Sửa Sản Phẩm';
}

export function fillProductForm(productId: string): void {
    const product = layDanhSachSanPham().find((item) => item.id === productId);
    if (!product) return;

    const hiddenId = document.getElementById('sp-id') as HTMLInputElement | null;
    const ten = document.getElementById('sp-ten') as HTMLInputElement | null;
    const theLoai = document.getElementById('sp-theloai') as HTMLSelectElement | null;
    const mau = document.getElementById('sp-mau') as HTMLInputElement | null;
    const size = document.getElementById('sp-size') as HTMLInputElement | null;
    const tonKho = document.getElementById('sp-tonkho') as HTMLInputElement | null;
    const gia = document.getElementById('sp-gia') as HTMLInputElement | null;
    const label = document.getElementById('modalSanPhamLabel');

    renderProductCategoryOptions(product.theLoai);

    if (hiddenId) hiddenId.value = product.id;
    if (ten) ten.value = product.ten;
    if (theLoai) theLoai.value = product.theLoai;
    if (mau) mau.value = product.mau;
    if (size) size.value = String(product.size);
    if (tonKho) tonKho.value = String(product.tonKho);
    if (gia) gia.value = String(product.gia);
    if (label) label.textContent = 'Chỉnh Sửa Sản Phẩm';

    const modalEl = document.getElementById('modalSanPham');
    if (modalEl) {
        const bootstrapModal = (window as any).bootstrap?.Modal;
        if (bootstrapModal) new bootstrapModal(modalEl).show();
    }
}

export function renderInitialKhoState(): void {
    renderProductCategoryOptions();
    renderCategoryFilterOptions();

    const list = layDanhSachSanPham();
    if (list.length < 20) {
        ensureDemoInventory();
    }

    renderKhoTable();
    renderDashboard();
}
