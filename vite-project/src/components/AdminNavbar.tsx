import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, KeyRound, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import FormModal from "./FormModel";
import { useForm } from "react-hook-form";
import { requestHandler, AuthAPI } from "../config/api";

interface CreateAdminForm {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes",
  cancelText = "No",
  confirmColor = "bg-red-600 hover:bg-red-700",
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 ${confirmColor} text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export function AdminNavbar() {
  const navigate = useNavigate();
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAdminForm = useForm<CreateAdminForm>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const changePasswordForm = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle Logout Click - Show confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // Handle Logout Confirmation
  const handleLogoutConfirm = () => {
    requestHandler(
      async () => await AuthAPI.logout(),
      (data) => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("deviceId");
        toast.success(data.message || "Logged out successfully");
        navigate("/login");
      },
      (errorMessage) => {
        // Even if API call fails, clear local storage and logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("deviceId");
        toast.error(errorMessage || "Failed to logout, but cleared local session");
        navigate("/login");
      }
    );
  };

  // Handle Create Admin
  const onCreateAdmin = async (data: CreateAdminForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    requestHandler(
      async () => await AuthAPI.createAdmin({
        email: data.email,
        password: data.password,
      }),
      (responseData) => {
        toast.success(responseData.message || "Admin created successfully!");
        setShowCreateAdmin(false);
        createAdminForm.reset();
        setIsSubmitting(false);
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to create admin");
        setIsSubmitting(false);
      }
    );
  };

  // Handle Change Password
  const onChangePassword = async (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (data.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    requestHandler(
      async () => await AuthAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
      (responseData) => {
        toast.success(responseData.message || "Password changed successfully!");
        setShowChangePassword(false);
        changePasswordForm.reset();
        setIsSubmitting(false);
      },
      (errorMessage) => {
        toast.error(errorMessage || "Failed to change password");
        setIsSubmitting(false);
      }
    );
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl border-b border-gray-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left side - Title */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    NovaStyle
                  </span>{" "}
                  <span className="text-gray-300">Admin Panel</span>
                </h1>
                <p className="hidden md:block text-xs text-gray-400 mt-0.5">
                  Management Dashboard
                </p>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Create Admin Button */}
              {/* <button
                onClick={() => setShowCreateAdmin(true)}
                className="group flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <UserPlus size={18} className="group-hover:rotate-12 transition-transform duration-200" />
                <span className="hidden sm:inline">Create Admin</span>
                <span className="sm:hidden">Admin</span>
              </button> */}

              {/* Change Password Button */}
              <button
                onClick={() => setShowChangePassword(true)}
                className="group flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <KeyRound size={18} className="group-hover:rotate-12 transition-transform duration-200" />
                <span className="hidden sm:inline">Change Password</span>
                <span className="sm:hidden">Password</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="group flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-200" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Create Admin Modal */}
      <FormModal
        isOpen={showCreateAdmin}
        title="Create New Admin"
        onClose={() => {
          setShowCreateAdmin(false);
          createAdminForm.reset();
        }}
        onSubmit={createAdminForm.handleSubmit(onCreateAdmin)}
        submitLabel="Create Admin"
        isSubmitting={isSubmitting}
      >
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Email
          </label>
          <input
            type="email"
            {...createAdminForm.register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter email address"
          />
          {createAdminForm.formState.errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {createAdminForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Password
          </label>
          <input
            type="password"
            {...createAdminForm.register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter password"
          />
          {createAdminForm.formState.errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {createAdminForm.formState.errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            {...createAdminForm.register("confirmPassword", {
              required: "Please confirm password",
            })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirm password"
          />
          {createAdminForm.formState.errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {createAdminForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      </FormModal>

      {/* Change Password Modal */}
      <FormModal
        isOpen={showChangePassword}
        title="Change Password"
        onClose={() => {
          setShowChangePassword(false);
          changePasswordForm.reset();
        }}
        onSubmit={changePasswordForm.handleSubmit(onChangePassword)}
        submitLabel="Change Password"
        isSubmitting={isSubmitting}
      >
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Current Password
          </label>
          <input
            type="password"
            {...changePasswordForm.register("currentPassword", {
              required: "Current password is required",
            })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter current password"
          />
          {changePasswordForm.formState.errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">
              {changePasswordForm.formState.errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            New Password
          </label>
          <input
            type="password"
            {...changePasswordForm.register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter new password"
          />
          {changePasswordForm.formState.errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">
              {changePasswordForm.formState.errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Confirm New Password
          </label>
          <input
            type="password"
            {...changePasswordForm.register("confirmPassword", {
              required: "Please confirm new password",
            })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Confirm new password"
          />
          {changePasswordForm.formState.errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {changePasswordForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      </FormModal>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Are you sure you want to logout?"
        message="You will be logged out of your admin account. You'll need to login again to access the admin panel."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </>
  );
}

