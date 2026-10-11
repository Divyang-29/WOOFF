import React, { useState } from 'react';

/**
 * High-Fidelity SVG Sales Trend Chart (30-Day Velocity)
 * 100% dynamic data from PostgreSQL generate_series aggregation.
 * Zero hardcoded coordinates or mock values.
 */
export default function SalesTrendChart({ trends = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!trends || trends.length === 0) {
    return (
      <div
        style={{
          height: '240px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          border: '1.5px dashed #cbd5e1',
          color: '#64748b',
          fontSize: '14px',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '28px' }}>📊</span>
        <span style={{ fontWeight: '600' }}>No daily sales recorded in the past 30 days</span>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          Real-time transactions will render here automatically.
        </span>
      </div>
    );
  }

  // Calculate dimensions and coordinates
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 24;
  const paddingTop = 28;
  const paddingBottom = 40;
  const chartWidth = 780; // viewBox internal width

  const revenues = trends.map((t) => Number(t.daily_revenue || 0));
  const maxRevenue = Math.max(...revenues, 100);
  const minRevenue = 0;

  const points = trends.map((item, index) => {
    const x = paddingLeft + (index / (trends.length - 1)) * (chartWidth - paddingLeft - paddingRight);
    const revenueVal = Number(item.daily_revenue || 0);
    const y =
      height -
      paddingBottom -
      ((revenueVal - minRevenue) / (maxRevenue - minRevenue)) * (height - paddingTop - paddingBottom);
    return { x, y, item, revenueVal };
  });

  // Construct SVG Path
  const linePathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaPathD =
    points.length > 0
      ? `${linePathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : '';

  // 4 Horizontal Grid Lines
  const gridLevels = [0, 0.33, 0.66, 1];

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        style={{ width: '100%', height: 'auto', minWidth: '600px', display: 'block' }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Horizontal Gridlines & Y-Axis Labels */}
        {gridLevels.map((lvl, i) => {
          const y = height - paddingBottom - lvl * (height - paddingTop - paddingBottom);
          const val = Math.round(minRevenue + lvl * (maxRevenue - minRevenue));
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={lvl === 0 ? 'none' : '4 4'}
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#64748b"
                fontFamily="sans-serif"
                fontWeight="500"
              >
                ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPathD} fill="url(#revenueGradient)" />

        {/* Smooth Trend line */}
        <path
          d={linePathD}
          fill="none"
          stroke="url(#lineStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-Axis Dates (Show every 5th date) */}
        {points.map((pt, idx) => {
          if (idx % 5 === 0 || idx === points.length - 1) {
            return (
              <text
                key={idx}
                x={pt.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#94a3b8"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                {pt.item.display_date}
              </text>
            );
          }
          return null;
        })}

        {/* Interactive Data Points */}
        {points.map((pt, idx) => (
          <g
            key={idx}
            onMouseEnter={() => setHoveredPoint(pt)}
            onMouseLeave={() => setHoveredPoint(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.item?.sale_date === pt.item.sale_date ? 6 : 3.5}
              fill={hoveredPoint?.item?.sale_date === pt.item.sale_date ? '#2563eb' : '#ffffff'}
              stroke="#2563eb"
              strokeWidth={hoveredPoint?.item?.sale_date === pt.item.sale_date ? 3 : 2}
              style={{ transition: 'all 0.15s ease' }}
            />
            {/* Extended invisible touch/hover hit zone */}
            <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />
          </g>
        ))}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            left: `${(hoveredPoint.x / chartWidth) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100}%`,
            transform: 'translate(-50%, -120%)',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '12px',
            pointerEvents: 'none',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: '700', marginBottom: '2px', color: '#93c5fd' }}>
            {hoveredPoint.item.display_date}
          </div>
          <div>
            Revenue:{' '}
            <strong style={{ color: '#ffffff' }}>
              ₹{Number(hoveredPoint.item.daily_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div style={{ color: '#cbd5e1', fontSize: '11px' }}>
            Orders: <strong>{hoveredPoint.item.daily_orders || 0}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
