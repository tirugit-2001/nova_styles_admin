import type { AxiosResponse } from "axios";
import type { HeroSectionModel } from "../pages/AdminComponents/HeroSectionAdmin";
import { axios } from "./axios";
import type { ProductAdminModel } from "../pages/e-commorce/ProductAdmin";
// import type { APISuccessResponseInterface } from ".";


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
    const res = await axios.get("/heroContent/hero");
    console.log(res.data.heroes[0]);
    return res; // Return full response, not res.data
  },

  addHero: async (data: HeroSectionModel) => {
    const res = await axios.post("/heroContent/hero", data);
    return res; // Return full response
  },

  editHero: async (id: string, data: HeroSectionModel) => {
    const res = await axios.put(`/heroContent/hero/${id}`, data);
    return res; // Return full response
  },

  deleteHero: async (id: string) => {
    const res = await axios.delete(`/heroContent/hero/${id}`);
    return res; // Return full response
  },
};

export const ProductSectionAPI = {
  getProduct: async () => {
    const res = await axios.get("/product")
    console.log(res)
    return res;
  },
  addProduct: async(data:ProductAdminModel) => {
    const res = await axios.post('/product',data)
    return res
  },
  editProduct: async(id:string, data:ProductAdminModel) => {
    const res = await axios.put(`/product/${id}`,data)
    return res
  },
  deleteProduct: async (id:string) => {
    const res = await axios.delete(`/product/${id}`)
    return res
  }
}