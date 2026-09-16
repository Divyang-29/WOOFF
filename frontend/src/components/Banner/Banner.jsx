import React from "react";
import { Link } from "react-router-dom";
import "./Banner.css";

export default function Banner({ title, breadcrumb, bgImage }) {
  const renderBreadcrumb = () => {
    if (!breadcrumb) return null;
    if (typeof breadcrumb !== 'string') return breadcrumb;

    const parts = breadcrumb.split('/');
    if (parts.length > 1) {
      const firstPart = parts[0].trim();
      const restPart = parts.slice(1).join('/').trim();
      const isHome = firstPart.toUpperCase() === 'HOME';

      return (
        <>
          {isHome ? (
            <Link className="breadcrumb-home-link" to="/">
              {firstPart}
            </Link>
          ) : (
            <span>{firstPart}</span>
          )}
          <span className="breadcrumb-divider">/</span>
          <span>{restPart}</span>
        </>
      );
    }

    return breadcrumb;
  };

  return (
    <div
      className="page-banner"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
      }}
    >
      <div className="banner-content-wrap">
        {breadcrumb && (
          <div className="banner-breadcrumb-badge">
            {renderBreadcrumb()}
          </div>
        )}
        <h1 className="banner-title">{title}</h1>
      </div>
    </div>
  );
}
