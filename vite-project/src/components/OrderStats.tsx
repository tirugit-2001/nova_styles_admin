import { useEffect, useState } from "react";
import { OrderAPI, requestHandler, type OrderStats as OrderStatsType } from "../config/api";
import { toast } from "sonner";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";

export function OrderStats() {
  const [stats, setStats] = useState<OrderStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  const getDateRange = (filter: string) => {
    const now = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (filter === "today") {
      startDate = now.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
    } else if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      startDate = weekAgo.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
    } else if (filter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      startDate = monthAgo.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
    }

    return { startDate, endDate };
  };

  const fetchStats = () => {
    setLoading(true);
    const { startDate, endDate } = getDateRange(dateFilter);
    const filters = startDate && endDate ? { startDate, endDate } : undefined;

    requestHandler(
      async () => await OrderAPI.getStats(filters),
      (data) => {
        setStats(data.stats);
        setLoading(false);
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to fetch statistics");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchStats();
  }, [dateFilter]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  // Calculate individual status counts from byStatus array
  const getStatusCount = (statusName: string) => {
    const status = stats.byStatus.find((s) => s._id === statusName);
    return status?.count || 0;
  };

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending",
      value: getStatusCount("Pending"),
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Processing",
      value: getStatusCount("Processing"),
      icon: Package,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Shipped",
      value: getStatusCount("Shipped"),
      icon: Truck,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Delivered",
      value: getStatusCount("Delivered"),
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Completed",
      value: getStatusCount("Completed"),
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Cancelled",
      value: getStatusCount("Cancelled"),
      icon: XCircle,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.revenue.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Average Order Value",
      value: `₹${stats.revenue.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        {(["all", "today", "week", "month"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setDateFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateFilter === filter
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">{card.title}</p>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {stats.byStatus && stats.byStatus.length > 0 ? (
              stats.byStatus.map((item, index) => {
                const total = stats.byStatus.reduce(
                  (sum, i) => sum + i.count,
                  0
                );
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {item._id}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Revenue: ₹{item.totalRevenue.toLocaleString()}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Summary</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{stats.revenue.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders (Revenue)</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.revenue.totalOrders}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
              <p className="text-xl font-semibold text-blue-600">
                ₹{stats.revenue.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Order Completion Rate</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${stats.totalOrders > 0 ? (getStatusCount("Completed") / stats.totalOrders) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {stats.totalOrders > 0
                    ? ((getStatusCount("Completed") / stats.totalOrders) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

