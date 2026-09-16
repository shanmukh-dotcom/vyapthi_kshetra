import React, { useState } from 'react';
import { Sparkles, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2, ChevronRight, Truck, Info } from 'lucide-react';
import PotatoImageUploader from '../components/potato/PotatoImageUploader';
import PotatoImagePreview from '../components/potato/PotatoImagePreview';
import PotatoAnalysisLoader from '../components/potato/PotatoAnalysisLoader';
import PotatoGradeResult from '../components/potato/PotatoGradeResult';
import PotatoDefectList from '../components/potato/PotatoDefectList';
import PotatoRecommendation from '../components/potato/PotatoRecommendation';
import { analyzePotatoCrop } from '../services/potatoApi';

export default function PotatoQualityPage({ onContinueToSell, onSelectRole }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [batchQuantity, setBatchQuantity] = useState(2000);
  const [batchNotes, setBatchNotes] = useState('Fresh harvest batch from field');

  const handleImagesSelected = (newFiles) => {
    setError(null);
    setSelectedImages((prev) => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 3); // Max 3
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setError(null);
  };

  const handleAnalyze = async () => {
    if (selectedImages.length === 0) {
      setError('Please upload at least 1 potato image before analyzing.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzePotatoCrop({
        images: selectedImages,
        quantityKg: batchQuantity,
        batchNotes: batchNotes
      });
      setAnalysisResult(result);
    } catch (err) {
      console.error('Potato analysis failed:', err);
      let userMsg = err.message || 'Something went wrong while analyzing the image.';
      if (userMsg.includes('Failed to fetch') || userMsg.includes('Unable to connect')) {
        userMsg = 'Unable to connect to the AI service. Please verify backend is running at http://localhost:8000.';
      }
      setError(userMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImages([]);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* 1. PAGE HEADER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
          color: 'white',
          borderRadius: '1.25rem',
          padding: '2.25rem 2rem',
          boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(4px)',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.85rem'
            }}
          >
            <Sparkles size={14} />
            <span>AI Agricultural Vision Engine</span>
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            AI Potato Quality Grading
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '640px', lineHeight: 1.5 }}>
            Upload photos of your potatoes to check their quality before selling.
          </p>
        </div>
      </div>

      {/* 2. UPLOAD & PREVIEW SECTION (Visible when not analyzed yet) */}
      {!analysisResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Image Uploader Card */}
          <PotatoImageUploader
            onImagesSelected={handleImagesSelected}
            currentCount={selectedImages.length}
            disabled={loading}
            error={error}
          />

          {/* Image Preview Grid */}
          {selectedImages.length > 0 && (
            <PotatoImagePreview
              images={selectedImages}
              onRemoveImage={handleRemoveImage}
              onAddMore={() => {
                const el = document.querySelector('input[type="file"]');
                if (el) el.click();
              }}
              disabled={loading}
            />
          )}

          {/* Batch Details (Farmer Friendly Optional Fields) */}
          {selectedImages.length > 0 && !loading && (
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '1rem',
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                alignItems: 'center'
              }}
            >
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Consignment Quantity (kg)
                </label>
                <input
                  type="number"
                  value={batchQuantity}
                  onChange={(e) => setBatchQuantity(Math.max(1, Number(e.target.value)))}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '0.6rem',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#0f172a'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Harvest Notes (Optional)
                </label>
                <input
                  type="text"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="e.g. Field A harvest, Krishna District"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '0.6rem',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.95rem',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>
          )}

          {/* ANALYZE BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={selectedImages.length === 0 || loading}
              style={{
                backgroundColor: selectedImages.length === 0 || loading ? '#94a3b8' : '#059669',
                color: 'white',
                border: 'none',
                padding: '1rem 2.5rem',
                borderRadius: '0.85rem',
                fontSize: '1.15rem',
                fontWeight: 800,
                cursor: selectedImages.length === 0 || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: selectedImages.length > 0 && !loading ? '0 10px 25px -5px rgba(5, 150, 105, 0.4)' : 'none',
                transition: 'all 0.2s ease',
                width: '100%',
                maxWidth: '420px',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={22} />
              <span>Analyze Potato Quality</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. LOADING STATE */}
      {loading && <PotatoAnalysisLoader />}

      {/* 4. RESULT SCREEN (Displayed on Successful API Response) */}
      {analysisResult && !analysisResult.is_valid_potato && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '2px solid #ef4444',
            borderRadius: '1.25rem',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.15)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626'
            }}
          >
            <AlertTriangle size={36} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>
              Unable to Reliably Grade This Sample
            </h3>
            <p style={{ fontSize: '1rem', color: '#7f1d1d', maxWidth: '520px', lineHeight: 1.5 }}>
              {analysisResult.validation_message || analysisResult.explanation || "The uploaded image does not clearly appear to be potatoes, or the image quality is too dark/blurry for AI inspection."}
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #fecaca',
              borderRadius: '0.85rem',
              padding: '1rem 1.5rem',
              textAlign: 'left',
              maxWidth: '480px',
              width: '100%',
              fontSize: '0.88rem',
              color: '#4b5563'
            }}
          >
            <strong style={{ color: '#1f2937' }}>Guidance for a successful check:</strong>
            <ul style={{ margin: '0.35rem 0 0 1.2rem', padding: 0 }}>
              <li>Ensure photos are taken in bright, natural daylight.</li>
              <li>Capture clear, focused close-ups of your potato tubers.</li>
              <li>Make sure actual potato tubers are visible in the photo.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleReset}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '0.85rem 1.75rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
          >
            <RotateCcw size={18} />
            <span>Upload Clearer Photos</span>
          </button>
        </div>
      )}

      {/* 5. VALID GRADING RESULT SCREEN */}
      {analysisResult && analysisResult.is_valid_potato !== false && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease' }}>
          {/* Quick Summary Pill Bar */}
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              borderRadius: '1rem',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Quality Grade</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#064e3b' }}>Grade {analysisResult.grade}</div>
              </div>

              <div style={{ width: '1px', height: '36px', backgroundColor: '#a7f3d0' }} />

              <div>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Quality Score</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#064e3b' }}>{Math.round(analysisResult.quality_score)}/100</div>
              </div>

              <div style={{ width: '1px', height: '36px', backgroundColor: '#a7f3d0' }} />

              <div>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Primary Defect</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064e3b' }}>
                  {analysisResult.defects && analysisResult.defects.length > 0
                    ? (analysisResult.defects[0].display_name || analysisResult.defects[0].type)
                    : 'Clean / Healthy'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              style={{
                backgroundColor: 'white',
                color: '#047857',
                border: '1.5px solid #059669',
                padding: '0.6rem 1.1rem',
                borderRadius: '0.6rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={16} />
              <span>New Analysis</span>
            </button>
          </div>

          {/* Main Grade Result Card */}
          <PotatoGradeResult result={analysisResult} />

          {/* Defect Information Card */}
          <PotatoDefectList
            defects={analysisResult.defects}
            predictions={analysisResult.predictions}
          />

          {/* AI Explanation & Recommendations */}
          <PotatoRecommendation
            explanation={analysisResult.explanation}
            recommendations={analysisResult.recommendations}
            knowledgeSources={analysisResult.knowledge_sources}
          />

          {/* Result Action Buttons */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <button
              type="button"
              onClick={handleReset}
              style={{
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1.5px solid #cbd5e1',
                padding: '0.85rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={18} />
              <span>Analyze Another Sample</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onContinueToSell) {
                  onContinueToSell(analysisResult);
                } else if (onSelectRole) {
                  onSelectRole('DEMO_FLOW');
                }
              }}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                padding: '0.85rem 1.75rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
            >
              <span>Continue to Sell & Book Transport</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
