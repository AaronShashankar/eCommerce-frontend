import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, Search, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "../context/StoreContext";
export function Layout() {
  const { user, cart, signOut } = useStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const leave = () => {
    signOut();
    navigate("/");
  };
  return (
    <>
      <header>
        <Link className="logo" to="/">
          VELORA<span>.</span>
        </Link>
        <nav className={open ? "open" : ""}>
          <NavLink to="/shop" onClick={() => setOpen(false)}>
            Shop
          </NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>
            Our story
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" onClick={() => setOpen(false)}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="nav-actions">
          <Link to="/shop" aria-label="Search">
            <Search size={20} />
          </Link>
          <Link to={user ? "/account" : "/login"} aria-label="Account">
            <UserRound size={20} />
          </Link>
          <Link className="cart-link" to="/cart" aria-label="Cart">
            <ShoppingBag size={20} />
            {count > 0 && <b>{count}</b>}
          </Link>
          {user && (
            <button className="text-button logout" onClick={leave}>
              Sign out
            </button>
          )}
          <button className="mobile-menu" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <div className="logo">
          VELORA<span>.</span>
        </div>
        <p>Considered essentials for a life in motion.</p>
        <small>
          © {new Date().getFullYear()} Velora. Built with intention.
        </small>
      </footer>
    </>
  );
}
