import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from 'products/cartStore';

function Header() {
  const items = useCartStore((state) => state.items);
  const totalItems = Object.values(items).reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <header
      style={{
        background: "rgba(49, 54, 71, 0.95)",
        padding: "20px",
        color: "#FFF8D4",
        borderBottom: "1px solid rgba(255, 248, 212, 0.2)",
        backdropFilter: "blur(10px)",
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "#FFF8D4" }}>
          <h1 style={{ margin: 0, fontWeight: 300, letterSpacing: "1px" }}>
            Between Lines
          </h1>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "12px",
              color: "rgba(255, 248, 212, 0.85)",
              fontWeight: 300,
            }}
          >
            Like Real People Do
          </p>
        </Link>
        <ul
          style={{
            display: "flex",
            listStyle: "none",
            gap: "20px",
            margin: 0,
            padding: 0,
            alignItems: "center",
          }}
        >
          <li>
            <Link to="/" style={{ color: "#FFF8D4", textDecoration: "none" }}>
              홈
            </Link>
          </li>
          <li>
            <Link
              to="/cart"
              style={{
                color: "#FFF8D4",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                position: "relative",
              }}
            >
              🛒 장바구니
              {totalItems > 0 && (
                <span
                  style={{
                    backgroundColor: "#FF9800",
                    color: "white",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
