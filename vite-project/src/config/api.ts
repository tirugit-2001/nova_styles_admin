import type { AxiosResponse } from "axios";
import type { HeroSectionModel } from "../pages/AdminComponents/HeroSectionAdmin";
import { axios } from "./axios";
import type { ProductAdminModel } from "../pages/e-commorce/ProductAdmin";
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

export const ProductSectionAPI = {
  getProduct: async () => {
    const res = await axios.get("/api/v1/product");
    console.log(res);
    return res;
  },

  addProduct: async (data: ProductAdminModel) => {
    const res = await axios.post("/api/v1/product", data);
    return res;
  },

  editProduct: async (id: string, data: ProductAdminModel) => {
    const res = await axios.put(`/api/v1/product/${id}`, data);
    return res;
  },

  deleteProduct: async (id: string) => {
    const res = await axios.delete(`/api/v1/product/${id}`);
    return res;
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