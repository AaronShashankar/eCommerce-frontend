import { Navigate, Route, Routes } from "react-router-dom";
import { useStore } from "./context/StoreContext";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Order from "./pages/Order";
import About from "./pages/About";
import Admin from "./pages/Admin";
function Protected({ children, admin = false }) {
  const { user, loading } = useStore();
  // Login sets the user immediately. Do not keep an authenticated admin behind
  // a still-pending session restoration request.
  if (loading && (!admin || !user))
    return <div className="loading">Loading Velora…</div>;
  return user && (!admin || user.role === "admin") ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:slug" element={<Product />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth register />} />
        <Route
          path="/checkout"
          element={
            <Protected>
              <Checkout />
            </Protected>
          }
        />
        <Route
          path="/account"
          element={
            <Protected>
              <Account />
            </Protected>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <Protected>
              <Order />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected admin>
              <Admin />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
