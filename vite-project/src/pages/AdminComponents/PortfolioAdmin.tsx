import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PortfolioAPI } from "../../config/api";
import { toast } from "sonner";
import FormModal from "../../components/FormModel";

// Gallery Modal Component
function GalleryModal({
  isOpen,
  onClose,
  portfolioId,
  portfolioTitle,
  images,
  onImagesUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: string;
  portfolioTitle: string;
  images: string[];
  onImagesUpdated: () => void;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }
    setIsUploading(true);
    try {
      await PortfolioAPI.addPortfolioImages(portfolioId, selectedFiles);
      toast.success("Images added to gallery successfully!");
      setSelectedFiles([]);
      onImagesUpdated();
      const fileInput = document.getElementById(`gallery-upload-${portfolioId}`) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this image from the gallery?")) return;
    setIsDeleting(imageUrl);
    try {
      await PortfolioAPI.deletePortfolioImage(portfolioId, imageUrl);
      toast.success("Image deleted successfully!");
      onImagesUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete image");
    } finally {
      setIsDeleting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Gallery: {portfolioTitle}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <label className="block font-medium mb-2">Add Images to Gallery</label>
          <input
            id={`gallery-upload-${portfolioId}`}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="border p-2 w-full rounded mb-2"
          />
          {selectedFiles.length > 0 && (
            <div className="mb-2">
              <p className="text-sm text-gray-600">
                {selectedFiles.length} file(s) selected
              </p>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isUploading ? "Uploading..." : "Upload Images"}
          </button>
        </div>
        <div>
          <h4 className="font-medium mb-3">Gallery Images ({images.length})</h4>
          {images.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No images in gallery yet. Upload images above.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <button
                    onClick={() => handleDeleteImage(imageUrl)}
                    disabled={isDeleting === imageUrl}
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:bg-gray-400"
                  >
                    {isDeleting === imageUrl ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export class PortfolioAdminModel {
  _id?: string;
  id?: string | null = "";
  title: string = "";
  location: string = "";
  category: string = "";
  image: string = "";
  images: string[] = []; // ADD THIS LINE - Gallery images array
  showOnMainHome: boolean = false;
  showOnInteriorHome: boolean = false;
  showOnConstruction: boolean = false;
}

export function PortfolioAdmin() {
  const [dataArray, setDataArray] = useState<PortfolioAdminModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<"Add" | "Edit" | "">("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PortfolioAdminModel | null>(null);
  const [coverFile, setCoverFile] = useState<File | undefined>(undefined);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedPortfolioForGallery, setSelectedPortfolioForGallery] = useState<{
    id: string;
    title: string;
    images: string[];
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PortfolioAdminModel>({
    defaultValues: new PortfolioAdminModel(),
  });

  const categories = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office'];

  function getAllPortfolio() {
    PortfolioAPI.getPortfolio()
      .then((res) => {
        const data = res.data;
        const portfolios =
          data.portfolios?.map((p: any) => ({
            ...p,
            id: p._id,
            images: p.images || [],
          })) || [];
        setDataArray(portfolios);
        toast.success("Portfolio content loaded successfully");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to fetch portfolio content");
      });
  }

  useEffect(() => {
    getAllPortfolio();
  }, []);

  const onSubmit = (formData: PortfolioAdminModel) => {
    const { id, _id, ...rest } = formData;
    if (action === "Add") {
      PortfolioAPI.addPortfolio(rest, coverFile)
        .then((res) => {
          toast.success(res.data?.message || "Portfolio item added successfully!");
          getAllPortfolio();
          closeModal();
        })
        .catch((err) => toast.error(err?.response?.data?.message || "Failed to add portfolio item"));
    } else if (action === "Edit" && editId) {
      PortfolioAPI.editPortfolio(editId, rest, coverFile)
        .then((res) => {
          toast.success(res.data?.message || "Portfolio item updated successfully!");
          getAllPortfolio();
          closeModal();
        })
        .catch((err) => toast.error(err?.response?.data?.message || "Failed to update portfolio item"));
    }
  };

  const handleDelete = (id: string | null) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this portfolio item?")) return;

    PortfolioAPI.deletePortfolio(id)
      .then((res) => {
        toast.success(res.data?.message || "Portfolio item deleted successfully!");
        getAllPortfolio();
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Failed to delete portfolio item"));
  };

  const handleEdit = (item: PortfolioAdminModel) => {
    setAction("Edit");
    setEditId(item.id || null);
    setEditingItem(item);
    setIsModalOpen(true);
    setValue("title", item.title);
    setValue("location", item.location);
    setValue("category", item.category);
    setValue("showOnMainHome", !!item.showOnMainHome);
    setValue("showOnInteriorHome", !!item.showOnInteriorHome);
    setValue("showOnConstruction", !!item.showOnConstruction);
    // cover preview comes from item.image; file will be optional unless user selects a new one
    setCoverFile(undefined);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset(new PortfolioAdminModel());
    setAction("");
    setEditId(null);
    setEditingItem(null);
    setCoverFile(undefined);
  };

  const handleOpenGallery = (item: PortfolioAdminModel) => {
    if (!item.id) return;
    setSelectedPortfolioForGallery({
      id: item.id,
      title: item.title,
      images: item.images || [],
    });
    setGalleryModalOpen(true);
  };

  const handleCloseGallery = () => {
    setGalleryModalOpen(false);
    setSelectedPortfolioForGallery(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Portfolio card Manager</h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setAction("Add");
            setCoverFile(undefined);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New
        </button>
      </div>

      <FormModal
        isOpen={isModalOpen}
        title={action === "Edit" ? "Edit Portfolio card" : "Add Portfolio card"}
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={action === "Edit" ? "Update" : "Save"}
        isSubmitting={isSubmitting}
      >
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            {...register("title", { required: "Title is required" })}
            className="border p-2 w-full rounded"
            placeholder="Enter title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Location</label>
          <input
            type="text"
            {...register("location", { required: "Location is required" })}
            className="border p-2 w-full rounded"
            placeholder="Enter location"
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Category</label>
          <select
            {...register("category", { required: "Category is required" })}
            className="border p-2 w-full rounded"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
        </div>

        {/* Flags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("showOnMainHome")} />
            <span>Main Home</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("showOnInteriorHome")} />
            <span>Interior Home</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("showOnConstruction")} />
            <span>Construction</span>
          </label>
        </div>

        {/* Cover image (File) */}
        <div className="mt-4">
          <label className="block font-medium mb-1">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0])}
            className="border p-2 w-full rounded"
          />
          {/* optional preview */}
          {editingItem?.image && !coverFile && (
            <img src={editingItem.image} alt="cover" className="mt-2 w-24 h-24 object-cover rounded" />
          )}
        </div>
      </FormModal>

      <hr className="border border-black" />
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Saved Portfolio Data</h3>
        {dataArray.length === 0 && (
          <p className="text-gray-500">No portfolio card data saved yet. Click "Create New" to add one.</p>
        )}
        <ul className="space-y-3">
          {dataArray.map((item, i) => (
            <li key={`${item.id}-${i}`} className="border p-4 rounded shadow-sm flex justify-between items-center hover:bg-gray-50">
              <div className="flex items-center gap-4">
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                )}
                <div>
                  <p className="font-medium text-lg">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.location}</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">{item.category}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Gallery: {item.images?.length || 0} image(s)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenGallery(item)}
                  className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  title="Manage gallery images"
                >
                  Gallery ({item.images?.length || 0})
                </button>
                <button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                  Edit
                </button>
                <button onClick={() => handleDelete(String(item.id))} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedPortfolioForGallery && (
        <GalleryModal
          isOpen={galleryModalOpen}
          onClose={handleCloseGallery}
          portfolioId={selectedPortfolioForGallery.id}
          portfolioTitle={selectedPortfolioForGallery.title}
          images={selectedPortfolioForGallery.images}
          onImagesUpdated={getAllPortfolio}
        />
      )}
    </div>
  );
}