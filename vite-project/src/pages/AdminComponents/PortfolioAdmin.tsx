import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PortfolioAPI, requestHandler } from "../../config/api";
import { toast } from "sonner";
import FormModal from "../../components/FormModel";
import ImageUploader from "../../components/ImageUploader";

export class PortfolioAdminModel {
  _id?: string;
  id?: string | null = "";
  title: string = "";
  location: string = "";
  category: string = "";
  image: string = "";
}

export function PortfolioAdmin() {
  const [dataArray, setDataArray] = useState<PortfolioAdminModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<"Add" | "Edit" | "">("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PortfolioAdminModel | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PortfolioAdminModel>({
    defaultValues: new PortfolioAdminModel(),
  });

  // Categories matching PortfolioWork component
  const categories = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office'];

  // ✅ Fetch all portfolio records
  function getAllPortfolio() {
    requestHandler(
      async () => await PortfolioAPI.getPortfolio(),
      (data) => {
        const portfolios = data.portfolios?.map((portfolio: any) => ({
          ...portfolio,
          id: portfolio._id,
        })) || [];
        setDataArray(portfolios);
        toast.success("Portfolio content loaded successfully");
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to fetch portfolio content");
      }
    );
  }

  useEffect(() => {
    getAllPortfolio();
  }, []);

  // ✅ Submit (Add / Edit)
  const onSubmit = (formData: PortfolioAdminModel) => {
    const { id, _id, ...restData } = formData;
    const portfolioData = { ...restData };

    if (action === "Add") {
      requestHandler(
        async () => await PortfolioAPI.addPortfolio(portfolioData),
        (data) => {
          toast.success(data.message || "Portfolio item added successfully!");
          getAllPortfolio();
          closeModal();
        },
        (errorMessage) => {
          toast.error(errorMessage || "Failed to add portfolio item");
        }
      );
    } else if (action === "Edit" && editId) {
      requestHandler(
        async () => await PortfolioAPI.editPortfolio(editId, portfolioData),
        (data) => {
          toast.success(data.message || "Portfolio item updated successfully!");
          getAllPortfolio();
          closeModal();
        },
        (errorMessage) => {
          toast.error(errorMessage || "Failed to update portfolio item");
        }
      );
    }
  };

  // ✅ Delete
  const handleDelete = (id: string | null) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this portfolio item?")) return;

    requestHandler(
      async () => await PortfolioAPI.deletePortfolio(id),
      (data) => {
        toast.success(data.message || "Portfolio item deleted successfully!");
        getAllPortfolio();
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to delete portfolio item");
      }
    );
  };

  // ✅ Edit
  const handleEdit = (item: PortfolioAdminModel) => {
    setAction("Edit");
    setEditId(item.id || null);
    setEditingItem(item);
    setIsModalOpen(true);
    setValue("title", item.title);
    setValue("location", item.location);
    setValue("category", item.category);
    setValue("image", item.image);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset(new PortfolioAdminModel());
    setAction("");
    setEditId(null);
    setEditingItem(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Portfolio card Manager</h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setAction("Add");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New
        </button>
      </div>

      {/* 🧩 Reusable Form Modal */}
      <FormModal
        isOpen={isModalOpen}
        title={action === "Edit" ? "Edit Portfolio card" : "Add Portfolio card"}
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={action === "Edit" ? "Update" : "Save"}
        isSubmitting={isSubmitting}
      >
        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            {...register("title", { required: "Title is required" })}
            className="border p-2 w-full rounded"
            placeholder="Enter title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block font-medium mb-1">Location</label>
          <input
            type="text"
            {...register("location", { required: "Location is required" })}
            className="border p-2 w-full rounded"
            placeholder="Enter location"
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <select
            {...register("category", { required: "Category is required" })}
            className="border p-2 w-full rounded"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* 🖼️ Image Uploader */}
        <ImageUploader
          key={editId || "new"}
          onImageChange={(base64: string) => setValue("image", base64)}
          initialImage={editingItem?.image || ""}
        />
        <input
          type="hidden"
          {...register("image", { required: "Image is required" })}
        />
        {errors.image && (
          <p className="text-red-500 text-sm mt-1">
            {errors.image.message}
          </p>
        )}
      </FormModal>

      {/* ✅ List of Portfolio Items */}
      <hr className="border border-black" />
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Saved Portfolio Data</h3>
        {dataArray.length === 0 && (
          <p className="text-gray-500">
            No portfolio card data saved yet. Click "Create New" to add one.
          </p>
        )}
        <ul className="space-y-3">
          {dataArray.map((item, i) => (
            <li
              key={`${item.id}-${i}`}
              className="border p-4 rounded shadow-sm flex justify-between items-center hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium text-lg">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.location}</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    {item.category}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
