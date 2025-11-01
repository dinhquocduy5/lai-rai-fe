import * as XLSX from 'xlsx';
import { formatCurrency, formatDateTime } from './utils';

interface Payment {
  id: number;
  order_id: number;
  amount: number;
  paid_at: string;
  payment_method: string;
}

export function exportPaymentsToExcel(
  payments: Payment[],
  startDate: string,
  endDate: string,
  revenue: { total_revenue: number; total_orders: number }
) {
  // Prepare data for Excel
  const data = payments.map((payment, index) => ({
    'STT': index + 1,
    'Mã đơn hàng': `Order #${payment.order_id}`,
    'Số tiền': payment.amount,
    'Thời gian': formatDateTime(payment.paid_at),
    'Phương thức': payment.payment_method === 'cash' ? 'Tiền mặt' : 
                   payment.payment_method === 'card' ? 'Thẻ' : 'Chuyển khoản',
  }));

  // Add summary row
  data.push({
    'STT': '' as any,
    'Mã đơn hàng': '',
    'Số tiền': '' as any,
    'Thời gian': '',
    'Phương thức': '',
  });
  
  data.push({
    'STT': '' as any,
    'Mã đơn hàng': 'TỔNG KẾT',
    'Số tiền': revenue.total_revenue,
    'Thời gian': `${revenue.total_orders} đơn`,
    'Phương thức': '',
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },  // STT
    { wch: 15 }, // Mã đơn hàng
    { wch: 15 }, // Số tiền
    { wch: 20 }, // Thời gian
    { wch: 15 }, // Phương thức
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo thanh toán');

  // Add metadata sheet
  const metaData = [
    { 'Thông tin': 'Nhà hàng Lai Rai' },
    { 'Thông tin': `Báo cáo từ ${startDate} đến ${endDate}` },
    { 'Thông tin': `Xuất lúc: ${new Date().toLocaleString('vi-VN')}` },
    { 'Thông tin': '' },
    { 'Thông tin': `Tổng doanh thu: ${formatCurrency(revenue.total_revenue)}` },
    { 'Thông tin': `Tổng số đơn: ${revenue.total_orders}` },
  ];
  
  const wsInfo = XLSX.utils.json_to_sheet(metaData);
  wsInfo['!cols'] = [{ wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Thông tin');

  // Generate file name
  const fileName = `BaoCaoThanhToan_${startDate}_${endDate}_${Date.now()}.xlsx`;

  // Download file
  XLSX.writeFile(wb, fileName);
}
