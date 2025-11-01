import { useOrders, useTables, useCompletePayment } from "@/lib/queries";
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
  getOrderStatusText,
} from "@/lib/utils";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import MiniBill from "@/components/common/MiniBill";
import { Receipt, Search } from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import type { OrderStatus } from "@/types";
export default function Orders() {
  const { data: orders, isLoading, error, refetch } = useOrders();
  const { data: tables } = useTables();
  const completePayment = useCompletePayment();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(
    null
  );
  const [selectedOrder, setSelectedOrder] = useState<
    (typeof ordersWithTableInfo)[0] | null
  >(null);
  const billRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: billRef,
    documentTitle: `Bill_${
      selectedOrder?.table?.name || "Ban" + selectedOrder?.table_id
    }_${selectedOrder?.id}`,
    onAfterPrint: () => {
      // After printing, ask for confirmation
      if (selectedOrder) {
        confirmPayment(selectedOrder);
      }
    },
  });

  // Memoized orders with table info
  const ordersWithTableInfo = useMemo(() => {
    return (
      orders?.map((order) => {
        const table = tables?.find((t) => t.id === order.table_id);
        return { ...order, table };
      }) || []
    );
  }, [orders, tables]);

  // Memoized filtered orders
  const filteredOrders = useMemo(() => {
    return ordersWithTableInfo.filter((order) => {
      const matchesFilter = filter === "all" || order.status === filter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.table?.name?.toLowerCase().includes(searchLower) ||
        `bàn ${order.table_id}`.toLowerCase().includes(searchLower);
      return matchesFilter && matchesSearch;
    });
  }, [ordersWithTableInfo, filter, searchTerm]);

  // Memoized counts
  const { pendingCount, completedCount } = useMemo(
    () => ({
      pendingCount: orders?.filter((o) => o.status === "pending").length || 0,
      completedCount:
        orders?.filter((o) => o.status === "completed").length || 0,
    }),
    [orders]
  );

  const confirmPayment = async (order: (typeof ordersWithTableInfo)[0]) => {
    if (
      !confirm(
        `Xác nhận hoàn tất thanh toán cho ${
          order.table?.name || `Bàn ${order.table_id}`
        }?`
      )
    ) {
      setProcessingOrderId(null);
      return;
    }

    try {
      await completePayment.mutateAsync({
        orderId: order.id,
        amount: order.total_amount || 0,
      });

      alert("Thanh toán thành công!");
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handlePayment = (order: (typeof ordersWithTableInfo)[0]) => {
    setProcessingOrderId(order.id);
    setSelectedOrder(order);

    // Trigger print after a short delay to ensure state is updated
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  if (isLoading) {
    return <LoadingSpinner text="Đang tải danh sách order..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Không thể tải danh sách order"
        retry={() => refetch()}
      />
    );
  }

  return (
    <div className="p-4 pb-20 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-sm text-gray-600">
          {pendingCount} đang chờ thanh toán · {completedCount} đã hoàn thành
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tên bàn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setFilter("all")}
          className={`btn text-sm whitespace-nowrap ${
            filter === "all" ? "btn-primary" : "btn-secondary"
          }`}
        >
          Tất cả ({orders?.length || 0})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`btn text-sm whitespace-nowrap ${
            filter === "pending" ? "btn-primary" : "btn-secondary"
          }`}
        >
          Đang chờ ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`btn text-sm whitespace-nowrap ${
            filter === "completed" ? "btn-success" : "btn-secondary"
          }`}
        >
          Hoàn thành ({completedCount})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Không có order nào</p>
            <p className="text-xs text-gray-400 mt-1">
              {filter === "pending"
                ? "Chưa có order đang chờ thanh toán"
                : "Hãy tạo order từ màn hình Tables"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="card border-l-4 border-primary-500">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                      {order.table?.name?.match(/\d+/)?.[0] || order.table_id}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {order.table?.name || `Bàn ${order.table_id}`}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    Check-in: {formatDateTime(order.check_in)}
                  </p>
                  {order.check_out && (
                    <p className="text-xs text-gray-500">
                      Check-out:{" "}
                      {formatDateTime(order.check_out, "Asia/Ho_Chi_Minh")}
                    </p>
                  )}
                  {order.items && order.items.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      {order.items.length} món
                    </p>
                  )}
                </div>
                <span className={`badge ${getOrderStatusColor(order.status)}`}>
                  {getOrderStatusText(order.status)}
                </span>
              </div>

              {/* Order Footer */}
              <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tổng cộng</p>
                  <span className="font-bold text-2xl text-primary-600">
                    {formatCurrency(order.total_amount || 0)}
                  </span>
                </div>
                {order.status === "pending" && (
                  <button
                    className="btn bg-green-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePayment(order)}
                    disabled={
                      processingOrderId === order.id ||
                      completePayment.isPending
                    }
                  >
                    {processingOrderId === order.id ? (
                      <>Đang xử lý...</>
                    ) : (
                      <>Thanh toán</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Hidden Bill for Printing */}
      <div className="hidden">
        {selectedOrder && selectedOrder.total_amount !== undefined && (
          <MiniBill ref={billRef} order={{
            id: selectedOrder.id,
            table_id: selectedOrder.table_id,
            check_in: selectedOrder.check_in,
            check_out: selectedOrder.check_out,
            total_amount: selectedOrder.total_amount,
            items: selectedOrder.items?.map(item => ({
              id: item.id,
              name: item.menu_item?.name || 'Unknown',
              quantity: item.quantity,
              price_at_order_time: item.price_at_order_time
            })),
            table: selectedOrder.table
          }} />
        )}
      </div>
    </div>
  );
}
