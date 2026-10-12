import React from "react";
import { Link } from "react-router-dom";
import "./Banner.css";

export default function Banner({ title, breadcrumb, bgImage }) {
  const renderBreadcrumb = () => {
    if (!breadcrumb) return null;
    if (typeof breadcrumb !== 'string') return breadcrumb;

    const parts = breadcrumb.split('/');
    if (parts.length > 1) {
      return parts.map((rawPart, index) => {
        const part = rawPart.trim();
        const upper = part.toUpperCase();
        let linkTo = null;

        if (upper === 'HOME') {
          linkTo = '/';
        } else if (upper === 'BLOG' || upper === 'BLOGS' || upper === 'OUR JOURNAL' || upper === 'JOURNAL') {
          linkTo = '/blog';
        } else if (upper === 'SHOP' || upper === 'PRODUCTS') {
          linkTo = '/shop';
        }

        const isLast = index === parts.length - 1;

        return (
          <React.Fragment key={index}>
            {linkTo && !isLast ? (
              <Link className="breadcrumb-home-link" to={linkTo}>
                {part}
              </Link>
            ) : (
              <span>{part}</span>
            )}
            {!isLast && <span className="breadcrumb-divider">/</span>}
          </React.Fragment>
        );
      });
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
