import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { money } from "../lib/format";
export function Notice({ children, type = "error" }) {
  return children ? <p className={`notice ${type}`}>{children}</p> : null;
}
export function ProductCard({ product, onAdd }) {
  const price = product.salePrice ?? product.price;
  return (
    <article className="product-card">
      <Link to={`/shop/${product.slug}`} className="product-card-image">
        <img
          src={
            product.images?.[0] ||
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"
          }
          alt={product.name}
        />
        {product.salePrice && <span className="product-card-badge">Sale</span>}
      </Link>
      <div className="product-card-meta">
        <h3>
          <Link to={`/shop/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="product-card-price">
          {money(price)}{" "}
          {product.salePrice && <del>{money(product.price)}</del>}
        </div>
        {onAdd && <button className="quick-add" onClick={onAdd}>Quick add <Plus size={15}/></button>}
      </div>
    </article>
  );
}
export function Quantity({ value, onChange }) {
  return (
    <div className="quantity">
      <button onClick={() => onChange(value - 1)} aria-label="decrease">
        <Minus size={15} />
      </button>
      <span>{value}</span>
      <button onClick={() => onChange(value + 1)} aria-label="increase">
        <Plus size={15} />
      </button>
    </div>
  );
}
export function Empty({
  title,
  text,
  to = "/shop",
  label = "Explore collection",
}) {
  return (
    <section className="empty">
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="button dark" to={to}>
        {label}
        <ArrowRight size={17} />
      </Link>
    </section>
  );
}
export function CartLine({ item, onQuantity, onRemove, editable = true }) {
  const product = item.product;
  if (!product) return null;
  const price = product.salePrice ?? product.price ?? item.unitPrice;
  return (
    <div className="cart-line">
      <img
        src={product.images?.[0] || item.image}
        alt={product.name || item.name}
      />
      <div>
        <h3>{product.name || item.name}</h3>
        {item.variant && <p>{item.variant}</p>}
        <strong>{money(price)}</strong>
      </div>
      {editable && <Quantity value={item.quantity} onChange={onQuantity} />}
      <b>{money(price * item.quantity)}</b>
      {editable && (
        <button
          className="icon-button"
          onClick={onRemove}
          aria-label="Remove item"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
