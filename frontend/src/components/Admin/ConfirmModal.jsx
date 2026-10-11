import React from 'react';

/**
 * Reusable Confirmation Modal to replace native window.confirm()
 * Designed with Wooff's modern vibrant pill styling and accessibility.
 */
export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '2px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'scaleUp 0.18s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                backgroundColor: danger ? '#fee2e2' : '#e0f2fe',
                color: danger ? '#dc2626' : '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
              }}
            >
              {danger ? '⚠️' : 'ℹ️'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                {title}
              </h3>
            </div>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div
          style={{
            padding: '16px 28px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '9999px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: '700',
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '10px 24px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: danger ? '#dc2626' : '#2563eb',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: danger ? '0 4px 12px rgba(220, 38, 38, 0.3)' : '0 4px 12px rgba(37, 99, 235, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            {loading && <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
