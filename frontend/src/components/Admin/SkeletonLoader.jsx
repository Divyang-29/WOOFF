import React from 'react';

/**
 * Reusable Skeleton Loaders for Data Fetching UX
 */
export function SkeletonCard({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            border: '1.5px solid #f1f5f9',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              height: '14px',
              width: '60%',
              backgroundColor: '#e2e8f0',
              borderRadius: '6px',
              marginBottom: '16px',
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <div
            style={{
              height: '28px',
              width: '80%',
              backgroundColor: '#cbd5e1',
              borderRadius: '8px',
              marginBottom: '12px',
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <div
            style={{
              height: '12px',
              width: '40%',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '16px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
        <div
          style={{
            height: '18px',
            width: '180px',
            backgroundColor: '#e2e8f0',
            borderRadius: '6px',
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </div>
      <div style={{ padding: '12px 20px' }}>
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: rIdx === rows - 1 ? 'none' : '1px solid #f1f5f9',
            }}
          >
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                style={{
                  height: '16px',
                  flex: cIdx === 0 ? 2 : 1,
                  backgroundColor: '#f1f5f9',
                  borderRadius: '6px',
                  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
