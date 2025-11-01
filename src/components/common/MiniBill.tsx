import { forwardRef } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface MiniBillProps {
  order: {
    id: number;
    table_id: number;
    check_in: string;
    check_out: string | null;
    total_amount: number;
    items?: Array<{
      id: number;
      name: string;
      quantity: number;
      price_at_order_time: number;
    }>;
    table?: {
      name: string;
    };
  };
}

const MiniBill = forwardRef<HTMLDivElement, MiniBillProps>(({ order }, ref) => {
  const subtotal =
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;

  return (
    <div
      ref={ref}
      className="bg-white p-6 w-[80mm] mx-auto"
      style={{ fontFamily: "monospace" }}
    >
      {/* Header */}
      <div className="text-center mb-4 pb-3 border-b-2 border-dashed border-gray-800">
        <h1 className="text-xl font-bold mb-1">LAI RAI QUÁN</h1>
        <p className="text-xs">1156 Lý Thái Tổ, Ấp Vĩnh Tuy, Nhơn Trạch, Đồng Nai</p>
        <p className="text-xs">ĐT: 0933 002 168</p>
      </div>

      {/* Order Info */}
      <div className="mb-4 text-sm">
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Hóa đơn:</span>
          <span>#{order.id}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Bàn:</span>
          <span>{order.table?.name || `Bàn ${order.table_id}`}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Giờ vào:</span>
          <span>{formatDateTime(order.check_in)}</span>
        </div>
        {order.check_out && (
          <div className="flex justify-between mb-1">
            <span className="font-semibold">Giờ ra:</span>
            <span>{formatDateTime(order.check_out)}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="mb-4">
        <table className="w-full text-xs border-collapse border-2 border-gray-800">
          <thead>
            <tr className="border-b-2 border-gray-800 bg-gray-100">
              <th className="text-left py-1 px-1 font-bold border-r border-gray-600">Món</th>
              <th className="text-center py-1 px-1 font-bold border-r border-gray-600 w-8">SL</th>
              <th className="text-right py-1 px-1 font-bold border-r border-gray-600 w-16">Giá</th>
              <th className="text-right py-1 px-1 font-bold w-16">T.tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="py-1 px-1 border-r border-gray-400 whitespace-nowrap overflow-hidden max-w-[100px]">{item.name}</td>
                <td className="py-1 px-1 text-center border-r border-gray-400">{item.quantity}</td>
                <td className="py-1 px-1 text-right border-r border-gray-400 whitespace-nowrap text-[10px]">
                  {formatCurrency(item.price_at_order_time)}
                </td>
                <td className="py-1 px-1 text-right font-semibold whitespace-nowrap text-[10px]">
                  {formatCurrency(item.price_at_order_time * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-4 pt-3 border-t-2 border-gray-800">
        <div className="flex justify-between mb-2 text-sm">
          <span>Tạm tính:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between mb-2 text-sm">
          <span>VAT (0%):</span>
          <span>{formatCurrency(0)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-dashed border-gray-400">
          <span className="font-bold text-lg">TỔNG CỘNG:</span>
          <span className="font-bold text-lg">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs pt-3 border-t-2 border-dashed border-gray-800">
        <p className="mb-1 font-semibold">Cảm ơn quý khách!</p>
        <p className="mb-1">Hẹn gặp lại</p>
        <p className="text-gray-600 mt-2">
          In lúc: {new Date().toLocaleString("vi-VN")}
        </p>
      </div>
    </div>
  );
});

MiniBill.displayName = "MiniBill";

export default MiniBill;
