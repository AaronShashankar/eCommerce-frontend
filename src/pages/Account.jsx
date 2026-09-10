import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Package, Pencil, ShoppingBag, UserRound } from "lucide-react";
import api from "../lib/api";
import { useStore } from "../context/StoreContext";
import { date, money } from "../lib/format";
import { Empty, Notice } from "../components/Ui";

const fields = [
  "name",
  "line1",
  "line2",
  "city",
  "state",
  "postalCode",
  "country",
  "phone",
];
export default function Account() {
  const { user, setUser } = useStore();
  const [orders, setOrders] = useState([]),
    [editing, setEditing] = useState(false),
    [form, setForm] = useState({
      username: user?.username || "",
      email: user?.email || "",
      country: "Nepal",
      ...(user?.billingAddress || {}),
    }),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/orders/mine")
      .then((r) => setOrders(r.data))
      .catch((e) => setError(e.message));
  }, []);
  const save = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.patch("/auth/me", {
        username: form.username,
        email: form.email,
        billingAddress: Object.fromEntries(
          fields.map((key) => [key, form[key]]),
        ),
      });
      setUser(data.user);
      setMessage("Your account details are saved.");
      setEditing(false);
    } catch (e) {
      setError(e.message);
    }
  };
  const address = user?.billingAddress;
  return (
    <section className="section account-page">
      <div className="account-hero">
        <div className="account-avatar">
          <UserRound size={29} />
        </div>
        <div>
          <p className="eyebrow">My C&F</p>
          <h1>Hello, {user?.username}.</h1>
          <p>Manage orders, delivery details, and your account.</p>
        </div>
        <button className="account-edit" onClick={() => setEditing(!editing)}>
          <Pencil size={15} />
          {editing ? "Close editor" : "Edit profile"}
        </button>
      </div>
      <div className="account-summary">
        <div>
          <Package size={20} />
          <span>
            <b>{orders.length}</b> orders placed
          </span>
        </div>
        <div>
          <ShoppingBag size={20} />
          <span>
            <b>
              {orders.filter((order) => order.status === "Delivered").length}
            </b>{" "}
            delivered
          </span>
        </div>
        <div>
          <MapPin size={20} />
          <span>
            <b>{address ? "1" : "0"}</b> saved address
          </span>
        </div>
      </div>
      <div className="account-grid">
        <div className="account-orders">
          <div className="account-section-head">
            <div>
              <p className="eyebrow">Purchase history</p>
              <h2>Recent orders</h2>
            </div>
            <Link to="/shop" className="text-link">
              Continue shopping
            </Link>
          </div>
          {orders.length ? (
            <div className="order-list">
              {orders.map((order) => (
                <Link
                  to={`/orders/${order._id}`}
                  className="order-row"
                  key={order._id}
                >
                  <div className="order-icon">
                    <Package size={18} />
                  </div>
                  <div className="order-main">
                    <b>{order.orderNumber}</b>
                    <small>
                      {date(order.createdAt)} · {order.items.length} item
                      {order.items.length === 1 ? "" : "s"}
                    </small>
                  </div>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                  <b className="order-total">{money(order.total)}</b>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="No orders just yet"
              text="When you find something you love, it will appear here."
            />
          )}
        </div>
        <aside className="profile-card">
          <div className="account-section-head">
            <div>
              <p className="eyebrow">Profile</p>
              <h2>Your details</h2>
            </div>
          </div>
          {editing ? (
            <form onSubmit={save} className="form-grid profile-form">
              <label>
                Username
                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              {fields.map((key) => (
                <label
                  className={["line1", "line2"].includes(key) ? "wide" : ""}
                  key={key}
                >
                  {key === "line1"
                    ? "Address"
                    : key === "line2"
                      ? "Address line 2"
                      : key.replace(/([A-Z])/g, " $1")}
                  <input
                    required={key !== "line2"}
                    value={form[key] || ""}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
              <Notice>{error}</Notice>
              <button className="button full">Save changes</button>
            </form>
          ) : (
            <>
              <div className="profile-person">
                <div className="initials">
                  {user?.username?.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <b>{user?.username}</b>
                  <span>{user?.email}</span>
                </div>
              </div>
              <div className="address-block">
                <MapPin size={18} />
                <div>
                  <b>Delivery address</b>
                  {address ? (
                    <p>
                      {address.name}
                      <br />
                      {address.line1}
                      {address.line2 && (
                        <>
                          <br />
                          {address.line2}
                        </>
                      )}
                      <br />
                      {address.city}, {address.state}
                      <br />
                      {address.country} · {address.phone}
                    </p>
                  ) : (
                    <p>
                      Add your preferred delivery address to make checkout
                      quicker.
                    </p>
                  )}
                </div>
              </div>
              {message && <Notice type="success">{message}</Notice>}
              <button
                className="profile-edit-link"
                onClick={() => setEditing(true)}
              >
                <Pencil size={14} /> Update details
              </button>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
