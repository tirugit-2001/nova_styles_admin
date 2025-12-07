import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormModal from "../../components/FormModel";
import { ProductSectionAPI, requestHandler } from "../../config/api";
import { toast } from "sonner";

const DEFAULT_TEXTURES = [
  "Non Woven",
  "Sand Texture",
  "Wall Fabric",
  "Fabric Strokes",
  "Canvas",
  "Vinyl Self Adhesive",
];

export interface PaperTexture {
  name: string;
  rate: number;
}

export class ProductAdminModel {
  _id?: string;
  id?: string | null;
  name: string = "";
  price: number = 0;
  description: string = "";
  image: string = "";
  stock: number = 0;
  isTrending: boolean = false;
  paperTextures: PaperTexture[] = [];
  colours: string[] = [];
  material: string[] = [];
  print: string[] = [];
  installation: string[] = [];
  application: string[] = [];
}

export function ProductAdmin() {
  const [dataArray, setDataArray] = useState<ProductAdminModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<"Add" | "Edit" | "">("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ProductAdminModel | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Temporary string states for array inputs
  const [coloursInput, setColoursInput] = useState("");
  const [materialInput, setMaterialInput] = useState("");
  const [printInput, setPrintInput] = useState("");
  const [installationInput, setInstallationInput] = useState("");
  const [applicationInput, setApplicationInput] = useState("");

  // State for texture prices
  const [texturePrices, setTexturePrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    DEFAULT_TEXTURES.forEach(texture => {
      initial[texture] = 0;
    });
    return initial;
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductAdminModel>({
    defaultValues: new ProductAdminModel(),
  });

  const isTrendingValue = watch("isTrending");

  // ✅ Fetch all products
  function getAllProducts() {
    requestHandler(
      async () => await ProductSectionAPI.getProduct(),
      (data) => {
        const products = data.products.map((product: any) => ({
          ...product,
          id: product._id,
          isTrending: Boolean(product.isTrending),
        }));
        setDataArray(products);
        toast.success("Products loaded successfully");
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to fetch products");
      }
    );
  }

  useEffect(() => {
    getAllProducts();
  }, []);

  // Helper: Convert comma-separated string to array
  const parseCommaSeparated = (input: string): string[] => {
    return input.split(",").map((s) => s.trim()).filter(Boolean);
  };

  // Helper: Build product data from form
  const buildProductData = (formData: ProductAdminModel) => {
    // Get the current value from watch to ensure we have the latest state
    const currentIsTrending = isTrendingValue ?? formData.isTrending ?? false;
    
    // Build paperTextures array with name and rate
    const paperTextures: PaperTexture[] = DEFAULT_TEXTURES.map(texture => ({
      name: texture,
      rate: texturePrices[texture] || 0
    }));
    
    return {
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description,
      isTrending: Boolean(currentIsTrending),
      paperTextures: paperTextures,
      colours: parseCommaSeparated(coloursInput),
      material: parseCommaSeparated(materialInput),
      print: parseCommaSeparated(printInput),
      installation: parseCommaSeparated(installationInput),
      application: parseCommaSeparated(applicationInput),
    };
  };

  // Helper: Handle API response
  const handleApiSuccess = (message: string) => {
    toast.success(message);
    closeModal();
  };

  const handleApiError = (errorMessage: string, defaultMessage: string) => {
    toast.error(errorMessage || defaultMessage);
  };

  // ✅ Submit (Add / Edit)
  const onSubmit = async (formData: ProductAdminModel) => {
    // Validate image for new products
    if (action === "Add" && !selectedImageFile) {
      toast.error("Please select an image for the product");
      return;
    }

    const productData = buildProductData(formData);
    const imageFile = selectedImageFile || undefined;

    setIsSaving(true);

    try {
      if (action === "Add") {
        await requestHandler(
          async () => await ProductSectionAPI.addProduct(productData, imageFile),
          (data) => handleApiSuccess(data.message || "Product added successfully!"),
          (errorMessage) => handleApiError(errorMessage, "Failed to add product")
        );
        getAllProducts();
      } else if (action === "Edit" && editId) {
        await requestHandler(
          async () => await ProductSectionAPI.editProduct(editId, productData, imageFile),
          (data) => handleApiSuccess(data.message || "Product updated successfully!"),
          (errorMessage) => handleApiError(errorMessage, "Failed to update product")
        );
        getAllProducts();
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Delete
  const handleDelete = (id: string | null) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this product?")) return;

    requestHandler(
      async () => await ProductSectionAPI.deleteProduct(id),
      (data) => {
        toast.success(data.message || "Product deleted successfully!");
        getAllProducts();
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to delete product");
      }
    );
  };

  // Helper: Convert array to comma-separated string
  const arrayToCommaSeparated = (arr: string[] | undefined): string => {
    return arr?.join(", ") || "";
  };

  const handleEdit = (item: ProductAdminModel) => {
    setAction("Edit");
    setEditId(item.id || null);
    setEditingItem(item);
    setIsModalOpen(true);

    // Set form values
    setValue("name", item.name);
    setValue("price", item.price);
    setValue("stock", item.stock);
    setValue("description", item.description);
    setValue("isTrending", item.isTrending || false);

    // Set image preview and reset file selection
    setImagePreview(item.image || "");
    setSelectedImageFile(null);

    // Set array inputs as comma-separated strings
    setColoursInput(arrayToCommaSeparated(item.colours));
    setMaterialInput(arrayToCommaSeparated(item.material));
    setPrintInput(arrayToCommaSeparated(item.print));
    setInstallationInput(arrayToCommaSeparated(item.installation));
    setApplicationInput(arrayToCommaSeparated(item.application));

    // Load texture prices
    const texturePricesMap: Record<string, number> = {};
    DEFAULT_TEXTURES.forEach(texture => {
      texturePricesMap[texture] = 0; // Default to 0
    });
    
    // If item has paperTextures as array of objects, load them
    if (item.paperTextures && Array.isArray(item.paperTextures)) {
      item.paperTextures.forEach((texture: any) => {
        if (typeof texture === 'object' && texture.name && typeof texture.rate === 'number') {
          texturePricesMap[texture.name] = texture.rate;
        } else if (typeof texture === 'string') {
          // Handle legacy string format
          if (texturePricesMap.hasOwnProperty(texture)) {
            texturePricesMap[texture] = 0;
          }
        }
      });
    }
    setTexturePrices(texturePricesMap);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset(new ProductAdminModel());
    setAction("");
    setEditId(null);
    setEditingItem(null);
    setSelectedImageFile(null);
    setImagePreview("");
    
    // Clear array inputs
    setColoursInput("");
    setMaterialInput("");
    setPrintInput("");
    setInstallationInput("");
    setApplicationInput("");

    // Reset texture prices
    const resetPrices: Record<string, number> = {};
    DEFAULT_TEXTURES.forEach(texture => {
      resetPrices[texture] = 0;
    });
    setTexturePrices(resetPrices);
  };

  // Helper: Revoke blob URL if it exists
  const revokeBlobUrl = (url: string) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Clean up previous preview
    if (imagePreview) {
      revokeBlobUrl(imagePreview);
    }

    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    toast.success("Image selected");
  };

  // Remove selected image
  const handleRemoveImage = () => {
    if (imagePreview) {
      revokeBlobUrl(imagePreview);
    }

    setSelectedImageFile(null);
    setImagePreview(editingItem?.image || "");
    
    // Reset file input
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        revokeBlobUrl(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto mt-4">
        {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Manager</h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setAction("Add");
            setEditingItem(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New
        </button>
      </div>

      {/* Modal */}
      <FormModal
        isOpen={isModalOpen}
        title={action === "Edit" ? "Edit Product" : "Add Product"}
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={action === "Edit" ? "Update" : "Save"}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Name</label>
            <input
              {...register("name", { required: "Name is required" })}
              className="border p-2 w-full rounded"
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* 🖼️ Image Upload */}
          <div>
            <label className="block font-medium mb-1">Image</label>
            {imagePreview ? (
              <div className="space-y-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 rounded object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Upload a file
                </label>
                <p className="text-gray-600 mt-2">or drag and drop</p>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* <div>
              <label className="block font-medium mb-1">Price (₹)</label>
              <input
                type="number"
                {...register("price", { required: "Price is required" })}
                className="border p-2 w-full rounded"
                placeholder="899"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div> */}

            <div>
              <label className="block font-medium mb-1">Stock</label>
              <input
                type="number"
                {...register("stock", { required: "Stock is required" })}
                className="border p-2 w-full rounded"
                placeholder="25"
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isTrending"
              checked={Boolean(isTrendingValue)}
              {...register("isTrending")}
              onChange={(e) => {
                const checked = e.target.checked;
                setValue("isTrending", checked, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
              }}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isTrending" className="font-medium">
              Mark product as trending
            </label>
          </div>

          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              {...register("description", { required: "Description is required" })}
              className="border p-2 w-full rounded"
              placeholder="Product description"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">Application / Category</label>
            <select
              value={applicationInput}
              onChange={(e) => setApplicationInput(e.target.value)}
              className="border p-2 w-full rounded bg-white"
            >
              <option value="">Select an option</option>
              <option value="Kids & Playful Spaces">Kids & Playful Spaces</option>
              <option value="Heritage & Vintage Art">Heritage & Vintage Art</option>
              <option value="Indian Cultural Art – Pichwai">
                Indian Cultural Art – Pichwai
              </option>
              <option value="Tropical Nature & Leaves">Tropical Nature & Leaves</option>
              <option value="Peacock Elegance Collection Nature & Leaves">
                Peacock Elegance Collection Nature & Leaves
              </option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Textures & Pricing</label>
            <div className="space-y-2 border p-3 rounded bg-gray-50">
              {DEFAULT_TEXTURES.map((texture) => (
                <div key={texture} className="flex items-center gap-3">
                  <label className="w-40 text-sm font-medium text-gray-700">
                    {texture}:
                  </label>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-gray-600">₹</span>
                    <input
                      type="number"
                      value={texturePrices[texture] || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setTexturePrices(prev => ({
                          ...prev,
                          [texture]: value
                        }));
                      }}
                      className="border p-2 w-full rounded bg-white"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Set price for each texture</p>
          </div>

          <div>
            <label className="block font-medium mb-1">Colours</label>
            <input
              type="text"
              disabled = {true}
              value={coloursInput}
              onChange={(e) => setColoursInput(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Beige, Grey, White (comma-separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
          </div>

          <div>
            <label className="block font-medium mb-1">Material</label>
            <input
              type="text"
              disabled = {true}
              value={materialInput}
              onChange={(e) => setMaterialInput(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Vinyl, Paper (comma-separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
          </div>

          <div>
            <label className="block font-medium mb-1">Print Type</label>
            <input
              type="text"
              disabled = {true}
              value={printInput}
              onChange={(e) => setPrintInput(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Digital, UV (comma-separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
          </div>

          <div>
            <label className="block font-medium mb-1">Installation</label>
            <input
              type="text"
              disabled = {true}
              value={installationInput}
              onChange={(e) => setInstallationInput(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Wall Mount, Peel and Stick (comma-separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
          </div>

          
        </div>
      </FormModal>

      {/* List of saved products */}
      <hr className="border border-black" />
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Saved Product Data</h3>
        {dataArray.length === 0 && (
          <p className="text-gray-500">
            No product data saved yet. Click "Create New" to add one.
          </p>
        )}
        <ul className="space-y-3">
          {dataArray.map((item) => (
            <li
              key={item.id}
              className="border p-4 rounded shadow-sm hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-lg">{item.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <div className="mt-2 flex gap-4">
                        <p className="text-sm font-semibold text-green-600">
                          ₹{item.price}
                        </p>
                        <p className="text-sm text-gray-600">Stock: {item.stock}</p>
                        {item.isTrending && (
                          <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                            Trending
                          </span>
                        )}
                      </div>
                      
                      {/* Display arrays */}
                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        {item.paperTextures && item.paperTextures.length > 0 && (
                          <div>
                            <strong>Textures:</strong>
                            <ul className="ml-4 mt-1 space-y-0.5">
                              {item.paperTextures.map((texture: any, idx: number) => {
                                if (typeof texture === 'object' && texture.name && typeof texture.rate === 'number') {
                                  return (
                                    <li key={idx}>
                                      {texture.name}: ₹{texture.rate}
                                    </li>
                                  );
                                } else if (typeof texture === 'string') {
                                  return <li key={idx}>{texture}</li>;
                                }
                                return null;
                              })}
                            </ul>
                          </div>
                        )}
                        {item.colours && item.colours.length > 0 && (
                          <p><strong>Colours:</strong> {item.colours.join(", ")}</p>
                        )}
                        {item.material && item.material.length > 0 && (
                          <p><strong>Material:</strong> {item.material.join(", ")}</p>
                        )}
                        {item.print && item.print.length > 0 && (
                          <p><strong>Print:</strong> {item.print.join(", ")}</p>
                        )}
                        {item.installation && item.installation.length > 0 && (
                          <p><strong>Installation:</strong> {item.installation.join(", ")}</p>
                        )}
                        {item.application && item.application.length > 0 && (
                          <p><strong>Application:</strong> {item.application.join(", ")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(String(item.id))}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {isSaving && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white px-6 py-4 rounded shadow-lg text-lg font-semibold text-gray-700">
          Saving product...
        </div>
      </div>
    )}
    </>
  );
}