import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="p-10 flex items-center justify-around gap-10 h-screen">
      <div>
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <div className="flex flex-col gap-4">
          <Link to="/admin/hero">Edit Hero Section</Link>
          <Link to="/admin/interiorscroll">
            Edit of the Interior Scroll image
          </Link>
          <Link to="/admin/portfolioadmin">PortFolio Section</Link>
          {/* <Link to="/admin/products">Manage Products</Link> */}
          <Link to="/admin/reviews">Manage Reviews</Link>
          <Link to="/admin/footer">Edit Footer Details</Link>
        </div>
      </div>
        <div className="">
          <h1 className="text-2xl font-bold mb-4">Ecommorce Panel</h1>
          <Link to="/admin/products">Products</Link>
        </div>
    </div>
  );
}

export default AdminDashboard;
