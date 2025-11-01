import { type ClassValue, clsx } from "clsx";
import moment from "moment-timezone";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDate(date: string, timezone: string = "UTC"): string {
  return moment.utc(date).tz(timezone).format("DD/MM/YYYY");
}

export function formatDateTime(date: string, timezone: string = "UTC"): string {
  return moment.utc(date).tz(timezone).format("DD/MM/YYYY, HH:mm");
}

export function formatTime(date: string, timezone: string = "UTC"): string {
  return moment.utc(date).tz(timezone).format("HH:mm");
}

export function getTableStatusColor(status: "available" | "occupied"): string {
  return status === "available" ? "bg-green-500" : "bg-red-500";
}

export function getOrderStatusColor(
  status: "pending" | "completed" | "cancelled"
): string {
  switch (status) {
    case "pending":
      return "badge-warning";
    case "completed":
      return "badge-success";
    case "cancelled":
      return "badge-danger";
    default:
      return "badge-info";
  }
}

export function getOrderStatusText(
  status: "pending" | "completed" | "cancelled"
): string {
  switch (status) {
    case "pending":
      return "Đang phục vụ";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

export function getTableStatusText(status: "available" | "occupied"): string {
  return status === "available" ? "Trống" : "Có khách";
}
