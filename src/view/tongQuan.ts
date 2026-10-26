import { getCurrentRole } from '../service/auth.js';
import { layDanhSachSanPham } from '../service/kho.js';
import { getHoaDonList } from '../service/storage.js';

function formatCurrency(value: number): string {
    return `${value.toLocaleString('vi-VN')} VNĐ`;
}

function toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getRevenueSeries(periodType: 'month' | 'week' | 'day', referenceDate: Date): Array<{ label: string; value: number }> {
    const invoices = getHoaDonList();
    const currentYear = referenceDate.getFullYear();
    const currentMonth = referenceDate.getMonth();

    if (periodType === 'month') {
        const monthlyMap = new Map<string, number>();
        invoices.forEach((invoice) => {
            const date = new Date(invoice.ngayTao);
            const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
            monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + invoice.tongTien);
        });

        return Array.from({ length: 6 }, (_, index) => {
            const date = new Date(currentYear, currentMonth - (5 - index), 1);
            const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
            return { label: key, value: monthlyMap.get(key) ?? 0 };
        });
    }

    if (periodType === 'week') {
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
        const weeks: Array<{ label: string; start: number; end: number }> = [];
        let currentDate = new Date(monthStart);
        let weekIndex = 1;

        while (currentDate <= monthEnd) {
            const weekStart = new Date(currentDate);
            const weekEndDate = new Date(currentDate);
            weekEndDate.setDate(weekEndDate.getDate() + 6);
            const actualWeekEnd = new Date(Math.min(weekEndDate.getTime(), monthEnd.getTime()));
            weeks.push({ label: `Tuần ${weekIndex}`, start: weekStart.getTime(), end: actualWeekEnd.getTime() });
            currentDate = new Date(actualWeekEnd);
            currentDate.setDate(currentDate.getDate() + 1);
            weekIndex += 1;
        }

        return weeks.map((week) => ({
            label: week.label,
            value: invoices.reduce((sum, invoice) => {
                const invoiceDate = new Date(invoice.ngayTao);
                return invoiceDate.getTime() >= week.start && invoiceDate.getTime() <= week.end ? sum + invoice.tongTien : sum;
            }, 0),
        }));
    }

    const selectedMonthStart = new Date(currentYear, currentMonth, 1);
    const selectedMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    const daySeries: Array<{ label: string; value: number }> = [];

    for (let day = 1; day <= selectedMonthEnd.getDate(); day += 1) {
        const date = new Date(currentYear, currentMonth, day);
        const label = `${day}/${currentMonth + 1}`;
        const value = invoices.reduce((sum, invoice) => {
            const invoiceDate = new Date(invoice.ngayTao);
            return invoiceDate.getFullYear() === date.getFullYear() && invoiceDate.getMonth() === date.getMonth() && invoiceDate.getDate() === date.getDate() ? sum + invoice.tongTien : sum;
        }, 0);
        daySeries.push({ label, value });
    }

    return daySeries;
}

export function renderOverviewAnalytics(): void {
    const container = document.getElementById('overview-analytics');
    if (!container) return;

    const products = layDanhSachSanPham();
    const invoices = getHoaDonList();
    const currentRole = getCurrentRole();
    const isManager = currentRole === 'QUAN_LY';
    const periodSelect = document.getElementById('revenue-period-type') as HTMLSelectElement | null;
    const dateInput = document.getElementById('revenue-date-picker') as HTMLInputElement | null;
    const periodType = (periodSelect?.value as 'month' | 'week' | 'day') || 'month';
    const selectedDate = dateInput && dateInput.value ? new Date(dateInput.value) : new Date();
    const revenueSeries = getRevenueSeries(periodType, selectedDate);

    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.tongTien, 0);
    const totalDebt = invoices.reduce((sum, invoice) => sum + invoice.conNo, 0);
    const best = revenueSeries.reduce((maxItem, current) => current.value > maxItem.value ? current : maxItem, revenueSeries[0] ?? { label: 'N/A', value: 0 });
    const avgRevenue = revenueSeries.reduce((sum, item) => sum + item.value, 0) / (revenueSeries.length || 1);
    const activeTitle = periodType === 'month' ? 'Doanh thu bán hàng theo tháng' : periodType === 'week' ? 'Doanh thu bán hàng theo tuần' : 'Doanh thu bán hàng theo ngày';
    const activeBadge = periodType === 'month' ? '6 tháng' : periodType === 'week' ? 'Theo tuần' : 'Theo ngày';
    const avgLabel = periodType === 'day' ? 'TB/ngày' : periodType === 'week' ? 'TB/tuần' : 'TB/tháng';
    const bestLabel = periodType === 'day' ? 'Ngày cao nhất' : periodType === 'week' ? 'Tuần cao nhất' : 'Tháng cao nhất';

    const staffLowStock = products.filter((product) => product.tonKho > 0 && product.tonKho <= 3).length;
    const staffOutOfStock = products.filter((product) => product.tonKho <= 0).length;
    const todayRevenue = invoices
        .filter((invoice) => {
            const date = new Date(invoice.ngayTao);
            const now = new Date();
            return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
        })
        .reduce((sum, invoice) => sum + invoice.tongTien, 0);

    const summaryMetrics = isManager ? `
        <div class="summary-stack">
            <div class="summary-metric summary-metric--blue">
                <span>Doanh thu</span>
                <strong>${formatCurrency(totalRevenue)}</strong>
            </div>
            <div class="summary-metric summary-metric--green">
                <span>${avgLabel}</span>
                <strong>${formatCurrency(avgRevenue)}</strong>
            </div>
            <div class="summary-metric summary-metric--amber">
                <span>${bestLabel}</span>
                <strong>${best.label}</strong>
            </div>
            <div class="summary-metric summary-metric--red">
                <span>Còn nợ</span>
                <strong>${formatCurrency(totalDebt)}</strong>
            </div>
        </div>
    ` : `
        <div class="summary-stack">
            <div class="summary-metric summary-metric--blue">
                <span>Doanh thu hôm nay</span>
                <strong>${formatCurrency(todayRevenue)}</strong>
            </div>
            <div class="summary-metric summary-metric--green">
                <span>Tổng tồn kho</span>
                <strong>${products.reduce((sum, product) => sum + product.tonKho, 0)}</strong>
            </div>
            <div class="summary-metric summary-metric--amber">
                <span>Sắp hết</span>
                <strong>${staffLowStock}</strong>
            </div>
            <div class="summary-metric summary-metric--red">
                <span>Hết hàng</span>
                <strong>${staffOutOfStock}</strong>
            </div>
        </div>
    `;

    const quickStats = isManager ? `
        <div class="dashboard-summary-grid">
            <div class="mini-summary mini-summary--primary">
                <div class="mini-summary__label">Mẫu mã</div>
                <div class="mini-summary__value">${products.length}</div>
            </div>
            <div class="mini-summary mini-summary--success">
                <div class="mini-summary__label">Tổng tồn</div>
                <div class="mini-summary__value">${products.reduce((sum, product) => sum + product.tonKho, 0)}</div>
            </div>
            <div class="mini-summary mini-summary--warning">
                <div class="mini-summary__label">Cần chú ý</div>
                <div class="mini-summary__value">${products.filter((product) => product.tonKho > 0 && product.tonKho <= 3).length}</div>
            </div>
            <div class="mini-summary mini-summary--danger">
                <div class="mini-summary__label">Hết hàng</div>
                <div class="mini-summary__value">${products.filter((product) => product.tonKho <= 0).length}</div>
            </div>
        </div>
    ` : `
        <div class="dashboard-summary-grid">
            <div class="mini-summary mini-summary--primary">
                <div class="mini-summary__label">Sản phẩm</div>
                <div class="mini-summary__value">${products.length}</div>
            </div>
            <div class="mini-summary mini-summary--success">
                <div class="mini-summary__label">Tồn kho</div>
                <div class="mini-summary__value">${products.reduce((sum, product) => sum + product.tonKho, 0)}</div>
            </div>
            <div class="mini-summary mini-summary--warning">
                <div class="mini-summary__label">Cần kiểm tra</div>
                <div class="mini-summary__value">${staffLowStock}</div>
            </div>
            <div class="mini-summary mini-summary--danger">
                <div class="mini-summary__label">Báo hết</div>
                <div class="mini-summary__value">${staffOutOfStock}</div>
            </div>
        </div>
    `;

    if (!isManager) {
        container.innerHTML = `
            <div class="col-12">
                <div class="dashboard-panel dashboard-panel--large">
                    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div>
                            <div class="panel-kicker">Theo dõi kho</div>
                            <h5 class="panel-title mb-0">Sản phẩm cần kiểm tra</h5>
                        </div>
                        <span class="panel-pill panel-pill--warning">Nhân viên</span>
                    </div>

                    <div class="dashboard-summary-grid">
                        <div class="mini-summary mini-summary--primary">
                            <div class="mini-summary__label">Tổng sản phẩm</div>
                            <div class="mini-summary__value">${products.length}</div>
                        </div>
                        <div class="mini-summary mini-summary--success">
                            <div class="mini-summary__label">Tổng tồn</div>
                            <div class="mini-summary__value">${products.reduce((sum, product) => sum + product.tonKho, 0)}</div>
                        </div>
                        <div class="mini-summary mini-summary--warning">
                            <div class="mini-summary__label">Cần kiểm tra</div>
                            <div class="mini-summary__value">${staffLowStock}</div>
                        </div>
                        <div class="mini-summary mini-summary--danger">
                            <div class="mini-summary__label">Báo hết</div>
                            <div class="mini-summary__value">${staffOutOfStock}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="col-xl-8">
            <div class="dashboard-panel dashboard-panel--large">
                <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div>
                        <div class="panel-kicker">Hiệu suất kinh doanh</div>
                        <h5 class="panel-title mb-0">${activeTitle}</h5>
                    </div>
                    <div class="revenue-toolbar">
                        <select id="revenue-period-type" class="form-select form-select-sm">
                            <option value="month" ${periodType === 'month' ? 'selected' : ''}>Theo tháng</option>
                            <option value="week" ${periodType === 'week' ? 'selected' : ''}>Theo tuần</option>
                            <option value="day" ${periodType === 'day' ? 'selected' : ''}>Theo ngày</option>
                        </select>
                        <input id="revenue-date-picker" type="date" class="form-control form-control-sm" value="${toDateInputValue(selectedDate)}">
                    </div>
                </div>

                <div class="revenue-chart-canvas-wrapper">
                    <canvas id="revenue-chart-canvas" aria-label="Biểu đồ doanh thu"></canvas>
                </div>
            </div>
        </div>

        <div class="col-xl-4">
            <div class="dashboard-panel dashboard-panel--compact">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <div class="panel-kicker">Tổng kết</div>
                        <h5 class="panel-title mb-0">Hiệu suất</h5>
                    </div>
                    <span class="panel-pill panel-pill--primary">${activeBadge}</span>
                </div>

                ${summaryMetrics}
            </div>
        </div>

        <div class="col-12">
            ${quickStats}
        </div>
    `;

    if (!isManager) return;

    const canvas = document.getElementById('revenue-chart-canvas') as HTMLCanvasElement | null;
    if (canvas) {
        const ChartCtor = (window as any).Chart;
        if (ChartCtor) {
            const existingChart = (canvas as any).__chartInstance;
            if (existingChart) {
                existingChart.destroy();
            }

            const context = canvas.getContext('2d');
            if (context) {
                (canvas as any).__chartInstance = new ChartCtor(context, {
                    type: 'bar',
                    data: {
                        labels: revenueSeries.map((item) => item.label),
                        datasets: [{
                            data: revenueSeries.map((item) => item.value),
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            borderColor: 'rgba(37, 99, 235, 1)',
                            borderWidth: 1,
                            borderRadius: 8,
                            maxBarThickness: 36,
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 450 },
                        layout: {
                            padding: { top: 8, right: 8, bottom: 0, left: 8 }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (contextItem: any) => formatCurrency(contextItem.parsed.y || 0),
                                },
                            },
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: {
                                    autoSkip: true,
                                    maxTicksLimit: 12,
                                    color: '#64748b',
                                    font: { weight: '600' },
                                },
                            },
                            y: {
                                beginAtZero: true,
                                grid: { color: 'rgba(148, 163, 184, 0.18)' },
                                ticks: {
                                    callback: (value: string | number) => {
                                        const numeric = Number(value);
                                        if (numeric >= 1000000) {
                                            return `${(numeric / 1000000).toFixed(1)}M`;
                                        }
                                        if (numeric >= 1000) {
                                            return `${(numeric / 1000).toFixed(0)}K`;
                                        }
                                        return `${numeric}`;
                                    },
                                    color: '#64748b',
                                    font: { weight: '600' },
                                },
                            },
                        },
                    },
                });
            }
        }
    }

    const combinedSelect = document.getElementById('revenue-period-type') as HTMLSelectElement | null;
    const combinedPicker = document.getElementById('revenue-date-picker') as HTMLInputElement | null;
    if (combinedSelect && combinedPicker) {
        const refresh = () => {
            if (combinedSelect.value === 'month') {
                combinedPicker.type = 'date';
                if (!combinedPicker.value) {
                    combinedPicker.value = toDateInputValue(new Date());
                }
            } else {
                combinedPicker.type = 'date';
            }
            renderOverviewAnalytics();
        };

        if (!(combinedSelect as any).dataset.bound) {
            combinedSelect.addEventListener('change', refresh);
            combinedPicker.addEventListener('change', refresh);
            (combinedSelect as any).dataset.bound = 'true';
        }
    }
}
