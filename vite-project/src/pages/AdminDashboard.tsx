import { Link } from "react-router-dom";
import {
  Layout,
  Image,
  Briefcase,
  Star,
  FileText,
  ShoppingBag,
  Sparkles,
  Package,
} from "lucide-react";

interface DashboardCardProps {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const DashboardCard = ({
  to,
  title,
  description,
  icon,
  gradient,
}: DashboardCardProps) => {
  return (
    <Link
      to={to}
      className="group relative block h-full"
    >
      <div
        className={`h-full p-6 rounded-xl border-2 border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${gradient}`}
      >
        <div className="flex flex-col h-full">
          <div className="mb-4 text-gray-700 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-white transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-gray-600 group-hover:text-gray-200 transition-colors duration-300 flex-grow">
            {description}
          </p>
          <div className="mt-4 flex items-center text-blue-600 group-hover:text-white font-medium transition-colors duration-300">
            <span className="text-sm">Manage</span>
            <svg
              className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

function AdminDashboard() {
  const adminCards = [
    {
      to: "/admin/hero",
      title: "Hero Section",
      description: "Edit the main hero section content and images",
      icon: <Layout className="w-10 h-10" />,
      gradient: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-600 hover:to-blue-700",
    },
    {
      to: "/admin/interiorscroll",
      title: "Interior Scroll",
      description: "Manage interior scroll images and content",
      icon: <Image className="w-10 h-10" />,
      gradient: "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-600 hover:to-purple-700",
    },
    {
      to: "/admin/portfolioadmin",
      title: "Portfolio Section",
      description: "Manage portfolio projects and gallery images",
      icon: <Briefcase className="w-10 h-10" />,
      gradient: "bg-gradient-to-br from-green-50 to-green-100 hover:from-green-600 hover:to-green-700",
    },
    {
      to: "/admin/reviews",
      title: "Reviews",
      description: "Manage customer reviews and testimonials",
      icon: <Star className="w-10 h-10" />,
      gradient: "bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-600 hover:to-yellow-700",
    },
    {
      to: "/admin/footer",
      title: "Footer Details",
      description: "Edit footer content and contact information",
      icon: <FileText className="w-10 h-10" />,
      gradient: "bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-600 hover:to-indigo-700",
    },
  ];

  const ecommerceCards = [
    {
      to: "/admin/products",
      title: "Products",
      description: "Manage e-commerce products, inventory, and pricing",
      icon: <ShoppingBag className="w-10 h-10" />,
      gradient: "bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-600 hover:to-pink-700",
    },
    {
      to: "/admin/orders",
      title: "Orders",
      description: "View and manage customer orders, track shipments, and generate invoices",
      icon: <Package className="w-10 h-10" />,
      gradient: "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-600 hover:to-orange-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/novalogo.png"
              alt="NovaStyle Logo"
              className="h-20 md:h-24 w-auto object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your website content, products, and settings from one central location
          </p>
        </div>

        {/* Admin Panel Section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-4"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Content Management
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminCards.map((card, index) => (
              <DashboardCard key={index} {...card} />
            ))}
          </div>
        </div>

        {/* E-commerce Panel Section */}
        <div>
          <div className="flex items-center mb-6">
            <div className="h-1 w-16 bg-gradient-to-r from-pink-600 to-red-600 rounded-full mr-4"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              E-commerce Management
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecommerceCards.map((card, index) => (
              <DashboardCard key={index} {...card} />
            ))}
          </div>
        </div>

        {/* Quick Stats or Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sections</p>
                <p className="text-3xl font-bold text-gray-800">{adminCards.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Layout className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">E-commerce Tools</p>
                <p className="text-3xl font-bold text-gray-800">{ecommerceCards.length}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 mb-1">System Status</p>
                <p className="text-2xl font-bold">Active</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
