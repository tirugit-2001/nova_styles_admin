import type { AxiosResponse } from "axios";
import type { HeroSectionModel } from "../pages/AdminComponents/HeroSectionAdmin";
import { axios } from "./axios";
import type { ProductAdminModel, PaperTexture } from "../pages/e-commorce/ProductAdmin";
import type { PortfolioAdminModel } from "../pages/AdminComponents/PortfolioAdmin";

export const requestHandler = async (
  api: () => Promise<AxiosResponse<any, any>>,
  onSuccess: (data: any) => void,
  onError: (error: string) => void
) => {
  try {
    const response = await api();

    if (response && response.data) {
      const { data } = response;

      if (data.success) {
        onSuccess(data);
      } else {
        console.log("API returned success: false");
        onError(data.message || "Something went wrong");
      }
    }
  } catch (error: any) {
    console.error("Request error:", error);

    if (error.response?.data?.message) {
      onError(error.response.data.message);
    } else {
      onError(error.message || "Something went wrong");
    }
  }
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;
export default backendUrl;

export const HeroSectionAPI = {
  getHero: async () => {
    const res = await axios.get("/api/v1/heroContent/hero");
    console.log(res.data.heroes[0]);
    return res;
  },

  addHero: async (data: HeroSectionModel) => {
    const res = await axios.post("/api/v1/heroContent/hero", data);
    return res;
  },

  editHero: async (id: string, data: HeroSectionModel) => {
    const res = await axios.put(`/api/v1/heroContent/hero/${id}`, data);
    return res;
  },

  deleteHero: async (id: string) => {
    const res = await axios.delete(`/api/v1/heroContent/hero/${id}`);
    return res;
  },
};

// Helper function to build FormData for product
type ProductFormData = Omit<ProductAdminModel, "_id" | "id" | "image"> & {
  paperTextures: PaperTexture[];
  colours: string[];
  material: string[];
  print: string[];
  installation: string[];
  application: string[];
};

const buildProductFormData = (data: ProductFormData, imageFile?: File): FormData => {
  const form = new FormData();
  
  // Basic fields
  form.append("name", data.name);
  form.append("price", String(data.price));
  form.append("stock", String(data.stock));
  form.append("description", data.description);
  form.append("isTrending", String(!!data.isTrending));
  
  // PaperTextures as JSON (array of objects with name and rate)
  form.append("paperTextures", JSON.stringify(data.paperTextures));
  
  // Array fields with bracket notation
  const arrayFields = [
    { key: "colours[]", values: data.colours },
    { key: "material[]", values: data.material },
    { key: "print[]", values: data.print },
    { key: "installation[]", values: data.installation },
    { key: "application[]", values: data.application },
  ];
  
  arrayFields.forEach(({ key, values }) => {
    values.forEach((value) => form.append(key, value));
  });
  
  // Image file
  if (imageFile) {
    form.append("image", imageFile);
  }
  
  return form;
};

export const ProductSectionAPI = {
  getProduct: async () => {
    return await axios.get("/api/v1/product");
  },

  addProduct: async (data: ProductFormData, imageFile?: File) => {
    const form = buildProductFormData(data, imageFile);
    return await axios.post("/api/v1/product", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  editProduct: async (id: string, data: ProductFormData, imageFile?: File) => {
    const form = buildProductFormData(data, imageFile);
    return await axios.put(`/api/v1/product/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteProduct: async (id: string) => {
    return await axios.delete(`/api/v1/product/${id}`);
  },
};


export const PortfolioAPI = {
  // Optional query filters: ?showOnMainHome=true, etc.
  getPortfolio: async (params?: { showOnMainHome?: boolean; showOnInteriorHome?: boolean; showOnConstruction?: boolean }) => {
    const res = await axios.get("/api/v1/portfolioContent/portfolio", { params });
    return res;
  },

  addPortfolio: async (data: PortfolioAdminModel, imageFile?: File) => {
    const form = new FormData();
    form.append("title", data.title);
    form.append("location", data.location);
    form.append("category", data.category);
    form.append("showOnMainHome", String(!!data.showOnMainHome));
    form.append("showOnInteriorHome", String(!!data.showOnInteriorHome));
    form.append("showOnConstruction", String(!!data.showOnConstruction));
    if (imageFile) form.append("image", imageFile);

    const res = await axios.post("/api/v1/portfolioContent/portfolio", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  },

  editPortfolio: async (id: string, data: PortfolioAdminModel, imageFile?: File) => {
    const form = new FormData();
    form.append("title", data.title);
    form.append("location", data.location);
    form.append("category", data.category);
    form.append("showOnMainHome", String(!!data.showOnMainHome));
    form.append("showOnInteriorHome", String(!!data.showOnInteriorHome));
    form.append("showOnConstruction", String(!!data.showOnConstruction));
    if (imageFile) form.append("image", imageFile);

    const res = await axios.put(`/api/v1/portfolioContent/portfolio/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  },

  deletePortfolio: async (id: string) => {
    const res = await axios.delete(`/api/v1/portfolioContent/portfolio/${id}`);
    return res;
  },

  // Sections
  addSection: async (id: string, name: string) => {
    const res = await axios.post(`/api/v1/portfolioContent/portfolio/${id}/sections`, { name });
    return res;
  },

  // images: File[]
  addSectionImages: async (id: string, sectionIndex: number, images: File[]) => {
    const form = new FormData();
    images.forEach((f) => form.append("images", f));
    const res = await axios.post(
      `/api/v1/portfolioContent/portfolio/${id}/sections/${sectionIndex}/images`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res;
  },

  // ✅ CORRECT - Matches backend route
  // Add multiple images to portfolio gallery
  addPortfolioImages: async (portfolioId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    const res = await axios.post(
      `/api/v1/portfolioContent/portfolio/${portfolioId}/images`, // ✅ Correct
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res;
  },

  // ✅ CORRECT - Matches backend route
  // Delete a single image from portfolio gallery
  deletePortfolioImage: async (portfolioId: string, imageUrl: string) => {
    const encodedUrl = encodeURIComponent(imageUrl);
    const res = await axios.delete(
      `/api/v1/portfolioContent/portfolio/${portfolioId}/images/${encodedUrl}` // ✅ Correct
    );
    return res;
  },
};

interface CreateAdminData {
  email: string;
  password: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const AuthAPI = {
  createAdmin: async (data: CreateAdminData) => {
    const res = await axios.post("/api/v1/auth/create-admin", data);
    return res;
  },

  changePassword: async (data: ChangePasswordData) => {
    const res = await axios.put("/api/v1/auth/change-password", data);
    return res;
  },

  logout: async () => {
    const res = await axios.post("/api/v1/auth/logout");
    return res;
  },
};

// Order Management Types
export interface OrderFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMode?: string;
  search?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: CustomerAddress;
}

export interface ShipmentTracking {
  location: string;
  status: string;
  timestamp: Date | string;
  notes: string;
}

export interface Invoice {
  invoiceNumber: string;
  pdfPath: string;
  generatedAt: Date | string;
  sentAt?: Date | string;
}

export interface Order {
  _id: string;
  id?: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  paymentMode: 'online' | 'cod' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Completed' | 'Cancelled';
  currentLocation: string;
  shipmentTracking: ShipmentTracking[];
  invoice?: Invoice;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
}

// API Response type (what we actually receive from backend)
interface ApiOrderResponse {
  _id: string;
  userId: string | { _id: string; username?: string; email?: string; phone?: number | string };
  addressId: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    zipCode?: string;
    country?: string;
  };
  items: Array<{
    productId: string | { _id: string; name?: string; [key: string]: any };
    name?: string;
    productName?: string;
    image?: string;
    price?: number;
    quantity?: number;
    [key: string]: any;
  }>;
  totalAmount: number;
  paymentMethod?: string;
  paymentMode?: string;
  paymentId?: string | { status?: string; [key: string]: any };
  status?: string;
  orderStatus?: string;
  tracking?: any[];
  shipmentTracking?: ShipmentTracking[];
  currentLocation?: string;
  orderNumber?: string;
  invoice?: Invoice;
  createdAt: Date | string;
  updatedAt: Date | string;
  [key: string]: any;
}

// Transform API response to Order interface
export const transformOrder = (apiOrder: ApiOrderResponse): Order => {
  // Extract user info
  const userId = typeof apiOrder.userId === 'string' ? null : apiOrder.userId;
  const addressId = typeof apiOrder.addressId === 'string' ? null : apiOrder.addressId;
  
  // Build customer object
  const customer: Customer = {
    name: userId?.username || addressId?.firstName 
      ? `${addressId?.firstName || ''} ${addressId?.lastName || ''}`.trim() || userId?.username || 'N/A'
      : 'N/A',
    email: userId?.email || addressId?.email || 'N/A',
    phone: String(userId?.phone || addressId?.phone || 'N/A'),
    address: {
      street: addressId?.street || 'N/A',
      city: addressId?.city || 'N/A',
      state: addressId?.state || 'N/A',
      zipCode: addressId?.zipCode || addressId?.postalCode || 'N/A',
      country: addressId?.country || 'N/A',
    },
  };

  // Transform items
  const items: OrderItem[] = (apiOrder.items || []).map((item) => {
    const productId = typeof item.productId === 'string' ? item.productId : item.productId?._id || '';
    const productName = item.name || item.productName || 
      (typeof item.productId === 'object' ? item.productId.name : '') || 'Unknown Product';
    
    return {
      productId,
      productName,
      quantity: item.quantity || 0,
      price: item.price || 0,
      image: item.image || '',
    };
  });

  // Determine payment status from paymentId
  const paymentId = typeof apiOrder.paymentId === 'object' ? apiOrder.paymentId : null;
  const paymentStatusMap: Record<string, 'pending' | 'paid' | 'failed' | 'refunded'> = {
    'success': 'paid',
    'paid': 'paid',
    'pending': 'pending',
    'failed': 'failed',
    'refunded': 'refunded',
  };
  const paymentStatus = paymentId?.status 
    ? (paymentStatusMap[paymentId.status.toLowerCase()] || 'pending')
    : 'pending';

  // Map payment method
  const paymentMethod = apiOrder.paymentMethod || apiOrder.paymentMode || 'online';
  const paymentModeMap: Record<string, 'online' | 'cod' | 'bank_transfer'> = {
    'online': 'online',
    'cod': 'cod',
    'cash on delivery': 'cod',
    'bank_transfer': 'bank_transfer',
    'bank transfer': 'bank_transfer',
  };
  const paymentMode = paymentModeMap[paymentMethod.toLowerCase()] || 'online';

  // Map order status
  const status = apiOrder.status || apiOrder.orderStatus || 'pending';
  const orderStatusMap: Record<string, Order['orderStatus']> = {
    pending: 'Pending',
    placed: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    'out for delivery': 'Out for Delivery',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  const orderStatus = orderStatusMap[status.toLowerCase()] || 'Pending';

  // Generate order number if not present
  const orderNumber = apiOrder.orderNumber || `ORD-${apiOrder._id.slice(-8).toUpperCase()}`;

  return {
    _id: apiOrder._id,
    orderNumber,
    customer,
    items,
    totalAmount: apiOrder.totalAmount || 0,
    paymentMode,
    paymentStatus,
    orderStatus,
    currentLocation: apiOrder.currentLocation || '',
    shipmentTracking: apiOrder.shipmentTracking || apiOrder.tracking || [],
    invoice: apiOrder.invoice,
    createdAt: apiOrder.createdAt,
    updatedAt: apiOrder.updatedAt,
  };
};

export interface OrderStats {
  byStatus: Array<{
    _id: string; // Status name (e.g., "Pending", "Processing", etc.)
    count: number;
    totalRevenue: number;
  }>;
  totalOrders: number;
  revenue: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  };
}

export const OrderAPI = {
  // Get all orders with optional filters
  getOrders: async (filters?: OrderFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.paymentMode) params.append('paymentMode', filters.paymentMode);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = queryString ? `/api/v1/admin/orders?${queryString}` : '/api/v1/admin/orders';
    return await axios.get(url);
  },

  // Get single order by ID
  getOrder: async (id: string) => {
    return await axios.get(`/api/v1/admin/orders/${id}`);
  },

  // Update order status
  updateStatus: async (id: string, status: string) => {
    return await axios.put(`/api/v1/admin/orders/${id}/status`, { status });
  },

  // Update shipment location
  updateLocation: async (id: string, location: string) => {
    return await axios.put(`/api/v1/admin/orders/${id}/location`, { location });
  },

  // Add tracking entry (if this endpoint exists in admin routes)
  addTracking: async (id: string, tracking: { location: string; status: string; notes?: string }) => {
    // Note: This might need to be implemented in admin routes if it doesn't exist
    return await axios.post(`/api/v1/admin/orders/${id}/tracking`, tracking);
  },

  // Generate invoice PDF
  generateInvoice: async (id: string) => {
    return await axios.post(`/api/v1/admin/orders/${id}/invoice/generate`, {}, {
      withCredentials: true, // Explicitly ensure credentials are sent
    });
  },

  // Download invoice PDF
  downloadInvoice: async (id: string) => {
    return await axios.get(`/api/v1/admin/orders/${id}/invoice`, {
      responseType: 'blob',
    });
  },

  // Send invoice via email
  sendInvoice: async (id: string) => {
    return await axios.post(`/api/v1/orders/${id}/invoice/send`);
  },

  // Send status update notification to customer (admin route)
  sendNotification: async (id: string, orderData?: Partial<Order>, message?: string) => {
    return await axios.post(`/api/v1/admin/orders/${id}/notify`, { 
      order: orderData,
      message 
    });
  },

  // Get order statistics
  getStats: async (filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/api/v1/admin/orders/stats?${queryString}` : '/api/v1/admin/orders/stats';
    return await axios.get(url);
  },

  // Get all invoices
  getInvoices: async () => {
    return await axios.get('/api/v1/invoices');
  },
};