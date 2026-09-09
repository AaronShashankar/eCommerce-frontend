import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.patch("/auth/me", {
        username: form.username,
        email: form.email,
        billingAddress: Object.fromEntries(fields.map((k) => [k, form[k]])),
      });
      setUser(data.user);
      setMessage("Your account details are saved.");
      setEditing(false);
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <section className="section account">
      <div className="page-heading compact">
        <p className="eyebrow">Hello, {user?.username}</p>
        <h1>
          Your <i>account.</i>
        </h1>
      </div>
      <div className="account-grid">
        <div>
          <div className="section-title small">
            <h2>Orders</h2>
          </div>
          {orders.length ? (
            <div className="order-list">
              {orders.map((o) => (
                <Link to={`/orders/${o._id}`} className="order-row" key={o._id}>
                  <div>
                    <b>{o.orderNumber}</b>
                    <small>
                      {date(o.createdAt)} · {o.items.length} item(s)
                    </small>
                  </div>
                  <span className={`status ${o.status.toLowerCase()}`}>
                    {o.status}
                  </span>
                  <b>{money(o.total)}</b>
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
        <aside className="profile">
          <div className="section-title small">
            <h2>Details</h2>
            <button
              className="text-button"
              onClick={() => setEditing(!editing)}
            >
              {editing ? "Close" : "Edit"}
            </button>
          </div>
          {editing ? (
            <form onSubmit={save} className="form-grid">
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
              {fields.map((k) => (
                <label key={k}>
                  {k === "line1"
                    ? "Address"
                    : k === "line2"
                      ? "Address line 2"
                      : k.replace(/([A-Z])/g, " $1")}
                  <input
                    required={k !== "line2"}
                    value={form[k] || ""}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                </label>
              ))}
              <Notice>{error}</Notice>
              <button className="button dark full">Save details</button>
            </form>
          ) : (
            <>
              {message && <Notice type="success">{message}</Notice>}
              <p>
                <b>{user?.username}</b>
                <br />
                {user?.email}
              </p>
              {user?.billingAddress ? (
                <p>
                  {user.billingAddress.name}
                  <br />
                  {user.billingAddress.line1}
                  <br />
                  {user.billingAddress.city}, {user.billingAddress.state}
                  <br />
                  {user.billingAddress.phone}
                </p>
              ) : (
                <p className="muted">
                  Add a billing address to make checkout quicker.
                </p>
              )}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
