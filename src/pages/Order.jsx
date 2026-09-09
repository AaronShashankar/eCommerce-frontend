import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import api from "../lib/api";
import { date, money } from "../lib/format";
import { Notice } from "../components/Ui";
export default function Order() {
  const { id } = useParams(),
    location = useLocation();
  const [order, setOrder] = useState(),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch((e) => setError(e.message));
  }, [id]);
  if (error)
    return (
      <section className="section">
        <Notice>{error}</Notice>
      </section>
    );
  if (!order) return <div className="loading">Loading your order…</div>;
  return (
    <section className="section order-detail">
      {location.state?.newOrder && (
        <div className="success-head">
          <CheckCircle2 />
          <div>
            <p className="eyebrow">Order confirmed</p>
            <h1>
              Thank you <i>deeply.</i>
            </h1>
            <p>We’ve received your order and will keep you updated.</p>
          </div>
        </div>
      )}
      <div className="order-heading">
        <div>
          <p className="eyebrow">Order</p>
          <h1>{order.orderNumber}</h1>
          <p>{date(order.createdAt)}</p>
        </div>
        <span className={`status ${order.status.toLowerCase()}`}>
          {order.status}
        </span>
      </div>
      <div className="order-detail-grid">
        <div className="order-items">
          {order.items.map((item, index) => (
            <div className="cart-line" key={index}>
              <img src={item.image} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <p>{item.variant}</p>
                <strong>
                  {money(item.unitPrice)} × {item.quantity}
                </strong>
              </div>
              <b>{money(item.unitPrice * item.quantity)}</b>
            </div>
          ))}
        </div>
        <aside className="order-summary">
          <h2>Summary</h2>
          <p>
            <span>Subtotal</span>
            <b>{money(order.subtotal)}</b>
          </p>
          {order.discount > 0 && (
            <p>
              <span>Discount</span>
              <b>−{money(order.discount)}</b>
            </p>
          )}
          <p>
            <span>Payment</span>
            <b>
              {order.payment.method === "cod" ? "Cash on Delivery" : "Card"}
            </b>
          </p>
          <hr />
          <p className="total">
            <span>Total</span>
            <b>{money(order.total)}</b>
          </p>
          <h3>Billing address</h3>
          <p>
            {order.billingAddress.name}
            <br />
            {order.billingAddress.line1}
            <br />
            {order.billingAddress.city}, {order.billingAddress.state}
            <br />
            {order.billingAddress.phone}
          </p>
        </aside>
      </div>
      <Link className="button dark" to="/shop">
        Continue shopping
      </Link>
    </section>
  );
}
