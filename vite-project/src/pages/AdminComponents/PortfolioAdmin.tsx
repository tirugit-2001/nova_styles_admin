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
  interface FileWithPreview {
    id: string;
    file: File;
    preview: string;
  }

  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [orderedImages, setOrderedImages] = useState<string[]>(images);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  // For reordering selected files before upload
  const [draggedFileIndex, setDraggedFileIndex] = useState<number | null>(null);
  const [dragOverFileIndex, setDragOverFileIndex] = useState<number | null>(null);

  // Update ordered images when images prop changes
  useEffect(() => {
    setOrderedImages(images);
  }, [images]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(item => URL.revokeObjectURL(item.preview));
    };
  }, [selectedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    // Create file objects with preview URLs and unique IDs
    const filesWithPreviews: FileWithPreview[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedFiles(filesWithPreviews);
  };

  // Handle drag and drop for file uploads
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      // Create file objects with preview URLs and unique IDs
      const filesWithPreviews: FileWithPreview[] = files.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      setSelectedFiles(filesWithPreviews);
    }
  };

  // Handle drag and drop for reordering images
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const handleDragLeaveItem = () => {
    setDragOverIndex(null);
  };

  const handleDropItem = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrderedImages = [...orderedImages];
    const [draggedItem] = newOrderedImages.splice(draggedIndex, 1);
    newOrderedImages.splice(dropIndex, 0, draggedItem);
    
    setOrderedImages(newOrderedImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    // Save the new order
    handleSaveOrder(newOrderedImages);
  };

  const handleSaveOrder = async (newOrder: string[]) => {
    setIsSavingOrder(true);
    try {
      await PortfolioAPI.updateImageOrder(portfolioId, newOrder);
      toast.success("Image order updated successfully!");
      onImagesUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update image order");
      // Revert to original order on error
      setOrderedImages(images);
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Handle drag and drop for reordering selected files before upload
  const handleFileDragStart = (index: number) => {
    setDraggedFileIndex(index);
  };

  const handleFileDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFileIndex(index);
  };

  const handleFileDragLeave = () => {
    setDragOverFileIndex(null);
  };

  const handleFileDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedFileIndex === null || draggedFileIndex === dropIndex) {
      setDraggedFileIndex(null);
      setDragOverFileIndex(null);
      return;
    }

    const newFiles = [...selectedFiles];
    const [draggedItem] = newFiles.splice(draggedFileIndex, 1);
    newFiles.splice(dropIndex, 0, draggedItem);
    
    setSelectedFiles(newFiles);
    setDraggedFileIndex(null);
    setDragOverFileIndex(null);
  };

  const handleRemoveSelectedFile = (id: string) => {
    setSelectedFiles(prev => {
      const itemToRemove = prev.find(item => item.id === id);
      if (itemToRemove) {
        // Revoke the preview URL
        URL.revokeObjectURL(itemToRemove.preview);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }
    setIsUploading(true);
    try {
      // Extract files in the order they appear in selectedFiles array
      const filesToUpload = selectedFiles.map(item => item.file);
      await PortfolioAPI.addPortfolioImages(portfolioId, filesToUpload);
      toast.success("Images added to gallery successfully!");
      
      // Clean up preview URLs
      selectedFiles.forEach(item => URL.revokeObjectURL(item.preview));
      
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
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <input
              id={`gallery-upload-${portfolioId}`}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor={`gallery-upload-${portfolioId}`}
              className="cursor-pointer block"
            >
              <p className="text-gray-600 mb-2">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Click to upload
                </span>{" "}
                or drag and drop images here
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </p>
            </label>
          </div>
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2 text-gray-700">
                Selected Files ({selectedFiles.length}) - Drag to reorder before upload
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 border rounded bg-gray-50">
                {selectedFiles.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleFileDragStart(index)}
                    onDragOver={(e) => handleFileDragOver(e, index)}
                    onDragLeave={handleFileDragLeave}
                    onDrop={(e) => handleFileDrop(e, index)}
                    className={`relative group cursor-move transition-all ${
                      draggedFileIndex === index
                        ? "opacity-50 scale-95"
                        : dragOverFileIndex === index
                        ? "scale-105 border-2 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-10">
                      #{index + 1}
                    </div>
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="w-full h-24 object-cover rounded border"
                      onError={() => {
                        // Fallback if image fails to load
                        console.error("Failed to load preview for", item.file.name);
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8h16M4 16h16"
                          />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSelectedFile(item.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                      type="button"
                    >
                      ×
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate" title={item.file.name}>
                      {item.file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isUploading ? "Uploading..." : "Upload Images"}
          </button>
        </div>
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">
              Gallery Images ({orderedImages.length})
            </h4>
            {isSavingOrder && (
              <span className="text-sm text-blue-600">Saving order...</span>
            )}
          </div>
          {orderedImages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No images in gallery yet. Upload images above.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 mb-2">
                Drag and drop images to reorder them. The first image will be displayed first.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {orderedImages.map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOverItem(e, index)}
                    onDragLeave={handleDragLeaveItem}
                    onDrop={(e) => handleDropItem(e, index)}
                    className={`relative group cursor-move transition-all ${
                      draggedIndex === index
                        ? "opacity-50 scale-95"
                        : dragOverIndex === index
                        ? "scale-105 border-2 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-10">
                      #{index + 1}
                    </div>
                    <img
                      src={imageUrl}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8h16M4 16h16"
                          />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(imageUrl)}
                      disabled={isDeleting === imageUrl}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:bg-gray-400 z-20"
                    >
                      {isDeleting === imageUrl ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ))}
              </div>
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

      {isUploading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white px-6 py-4 rounded shadow-lg text-lg font-semibold text-gray-700 flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading images...
          </div>
        </div>
      )}
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
  const [isSaving, setIsSaving] = useState(false);
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

  const onSubmit = async (formData: PortfolioAdminModel) => {
    const { id, _id, ...rest } = formData;
    setIsSaving(true);
    
    try {
      if (action === "Add") {
        const res = await PortfolioAPI.addPortfolio(rest, coverFile);
        toast.success(res.data?.message || "Portfolio item added successfully!");
        getAllPortfolio();
        closeModal();
      } else if (action === "Edit" && editId) {
        const res = await PortfolioAPI.editPortfolio(editId, rest, coverFile);
        toast.success(res.data?.message || "Portfolio item updated successfully!");
        getAllPortfolio();
        closeModal();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (action === "Add" ? "Failed to add portfolio item" : "Failed to update portfolio item"));
    } finally {
      setIsSaving(false);
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
        isSubmitting={isSaving || isSubmitting}
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

      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white px-6 py-4 rounded shadow-lg text-lg font-semibold text-gray-700 flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Saving portfolio...
          </div>
        </div>
      )}
    </div>
  );
}