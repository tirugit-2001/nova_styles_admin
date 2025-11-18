import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrderAPI, requestHandler, type Order, transformOrder } from "../config/api";
import { toast } from "sonner";
import { ArrowLeft, Package, MapPin, Mail, FileText, Download, Send, Plus } from "lucide-react";
import { InvoicePreview } from "./InvoicePreview";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Completed",
  "Cancelled",
] as const;

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [newLocation, setNewLocation] = useState<string>("");
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [trackingEntry, setTrackingEntry] = useState({
    location: "",
    status: "",
    notes: "",
  });

  const fetchOrder = () => {
    if (!id) return;
    setLoading(true);
    requestHandler(
      async () => await OrderAPI.getOrder(id),
      (data) => {
        const orderData = transformOrder(data.order);
        setOrder(orderData);
        setNewStatus(orderData.orderStatus);
        setNewLocation(orderData.currentLocation || "");
        setLoading(false);
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to fetch order details");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = () => {
    if (!id || !newStatus) return;
    setUpdating(true);
    requestHandler(
      async () => await OrderAPI.updateStatus(id, newStatus),
      (_data) => {
        toast.success("Order status updated successfully");
        fetchOrder();
        setUpdating(false);
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to update status");
        setUpdating(false);
      }
    );
  };

  const handleLocationUpdate = () => {
    if (!id || !newLocation.trim()) {
      toast.error("Please enter a location");
      return;
    }
    setUpdating(true);
    requestHandler(
      async () => await OrderAPI.updateLocation(id, newLocation.trim()),
      (_data) => {
        toast.success("Location updated successfully");
        fetchOrder();
        setUpdating(false);
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to update location");
        setUpdating(false);
      }
    );
  };

  const handleAddTracking = () => {
    if (!id || !trackingEntry.location.trim() || !trackingEntry.status.trim()) {
      toast.error("Please fill in location and status");
      return;
    }
    setUpdating(true);
    requestHandler(
      async () =>
        await OrderAPI.addTracking(id, {
          location: trackingEntry.location.trim(),
          status: trackingEntry.status.trim(),
          notes: trackingEntry.notes.trim(),
        }),
      (_data) => {
        toast.success("Tracking entry added successfully");
        setTrackingEntry({ location: "", status: "", notes: "" });
        fetchOrder();
        setUpdating(false);
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to add tracking entry");
        setUpdating(false);
      }
    );
  };

  const handleGenerateInvoice = async () => {
    if (!id) return;
    setUpdating(true);
    requestHandler(
      async () => await OrderAPI.generateInvoice(id),
      async (data) => {
        toast.success("Invoice generated successfully");
        // Refresh order to get updated invoice info
        fetchOrder();
        
        // Wait a moment for the PDF to be fully written to disk, then auto-download
        setTimeout(async () => {
          try {
            const response = await OrderAPI.downloadInvoice(id);
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const invoiceNumber = data.invoice?.invoiceNumber || order?.orderNumber || id;
            link.download = `invoice-${invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Show toast with option to send via email
            toast.success("Invoice downloaded automatically", {
              action: {
                label: "Send via Email",
                onClick: () => {
                  if (id) {
                    setUpdating(true);
                    requestHandler(
                      async () => await OrderAPI.sendInvoice(id),
                      (_sendData) => {
                        toast.success("Invoice sent to customer successfully");
                        fetchOrder();
                        setUpdating(false);
                      },
                      (errorMessage) => {
                        toast.error(errorMessage || "Failed to send invoice");
                        setUpdating(false);
                      }
                    );
                  }
                },
              },
            });
          } catch (error: any) {
            console.error("Auto-download failed:", error);
            toast.info("Invoice generated. You can download it manually using the Download button.");
          }
        }, 1000); // Wait 1 second for PDF to be ready
        
        setUpdating(false);
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to generate invoice");
        setUpdating(false);
      }
    );
  };

  const handleDownloadInvoice = async () => {
    if (!id) return;
    try {
      const response = await OrderAPI.downloadInvoice(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order?.orderNumber || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to download invoice");
    }
  };

  const handleSendInvoice = () => {
    if (!id) return;
    setUpdating(true);
    requestHandler(
      async () => await OrderAPI.sendInvoice(id),
      (_data) => {
        toast.success("Invoice sent to customer successfully");
        fetchOrder();
        setUpdating(false);
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to send invoice");
        setUpdating(false);
      }
    );
  };

  const handleSendNotification = () => {
    if (!id || !order) return;
    setUpdating(true);
    requestHandler(
      async () => await OrderAPI.sendNotification(id, order),
      (_data) => {
        toast.success("Status update email sent to customer");
        setUpdating(false);
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to send notification");
        setUpdating(false);
      }
    );
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto mt-4">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-7xl mx-auto mt-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Order not found</p>
          <button
            onClick={() => navigate("/admin/orders")}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-gray-600">{order.orderNumber || order._id}</p>
          </div>
        </div>
        <button
          onClick={handleSendNotification}
          disabled={updating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Mail className="w-4 h-4" />
          Send Update Email
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Order Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-medium">{order.orderNumber || order._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === order.orderStatus}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  Update Status
                </button>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-medium capitalize">{order.paymentStatus || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Mode</p>
                <p className="font-medium capitalize">
                  {order.paymentMode?.replace("_", " ") || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-bold text-lg">₹{(order.totalAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.productName || "Unknown Product"}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      ₹{(item.price || 0).toLocaleString()} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipment Tracking
            </h3>

            {/* Current Location */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., Still in shop, In transit, Mumbai warehouse..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleLocationUpdate}
                  disabled={updating || !newLocation.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Add Tracking Entry */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Add Tracking Entry</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={trackingEntry.location}
                  onChange={(e) =>
                    setTrackingEntry({ ...trackingEntry, location: e.target.value })
                  }
                  placeholder="Location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  value={trackingEntry.status}
                  onChange={(e) =>
                    setTrackingEntry({ ...trackingEntry, status: e.target.value })
                  }
                  placeholder="Status (e.g., In transit, Out for delivery)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <textarea
                  value={trackingEntry.notes}
                  onChange={(e) =>
                    setTrackingEntry({ ...trackingEntry, notes: e.target.value })
                  }
                  placeholder="Notes (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleAddTracking}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Tracking Entry
                </button>
              </div>
            </div>

            {/* Tracking Timeline */}
            {order.shipmentTracking && order.shipmentTracking.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Tracking History</h4>
                <div className="relative">
                  {order.shipmentTracking
                    .slice()
                    .reverse()
                    .map((tracking, index) => (
                      <div
                        key={index}
                        className="flex gap-4 pb-4 last:pb-0 relative"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          {index < order.shipmentTracking.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 absolute top-3"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{tracking.location}</p>
                              <p className="text-sm text-gray-600">{tracking.status}</p>
                              {tracking.notes && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {tracking.notes}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatDate(tracking.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.customer?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.customer?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{order.customer?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">
                  {order.customer?.address?.street || "N/A"}
                  <br />
                  {order.customer?.address?.city || "N/A"}, {order.customer?.address?.state || "N/A"}{" "}
                  {order.customer?.address?.zipCode || "N/A"}
                  <br />
                  {order.customer?.address?.country || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Invoice
            </h3>
            {order.invoice ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-medium">{order.invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Generated</p>
                  <p className="font-medium">
                    {formatDate(order.invoice.generatedAt)}
                  </p>
                </div>
                {order.invoice.sentAt && (
                  <div>
                    <p className="text-sm text-gray-600">Sent</p>
                    <p className="font-medium">
                      {formatDate(order.invoice.sentAt)}
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-2 pt-3 border-t">
                  <button
                    onClick={() => setShowInvoicePreview(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={handleDownloadInvoice}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handleSendInvoice}
                    disabled={updating}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Send Email
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  No invoice generated yet
                </p>
                <button
                  onClick={handleGenerateInvoice}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  Generate Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {showInvoicePreview && order.invoice && (
        <InvoicePreview
          orderId={order._id}
          invoiceNumber={order.invoice.invoiceNumber}
          onClose={() => setShowInvoicePreview(false)}
          onDownload={handleDownloadInvoice}
          onSend={handleSendInvoice}
        />
      )}
    </div>
  );
}

