import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../lib/api";
import { Empty, ProductCard } from "../components/Ui";
export default function Shop() {
  const [products, setProducts] = useState([]),
    [categories, setCategories] = useState([]),
    [selected, setSelected] = useState(""),
    [search, setSearch] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data));
  }, []);
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "24" });
    if (selected) params.set("category", selected);
    if (search) params.set("search", search);
    const timer = setTimeout(
      () =>
        api
          .get(`/products?${params}`)
          .then((r) => setProducts(r.data.products))
          .catch(() => setProducts([]))
          .finally(() => setLoading(false)),
      250,
    );
    return () => clearTimeout(timer);
  }, [selected, search]);
  return (
    <section className="section shop">
      <div className="page-heading">
        <p className="eyebrow">The collection</p>
        <h1>
          Find your <i>favourite.</i>
        </h1>
        <p>Objects for the considered life, made to be lived with.</p>
      </div>
      <div className="shop-tools">
        <div className="chips">
          <button
            className={!selected ? "active" : ""}
            onClick={() => setSelected("")}
          >
            All pieces
          </button>
          {categories.map((c) => (
            <button
              className={selected === c._id ? "active" : ""}
              onClick={() => setSelected(c._id)}
              key={c._id}
            >
              {c.name}
            </button>
          ))}
        </div>
        <label className="search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pieces"
          />
        </label>
      </div>
      {loading ? (
        <div className="loading">Curating the collection…</div>
      ) : products.length ? (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard product={p} key={p._id} />
          ))}
        </div>
      ) : (
        <Empty
          title="Nothing found"
          text="Try a different search or category."
        />
      )}
    </section>
  );
}
