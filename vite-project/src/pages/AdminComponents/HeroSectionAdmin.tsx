import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { HeroSectionAPI, requestHandler } from "../../config/api";
import { toast } from "sonner";
import FormModal from "../../components/FormModel";
import ImageUploader from "../../components/ImageUploader";

// 🧩 Reusable Components

// ✅ Data Model
export class HeroSectionModel {
  _id?: string;
  id?: string | null;
  title: string = "";
  subtitle: string = "";
  price: string = "";
  image: string = "";
}

export function HeroSectionAdmin() {
  const [dataArray, setDataArray] = useState<HeroSectionModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<"Add" | "Edit" | "">("");
  const [editId, setEditId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HeroSectionModel>({
    defaultValues: new HeroSectionModel(),
  });

  // ✅ Fetch all hero records
  function getAllHero() {
    requestHandler(
      async () => await HeroSectionAPI.getHero(),
      (data) => {
        const heroes = data.heroes.map((hero: any) => ({
          ...hero,
          id: hero._id,
        }));
        setDataArray(heroes);
        toast.success("Hero content loaded successfully");
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to fetch hero content");
      }
    );
  }

  useEffect(() => {
    getAllHero();
  }, []);

  // ✅ Submit (Add / Edit)
  const onSubmit = (formData: HeroSectionModel) => {
    if (action === "Add") {
      requestHandler(
        async () => await HeroSectionAPI.addHero(formData),
        (data) => {
          toast.success(data.message || "Hero section added successfully!");
          getAllHero();
          closeModal();
        },
        (errorMessage) => {
          toast.error(errorMessage || "Failed to add hero");
        }
      );
    } else if (action === "Edit" && editId) {
      requestHandler(
        async () => await HeroSectionAPI.editHero(editId, formData),
        (data) => {
          toast.success(data.message || "Hero section updated successfully!");
          getAllHero();
          closeModal();
        },
        (errorMessage) => {
          toast.error(errorMessage || "Failed to update hero");
        }
      );
    }
  };

  // ✅ Delete
  const handleDelete = (id: string | null) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this hero?")) return;

    requestHandler(
      async () => await HeroSectionAPI.deleteHero(id),
      (data) => {
        toast.success(data.message || "Hero deleted successfully!");
        getAllHero();
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to delete hero");
      }
    );
  };

  // ✅ Edit
  const handleEdit = (item: HeroSectionModel) => {
    setAction("Edit");
    setEditId(item.id || null);
    setIsModalOpen(true);
    setValue("title", item.title);
    setValue("subtitle", item.subtitle);
    setValue("price", item.price);
    setValue("image", item.image);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset(new HeroSectionModel());
    setAction("");
    setEditId(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hero Section Manager</h2>
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
        title={action === "Edit" ? "Edit Hero Section" : "Add Hero Section"}
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

        {/* Subtitle */}
        <div>
          <label className="block font-medium mb-1">Subtitle</label>
          <input
            {...register("subtitle", { required: "Subtitle is required" })}
            className="border p-2 w-full rounded"
            placeholder="Enter subtitle"
          />
          {errors.subtitle && (
            <p className="text-red-500 text-sm mt-1">
              {errors.subtitle.message}
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block font-medium mb-1">Price</label>
          <input
            {...register("price", { required: "Price is required" })}
            className="border p-2 w-full rounded"
            placeholder="Enter price"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">
              {errors.price.message}
            </p>
          )}
        </div>

        {/* 🖼️ Image Uploader */}
        <ImageUploader
          onImageChange={(base64:string) => setValue("image", base64)}
          defaultImage={undefined}
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

      {/* ✅ List of Hero Sections */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Saved Hero Data</h3>
        {dataArray.length === 0 && (
          <p className="text-gray-500">
            No hero data saved yet. Click "Create New" to add one.
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
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    {item.price}
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
