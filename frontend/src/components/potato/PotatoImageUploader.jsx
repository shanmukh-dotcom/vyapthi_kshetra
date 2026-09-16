import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';
import { validateImageFiles } from '../../services/potatoApi';

export default function PotatoImageUploader({ onImagesSelected, currentCount = 0, disabled = false, error = null }) {
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFiles = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setLocalError(null);

    const fileList = Array.from(selectedFiles);
    const combinedCount = currentCount + fileList.length;

    if (combinedCount > 3) {
      setLocalError(`You can upload at most 3 images in total. Currently selected: ${currentCount}, tried to add: ${fileList.length}.`);
      return;
    }

    const validation = validateImageFiles(fileList);
    if (!validation.valid) {
      setLocalError(validation.error);
      return;
    }

    onImagesSelected(fileList);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const displayError = error || localError;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Upload Drop Zone Card */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? '#059669' : '#cbd5e1'}`,
          borderRadius: '1.25rem',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          backgroundColor: dragActive ? '#ecfdf5' : '#ffffff',
          transition: 'all 0.2s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: dragActive ? '0 10px 25px -5px rgba(5, 150, 105, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
          position: 'relative'
        }}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          capture="environment"
          style={{ display: 'none' }}
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)'
            }}
          >
            <UploadCloud size={32} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              Upload Potato Images
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '420px', margin: '0 auto' }}>
              Upload <strong>1 to 3 clear photos</strong> of your potato batch to check grade, defect incidence, and market quality.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
              marginTop: '0.5rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={disabled || currentCount >= 3}
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: currentCount >= 3 ? '#94a3b8' : '#059669',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.4rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: currentCount >= 3 || disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <ImageIcon size={18} />
              <span>Choose Images</span>
            </button>

            <button
              type="button"
              disabled={disabled || currentCount >= 3}
              onClick={() => cameraInputRef.current?.click()}
              style={{
                backgroundColor: '#ffffff',
                color: '#047857',
                border: '1.5px solid #059669',
                padding: '0.75rem 1.4rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: currentCount >= 3 || disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Camera size={18} />
              <span>Take Photo</span>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '0.75rem',
              fontSize: '0.8rem',
              color: '#94a3b8',
              fontWeight: 600
            }}
          >
            <span>Formats: JPG, JPEG, PNG</span>
            <span>•</span>
            <span>Max Size: 10MB</span>
            <span>•</span>
            <span>Slot: {currentCount}/3 Images</span>
          </div>
        </div>
      </div>

      {/* Error Card */}
      {displayError && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1.5px solid #fecaca',
            color: '#b91c1c',
            padding: '0.9rem 1.25rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{displayError}</span>
        </div>
      )}

      {/* Helpful Farmer Guidance Tips */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.85rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: '#475569'
        }}
      >
        <Sparkles size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#0f172a' }}>Tips for accurate quality results:</strong>
          <ul style={{ margin: '0.25rem 0 0 1.2rem', padding: 0 }}>
            <li>Place potatoes on a plain background in bright natural daylight.</li>
            <li>Take close-up photos showing both top surface and sides of tubers.</li>
            <li>Include any visible spots, scab, or discoloration so the AI can grade accurately.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
