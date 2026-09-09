import { useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useStore } from "../context/StoreContext";
import { money } from "../lib/format";
import { Notice } from "../components/Ui";
const blank = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Nepal",
  phone: "",
  email: "",
};
function CardForm({ order }) {
  const stripe = useStripe(),
    elements = useElements(),
    navigate = useNavigate();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const pay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }
    try {
      await api.post(`/orders/${order._id}/confirm-payment`);
      navigate(`/orders/${order._id}`, { state: { newOrder: true } });
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };
  return (
    <form onSubmit={pay} className="card-payment">
      <PaymentElement />
      <Notice>{error}</Notice>
      <button disabled={!stripe || busy} className="button dark full">
        {busy ? "Confirming…" : `Pay ${money(order.total)}`}
      </button>
    </form>
  );
}
export default function Checkout() {
  const { cart, user } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ...blank,
    email: user?.email || "",
    ...(user?.billingAddress || {}),
  });
  const [method, setMethod] = useState("cod"),
    [promo, setPromo] = useState(""),
    [quote, setQuote] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [card, setCard] = useState(null);
  const subtotal = useMemo(
    () =>
      cart.items.reduce(
        (s, i) =>
          s + (i.product?.salePrice ?? i.product?.price ?? 0) * i.quantity,
        0,
      ),
    [cart],
  );
  const getQuote = async () => {
    setError("");
    try {
      setQuote((await api.post("/orders/quote", { promoCode: promo })).data);
    } catch (e) {
      setQuote(null);
      setError(e.message);
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/orders/checkout", {
        paymentMethod: method,
        promoCode: promo,
        billingAddress: form,
      });
      if (method === "cod")
        navigate(`/orders/${data.order._id}`, { state: { newOrder: true } });
      else {
        if (!data.publishableKey)
          throw new Error(
            "Stripe publishable key is missing. Ask an administrator to configure it.",
          );
        setCard(data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (!cart.items.length && !card) {
    navigate("/cart");
    return null;
  }
  if (card)
    return (
      <section className="section checkout">
        <div className="checkout-main">
          <p className="eyebrow">Secure online payment</p>
          <h1>
            Almost <i>there.</i>
          </h1>
          <p className="muted">
            Order {card.order.orderNumber} · {money(card.order.total)}
          </p>
          <Elements
            stripe={loadStripe(card.publishableKey)}
            options={{
              clientSecret: card.clientSecret,
              appearance: { theme: "stripe" },
            }}
          >
            <CardForm order={card.order} />
          </Elements>
        </div>
      </section>
    );
  return (
    <section className="section checkout">
      <div className="checkout-main">
        <p className="eyebrow">Checkout</p>
        <h1>
          Delivery <i>details.</i>
        </h1>
        <form onSubmit={submit} className="form-grid checkout-form">
          <h2>Billing information</h2>
          {Object.entries(form).map(([key, value]) => (
            <label
              key={key}
              className={["line1", "line2"].includes(key) ? "wide" : ""}
            >
              {key === "line1"
                ? "Address"
                : key === "line2"
                  ? "Address line 2"
                  : key.replace(/([A-Z])/g, " $1")}
              <input
                required={key !== "line2"}
                type={key === "email" ? "email" : "text"}
                value={value}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          <h2>Payment method</h2>
          <label className="payment-option">
            <input
              type="radio"
              checked={method === "cod"}
              onChange={() => setMethod("cod")}
            />
            <span>
              <b>Cash on Delivery</b>
              <small>Pay when your order arrives</small>
            </span>
          </label>
          <label className="payment-option">
            <input
              type="radio"
              checked={method === "stripe"}
              onChange={() => setMethod("stripe")}
            />
            <span>
              <b>Credit / debit card</b>
              <small>Securely processed by Stripe</small>
            </span>
          </label>
          <Notice>{error}</Notice>
          <button disabled={busy} className="button dark full">
            {busy
              ? "Preparing your order…"
              : method === "cod"
                ? `Place order · ${money(quote?.total ?? subtotal)}`
                : `Continue to payment · ${money(quote?.total ?? subtotal)}`}
          </button>
        </form>
      </div>
      <aside className="checkout-side">
        <h2>Your order</h2>
        {cart.items.map((i) => (
          <p key={i._id}>
            <span>
              {i.product?.name} × {i.quantity}
            </span>
            <b>
              {money((i.product?.salePrice ?? i.product?.price) * i.quantity)}
            </b>
          </p>
        ))}
        <hr />
        <p>
          <span>Subtotal</span>
          <b>{money(subtotal)}</b>
        </p>
        <div className="promo">
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value.toUpperCase())}
            placeholder="Promo code"
          />
          <button type="button" onClick={getQuote}>
            Apply
          </button>
        </div>
        {quote && (
          <p className="discount">
            <span>Discount ({quote.code})</span>
            <b>−{money(quote.discount)}</b>
          </p>
        )}
        <p className="total">
          <span>Total</span>
          <b>{money(quote?.total ?? subtotal)}</b>
        </p>
      </aside>
    </section>
  );
}
