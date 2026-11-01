import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Marketplace from './pages/Marketplace.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import AddProduct from './pages/AddProduct.jsx';
import MyListings from './pages/MyListings.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Enquiries from './pages/Enquiries.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/edit-product/:id" element={<AddProduct />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="container py-5 text-center">
                <h2>404 – Page not found</h2>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
