import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, Search, UserRound, X, LogOut, ArrowUpRight, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "../context/StoreContext";

const categoryLinks = [
  ["Women", "Woman's Fashion"],
  ["Men", "Men's Fashion"],
  ["Kids", "Children"],
  ["Accessories", "Bags & Accessories"],
];

export function Layout() {
  const { user, cart, signOut } = useStore();
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("cf-theme") === "dark");
  const navigate = useNavigate();
  const location = useLocation();

  const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const leave = () => { signOut(); navigate("/"); };

  const search = (event) => {
    event.preventDefault();
    if (searchVal.trim()) navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
  };

  const categoryUrl = (category) => `/shop?category=${encodeURIComponent(category)}`;

  // Check if a category nav link is active
  const isCategoryActive = (category) => {
    const params = new URLSearchParams(location.search);
    return location.pathname === "/shop" && params.get("category") === category;
  };

  useEffect(() => {
    localStorage.setItem("cf-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Close mobile menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  if (location.pathname.startsWith("/admin")) {
    return <div className="admin-route"><Outlet /></div>;
  }

  return (
    <div className={`app-shell ${darkMode ? "site-dark" : ""}`}>
      <header className="site-header">
        <Link className="wordmark" to="/" onClick={() => setOpen(false)}>
          C<span>&</span>F
        </Link>

        <nav className={`site-nav ${open ? "is-open" : ""}`}>
          {categoryLinks.map(([label, category]) => (
            <a
              key={label}
              href={categoryUrl(category)}
              className={isCategoryActive(category) ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                navigate(categoryUrl(category));
              }}
            >
              {label}
            </a>
          ))}

          {user ? (
            <>
              <NavLink to="/account">Account</NavLink>
              {user.role === "admin" && <NavLink to="/admin">Studio</NavLink>}
            </>
          ) : (
            <NavLink to="/login">Sign in</NavLink>
          )}
        </nav>

        <div className="header-actions">
          <form className="header-search" onSubmit={search}>
            <Search size={17} />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search"
              aria-label="Search products"
            />
          </form>

          <button
            className="header-icon theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link className="header-icon bag-link" to="/cart" aria-label="Cart">
            <ShoppingBag size={19} />
            {count > 0 && <span>{count}</span>}
          </Link>

          <Link className="header-icon" to={user ? "/account" : "/login"} aria-label="Account">
            <UserRound size={19} />
          </Link>

          {user && (
            <button className="header-icon signout" onClick={leave} aria-label="Sign out">
              <LogOut size={18} />
            </button>
          )}

          <button
            className="menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main><Outlet /></main>

      <footer className="site-footer">
        <div className="footer-lead">
          <Link className="wordmark" to="/">C<span>&</span>F</Link>
          <p>Fashion and everyday objects, selected to move with you.</p>
        </div>

        <div className="footer-column">
          <b>Shop</b>
          {categoryLinks.map(([label, category]) => (
            <a key={label} href={categoryUrl(category)} onClick={(e) => { e.preventDefault(); navigate(categoryUrl(category)); }}>
              {label}
            </a>
          ))}
        </div>

        <div className="footer-column">
          <b>About C&F</b>
          <Link to="/about">Our story</Link>
          <Link to="/about">Shipping &amp; returns</Link>
          <Link to="/about">Contact us</Link>
          <Link to="/account">My account</Link>
        </div>

        <div className="footer-newsletter">
          <b>A better inbox</b>
          <p>New pieces, useful notes, no noise.</p>
          <form>
            <input type="email" placeholder="Email address" />
            <button aria-label="Subscribe"><ArrowUpRight size={18} /></button>
          </form>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} C&F. Made for everyday life.
        </div>
      </footer>
    </div>
  );
}
