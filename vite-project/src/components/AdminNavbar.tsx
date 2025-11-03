import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, UserPlus, KeyRound } from "lucide-react";
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

export function AdminNavbar() {
  const navigate = useNavigate();
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
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

  // Handle Logout
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
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
    }
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
      <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Title */}
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                <span className="hidden sm:inline">NovaStyle </span>Admin Panel
              </h1>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {/* Create Admin Button */}
              <button
                onClick={() => setShowCreateAdmin(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <UserPlus size={18} />
                <span className="hidden sm:inline">Create Admin</span>
              </button>

              {/* Change Password Button */}
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <KeyRound size={18} />
                <span className="hidden sm:inline">Change Password</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <LogOut size={18} />
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
    </>
  );
}

