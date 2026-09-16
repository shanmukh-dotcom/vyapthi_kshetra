import React from 'react';
import { Trash2, Plus, CheckCircle } from 'lucide-react';

export default function PotatoImagePreview({ images = [], onRemoveImage, onAddMore, disabled = false }) {
  if (!images || images.length === 0) return null;

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Selected Potato Photos</span>
          <span style={{ fontSize: '0.85rem', backgroundColor: '#ecfdf5', color: '#047857', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 700 }}>
            {images.length}/3
          </span>
        </h4>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          {images.length === 3 ? 'Maximum photos selected' : `You can add ${3 - images.length} more photo${3 - images.length > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Grid of Image Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {images.map((item, index) => {
          const previewUrl = typeof item === 'string' ? item : URL.createObjectURL(item);
          const fileName = item.name || `sample_potato_0${index + 1}.jpg`;
          const fileSize = item.size ? formatSize(item.size) : '';

          return (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                border: '1.5px solid #e2e8f0',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Image Preview Container */}
              <div
                style={{
                  height: '180px',
                  backgroundColor: '#f1f5f9',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={previewUrl}
                  alt={`Potato sample ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* Badge Number */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <CheckCircle size={14} color="#10b981" />
                  <span>Potato Image {index + 1}</span>
                </div>

                {/* Remove Button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    title="Remove this photo"
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)')}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Card Footer Details */}
              <div style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafafa', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                    {fileName}
                  </div>
                  {fileSize && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{fileSize}</div>
                  )}
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#ef4444',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '0.2rem 0.4rem'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Another Slot Card if < 3 */}
        {images.length < 3 && !disabled && (
          <div
            onClick={onAddMore}
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '1rem',
              backgroundColor: '#f8fafc',
              minHeight: '235px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.2s ease',
              padding: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#059669';
              e.currentTarget.style.backgroundColor = '#ecfdf5';
              e.currentTarget.style.color = '#047857';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid currentColor'
              }}
            >
              <Plus size={22} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Add Another Photo</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Slot {images.length + 1} of 3</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
