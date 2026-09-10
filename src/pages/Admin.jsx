import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, ExternalLink } from "lucide-react";
import api from "../lib/api";
import { money, date } from "../lib/format";
import { Notice } from "../components/Ui";
import { useStore } from "../context/StoreContext";
const tabs = ["Overview", "Products", "Orders", "Customers", "Reviews", "Settings"];
export default function Admin() {
  const { user, signOut } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview"),
    [data, setData] = useState({}),
    [error, setError] = useState(""),
    [editingId, setEditingId] = useState(""),
    [darkMode, setDarkMode] = useState(() => (localStorage.getItem("cf-admin-theme") || localStorage.getItem("cf-theme")) === "dark"),
    [product, setProduct] = useState({
      name: "",
      description: "",
      price: "",
      salePrice: "",
      stock: "",
      category: "",
      images: "",
    });
  const load = async (current) => {
    setError("");
    try {
      if (current === "Overview")
        setData({ report: (await api.get("/admin/report")).data });
      if (current === "Products")
        setData({
          products: (await api.get("/admin/products")).data,
          categories: (await api.get("/categories")).data,
        });
      if (current === "Orders")
        setData({ orders: (await api.get("/admin/orders")).data });
      if (current === "Customers")
        setData({ customers: (await api.get("/admin/customers")).data });
      if (current === "Reviews")
        setData({ reviews: (await api.get("/admin/reviews")).data });
      if (current === "Settings")
        setData({
          gateways: (await api.get("/admin/gateways")).data,
          promos: (await api.get("/admin/promos")).data,
        });
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    load(tab);
  }, [tab]);
  useEffect(() => { const theme = darkMode ? "dark" : "light"; localStorage.setItem("cf-admin-theme", theme); localStorage.setItem("cf-theme", theme); }, [darkMode]);
  const toggleAdminTheme = () => setDarkMode((current) => !current);
  const resetProduct = () => {
    setEditingId("");
    setProduct({
      name: "",
      description: "",
      price: "",
      salePrice: "",
      stock: "",
      category: "",
      images: "",
    });
  };
  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : undefined,
        stock: Number(product.stock),
        images: product.images
          ? product.images.split(",").map((x) => x.trim())
          : [],
      };
      await api[editingId ? "patch" : "post"](
        editingId ? `/admin/products/${editingId}` : "/admin/products",
        payload,
      );
      resetProduct();
      load("Products");
    } catch (e) {
      setError(e.message);
    }
  };
  const editProduct = (p) => {
    setEditingId(p._id);
    setProduct({
      ...p,
      category: p.category?._id || p.category,
      images: (p.images || []).join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      load("Products");
    } catch (e) {
      setError(e.message);
    }
  };
  const setStatus = async (id, status) => {
    await api.patch(`/admin/orders/${id}`, { status });
    load("Orders");
  };
  const saveGateway = async (gateway) => {
    await api.put("/admin/gateways", gateway);
    load("Settings");
  };
  const moderateReview = async (id, approved) => { await api.patch(`/admin/reviews/${id}`, { approved }); load("Reviews"); };
  const deleteReview = async (id) => { if (!window.confirm("Delete this review permanently?")) return; await api.delete(`/admin/reviews/${id}`); load("Reviews"); };
  return (
    <section className={`admin-page ${darkMode ? "is-dark" : ""}`}>
      <aside className="admin-sidebar"><div className="admin-brand">C<span>&</span>F <small>Console</small></div><p>Workspace</p>
      <div className="admin-tabs">
        {tabs.map((t) => (
          <button
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div></aside>
      <div className="admin-workspace"><header className="admin-topbar"><div><b>Welcome back, {user?.username}</b><span>Manage your C&F store from one place.</span></div><div className="admin-top-actions"><Link to="/" className="preview-site"><ExternalLink size={15}/> Preview website</Link><button className="admin-action" onClick={toggleAdminTheme} aria-label="Toggle dark mode">{darkMode ? <Sun size={17}/> : <Moon size={17}/>}</button><button className="admin-profile" onClick={() => { signOut(); navigate("/login"); }} title="Sign out"><span>{user?.username?.slice(0,1).toUpperCase() || "A"}</span><LogOut size={16}/></button></div></header><div className="admin-content"><div className="page-heading compact"><p className="eyebrow">Store operations</p><h1>{tab} <i>workspace.</i></h1></div>
      <Notice>{error}</Notice>
      {tab === "Overview" && <Overview report={data.report} />}{" "}
      {tab === "Products" && (
        <Products
          data={data}
          product={product}
          setProduct={setProduct}
          save={saveProduct}
          editing={!!editingId}
          reset={resetProduct}
          onEdit={editProduct}
          onDelete={deleteProduct}
          reload={() => load("Products")}
        />
      )}{" "}
      {tab === "Orders" && (
        <Orders orders={data.orders} setStatus={setStatus} />
      )}{" "}
      {tab === "Customers" && <Customers customers={data.customers} />}{" "}
      {tab === "Reviews" && <Reviews reviews={data.reviews} moderate={moderateReview} remove={deleteReview} />}
      {tab === "Settings" && (
        <Settings
          data={data}
          saveGateway={saveGateway}
          reload={() => load("Settings")}
        />
      )}
    </div></div></section>
  );
}
function Overview({ report }) {
  if (!report) return <div className="loading">Loading reports…</div>;
  return (
    <>
      <div className="stat-grid">
        <div>
          <small>Collected revenue</small>
          <b>{money(report.summary.revenue)}</b>
        </div>
        <div>
          <small>Active orders</small>
          <b>{report.summary.orders}</b>
        </div>
        <div>
          <small>Units sold</small>
          <b>{report.summary.units}</b>
        </div>
      </div>
      <h2>Best sellers</h2>
      <Table headers={["Product", "Units", "Revenue"]}>
        {report.bestSellers.map((x) => (
          <tr key={x._id}>
            <td>{x._id}</td>
            <td>{x.units}</td>
            <td>{money(x.revenue)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
function Products({
  data,
  product,
  setProduct,
  save,
  editing,
  reset,
  onEdit,
  onDelete,
  reload,
}) {
  const [categoryName, setCategoryName] = useState("");
  const addCategory = async (e) => {
    e.preventDefault();
    await api.post("/admin/categories", { name: categoryName });
    setCategoryName("");
    reload();
  };
  return (
    <div className="admin-two">
      <div>
        <form className="form-grid admin-form" onSubmit={save}>
          <h2>{editing ? "Edit product" : "Add a product"}</h2>
          {[
            ["name", "Product name"],
            ["description", "Description"],
            ["price", "Regular price"],
            ["salePrice", "Sale price"],
            ["stock", "Stock"],
            ["images", "Image URL(s), comma-separated"],
          ].map(([key, label]) => (
            <label
              className={
                key === "description" || key === "images" ? "wide" : ""
              }
              key={key}
            >
              {label}
              {key === "description" ? (
                <textarea
                  required
                  value={product[key]}
                  onChange={(e) =>
                    setProduct({ ...product, [key]: e.target.value })
                  }
                />
              ) : (
                <input
                  required={!["salePrice", "images"].includes(key)}
                  type={
                    ["price", "salePrice", "stock"].includes(key)
                      ? "number"
                      : "text"
                  }
                  min="0"
                  value={product[key]}
                  onChange={(e) =>
                    setProduct({ ...product, [key]: e.target.value })
                  }
                />
              )}
            </label>
          ))}
          <label className="wide">
            Category
            <select
              required
              value={product.category}
              onChange={(e) =>
                setProduct({ ...product, category: e.target.value })
              }
            >
              <option value="">Select a category</option>
              {data.categories?.map((c) => (
                <option value={c._id} key={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <button className="button dark full">
            {editing ? "Save product" : "Add product"}
          </button>
          {editing && (
            <button type="button" className="text-button" onClick={reset}>
              Cancel edit
            </button>
          )}
        </form>
        <form className="category-form" onSubmit={addCategory}>
          <label>
            New category
            <input
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Homeware"
            />
          </label>
          <button className="text-button">Add category</button>
        </form>
      </div>
      <div>
        <h2>Catalog</h2>
        <Table headers={["Name", "Price", "Stock", ""]}>
          {data.products?.map((p) => (
            <tr key={p._id}>
              <td>
                {p.name}
                <small>{p.category?.name}</small>
              </td>
              <td>{money(p.salePrice ?? p.price)}</td>
              <td>{p.stock}</td>
              <td>
                <button className="text-button" onClick={() => onEdit(p)}>
                  Edit
                </button>{" "}
                <button
                  className="text-button danger"
                  onClick={() => onDelete(p._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
function Orders({ orders, setStatus }) {
  return (
    <>
      <h2>Incoming orders</h2>
      <Table headers={["Order", "Customer", "Total", "Payment", "Status"]}>
        {orders?.map((o) => (
          <tr key={o._id}>
            <td>
              <b>{o.orderNumber}</b>
              <small>{date(o.createdAt)}</small>
            </td>
            <td>
              {o.user?.username}
              <small>{o.user?.email}</small>
            </td>
            <td>{money(o.total)}</td>
            <td>
              <b>{o.payment.method === "stripe" ? "Stripe" : "Cash on Delivery"}</b>
              <small>
                {o.payment.status.replaceAll("_", " ")}
                {o.payment.paidAt ? ` · ${date(o.payment.paidAt)}` : ""}
              </small>
              {o.payment.refundedAmount > 0 && (
                <small>Refunded: {money(o.payment.refundedAmount)}</small>
              )}
            </td>
            <td>
              <select
                value={o.status}
                onChange={(e) => setStatus(o._id, e.target.value)}
              >
                {[
                  "Pending",
                  "Processing",
                  "Shipped",
                  "Delivered",
                  "Cancelled",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
function Customers({ customers }) {
  return (
    <>
      <h2>Customers</h2>
      <Table headers={["Customer", "Email", "Joined"]}>
        {customers?.map((c) => (
          <tr key={c._id}>
            <td>{c.username}</td>
            <td>{c.email}</td>
            <td>{date(c.createdAt)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
function Reviews({ reviews, moderate, remove }) {
  return <><h2>Customer reviews</h2><Table headers={["Customer", "Product", "Rating", "Review", "Visibility", ""]}>{reviews?.map((review) => <tr key={review._id}><td><b>{review.user?.username}</b><small>{review.user?.email}</small></td><td>{review.product?.name}</td><td>{"★".repeat(review.rating)}<small>{review.rating} / 5</small></td><td className="review-cell">{review.comment}</td><td><button className={`review-status ${review.approved ? "approved" : "hidden"}`} onClick={() => moderate(review._id, !review.approved)}>{review.approved ? "Published" : "Hidden"}</button></td><td><button className="text-button danger" onClick={() => remove(review._id)}>Delete</button></td></tr>)}</Table></>;
}
function Settings({ data, saveGateway, reload }) {
  const [code, setCode] = useState(""),
    [value, setValue] = useState("");
  const savePromo = async (e) => {
    e.preventDefault();
    await api.post("/admin/promos", {
      code,
      value: Number(value),
      type: "percent",
      active: true,
    });
    setCode("");
    setValue("");
    reload();
  };
  return (
    <div className="admin-two">
      <div>
        <h2>Payment methods</h2>
        {data.gateways?.map((g) => (
          <div className="gateway" key={g.provider}>
            <div>
              <b>
                {g.provider === "cod" ? "Cash on Delivery" : "Stripe (sandbox)"}
              </b>
              <small>
                {g.provider === "stripe"
                  ? "Secret key remains only in backend environment"
                  : "Available at checkout"}
              </small>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={g.enabled}
                onChange={(e) =>
                  saveGateway({ ...g, enabled: e.target.checked })
                }
              />
              <span />
            </label>
          </div>
        ))}
      </div>
      <div>
        <h2>Create promo</h2>
        <form onSubmit={savePromo} className="form-grid">
          <label>
            Code
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </label>
          <label>
            Percentage
            <input
              required
              type="number"
              min="1"
              max="100"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <button className="button dark full">Create promo</button>
        </form>
        <h3>Active codes</h3>
        {data.promos?.map((p) => (
          <p className="promo-row" key={p._id}>
            <b>{p.code}</b>
            <span>
              {p.value}% off · {p.uses} uses
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}
function Table({ headers, children }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
