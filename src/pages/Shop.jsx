import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../lib/api";
import { Empty, ProductCard } from "../components/Ui";

const LIMIT = 12;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";
  const flashSaleParam = searchParams.get("flashSale") || "";
  const featuredParam = searchParams.get("featured") || "";
  const pageParam = Number(searchParams.get("page") || "1");

  const [search, setSearch] = useState(searchParam);

  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(LIMIT), page: String(pageParam) });
    if (categoryParam) params.set("category", categoryParam);
    if (searchParam) params.set("search", searchParam);
    if (flashSaleParam) params.set("flashSale", flashSaleParam);
    if (featuredParam) params.set("featured", featuredParam);

    const timer = setTimeout(() => {
      api
        .get(`/products?${params.toString()}`)
        .then((r) => {
          setProducts(r.data.products || []);
          setTotalPages(r.data.pages || 1);
          setTotalProducts(r.data.total || 0);
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [categoryParam, searchParam, flashSaleParam, featuredParam, pageParam]);

  const setPage = (p) => {
    const newParams = new URLSearchParams(searchParams);
    if (p === 1) newParams.delete("page");
    else newParams.set("page", String(p));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectCategory = (catName) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("page");
    if (catName) {
      newParams.set("category", catName);
    } else {
      newParams.delete("category");
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("page");
    if (val) {
      newParams.set("search", val);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearch("");
  };

  // Build pagination page numbers with ellipsis
  const buildPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (pageParam > 3) pages.push("...");
      for (let i = Math.max(2, pageParam - 1); i <= Math.min(totalPages - 1, pageParam + 1); i++) {
        pages.push(i);
      }
      if (pageParam < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="wink-product-page">
      <div className="wink-container">
        {/* Header Title Section */}
        <div className="wink-shop-header">
          <div className="heading-left">
            <span className="wink-badge-pill">The Collection</span>
            <h1 className="wink-shop-title">
              Explore Our <span>Products.</span>
            </h1>
            <p className="wink-shop-subtitle">
              Curated essentials built for modern living &amp; timeless style.
            </p>
          </div>
        </div>

        {/* Inline Filter Bar — no card wrapper */}
        <div className="shop-filter-bar">
          <div className="shop-cats-scroll">
            <button
              className={`wink-cat-pill ${!categoryParam && !flashSaleParam && !featuredParam ? "active" : ""}`}
              onClick={clearAllFilters}
            >
              <Sparkles size={14} /> All
            </button>

            {categories.map((c) => {
              const isActive = categoryParam.toLowerCase() === c.name.toLowerCase() || categoryParam === c._id;
              return (
                <button
                  key={c._id}
                  className={`wink-cat-pill ${isActive ? "active" : ""}`}
                  onClick={() => selectCategory(c.name)}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          <div className="shop-search-inline">
            <Search size={16} />
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search products…"
              aria-label="Search products"
            />
          </div>
        </div>

        {/* Active Filter Tags */}
        {(categoryParam || flashSaleParam || featuredParam || searchParam) && (
          <div className="wink-active-filters">
            <span>Active Filter:</span>
            {categoryParam && <span className="filter-badge">Category: {categoryParam}</span>}
            {flashSaleParam && <span className="filter-badge">On Sale 🔥</span>}
            {featuredParam && <span className="filter-badge">Featured ✨</span>}
            {searchParam && <span className="filter-badge">Query: &quot;{searchParam}&quot;</span>}
            <button className="clear-filter-btn" onClick={clearAllFilters}>Reset All</button>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="wink-loading-box">Curating collection items…</div>
        ) : products.length ? (
          <>
            <div className="wink-related-grid" style={{ marginTop: "24px" }}>
              {products.map((p) => (
                <ProductCard product={p} key={p._id} />
              ))}
            </div>

            {/* Number-based Pagination */}
            {totalPages > 1 && (
              <nav className="shop-pagination" aria-label="Product pages">
                <span className="pagination-info">
                  {totalProducts} products — page {pageParam} of {totalPages}
                </span>
                <div className="pagination-controls">
                  <button
                    className="page-btn page-arrow"
                    onClick={() => setPage(pageParam - 1)}
                    disabled={pageParam === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {buildPages().map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`page-btn ${pageParam === p ? "active" : ""}`}
                        onClick={() => setPage(p)}
                        aria-label={`Page ${p}`}
                        aria-current={pageParam === p ? "page" : undefined}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="page-btn page-arrow"
                    onClick={() => setPage(pageParam + 1)}
                    disabled={pageParam === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </nav>
            )}
          </>
        ) : (
          <Empty
            title="No pieces found"
            text="Try clearing your category filter or searching for another term."
          />
        )}
      </div>
    </div>
  );
}
