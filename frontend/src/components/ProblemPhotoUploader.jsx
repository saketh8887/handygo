import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Image as ImageIcon, Trash2, RotateCcw, AlertCircle, 
  Upload, X, Check, Eye, Video, VideoOff, RefreshCw, Sparkles 
} from 'lucide-react';

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * ProblemPhotoUploader
 *
 * Allows customers to capture photos using their device camera or select up to 5
 * high-resolution images from their gallery (JPEG, PNG, WebP <= 5MB each).
 *
 * Props:
 * - photos: Array of { id, file, previewUrl, name, size }
 * - onChange: (newPhotos: Array) => void
 * - maxPhotos?: number (default: 5)
 */
export default function ProblemPhotoUploader({ photos = [], onChange, maxPhotos = MAX_PHOTOS }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [replacingPhotoId, setReplacingPhotoId] = useState(null);
  const [previewingPhoto, setPreviewingPhoto] = useState(null);

  // Hidden file inputs
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);

  // Clean up object URLs when photos are unmounted or removed
  useEffect(() => {
    return () => {
      // Revoke any active camera streams on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle closing camera stream
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraModalOpen(false);
    setCameraLoading(false);
    setCameraError('');
  };

  // 1. Mobile & Graceful Camera Trigger
  const handleInitiateTakePhoto = async (photoIdToReplace = null) => {
    setErrorMsg('');
    setReplacingPhotoId(photoIdToReplace);

    if (!photoIdToReplace && photos.length >= maxPhotos) {
      setErrorMsg(`Maximum of ${maxPhotos} photos reached. Remove an existing photo to take a new one.`);
      return;
    }

    // Check if live camera (getUserMedia) is supported in current environment
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    // On mobile devices or browsers without direct getUserMedia, or if preferred,
    // trigger the native mobile camera file input directly!
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile || !hasGetUserMedia) {
      // Fallback directly to native mobile camera file input with capture="environment"
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
      return;
    }

    // On desktop browsers with webcam support: open live camera modal
    try {
      setIsCameraModalOpen(true);
      setCameraLoading(true);
      setCameraError('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.error('Video play error:', e));
      }
    } catch (err) {
      console.warn('Live webcam access unavailable, falling back to file picker:', err);
      // Fallback cleanly to camera file input
      stopCameraStream();
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    } finally {
      setCameraLoading(false);
    }
  };

  // Capture frame from active live video stream
  const handleCaptureFromLiveCamera = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setErrorMsg('Failed to process camera snapshot. Please try again.');
            stopCameraStream();
            return;
          }

          const filename = `camera_capture_${Date.now()}.jpg`;
          const capturedFile = new File([blob], filename, { type: 'image/jpeg' });
          addFiles([capturedFile], replacingPhotoId);
          stopCameraStream();
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Snapshot capture error:', err);
      setErrorMsg('Could not capture frame from camera.');
      stopCameraStream();
    }
  };

  // 2. Gallery Upload Trigger
  const handleInitiateGalleryUpload = (photoIdToReplace = null) => {
    setErrorMsg('');
    setReplacingPhotoId(photoIdToReplace);

    if (!photoIdToReplace && photos.length >= maxPhotos) {
      setErrorMsg(`Maximum of ${maxPhotos} photos reached.`);
      return;
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = ''; // Reset input to allow selecting same file if desired
      galleryInputRef.current.click();
    }
  };

  // 3. Process Selected Files (Validation & State Update)
  const handleFileInputChange = (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return; // User simply cancelled

    addFiles(fileList, replacingPhotoId);
    e.target.value = ''; // Clear value
  };

  const addFiles = (incomingFiles, targetPhotoIdToReplace = null) => {
    setErrorMsg('');
    const validatedNewItems = [];

    for (const file of incomingFiles) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        setErrorMsg(`"${file.name}" is not a supported image format. Please use JPEG, PNG, or WebP.`);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setErrorMsg(`"${file.name}" (${sizeMb} MB) exceeds the 5 MB limit. Please select a smaller photo.`);
        return;
      }

      // Check duplicates against existing photos
      const isDuplicate = photos.some(
        (p) => p.name === file.name && p.size === file.size && p.id !== targetPhotoIdToReplace
      );
      if (isDuplicate) {
        setErrorMsg(`"${file.name}" has already been attached.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      validatedNewItems.push({
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        name: file.name,
        size: file.size,
      });
    }

    if (targetPhotoIdToReplace) {
      // Replace existing photo
      const photoToReplace = photos.find((p) => p.id === targetPhotoIdToReplace);
      if (photoToReplace) {
        URL.revokeObjectURL(photoToReplace.previewUrl);
      }

      const updated = photos.map((p) => (p.id === targetPhotoIdToReplace ? validatedNewItems[0] : p));
      onChange(updated);
      setReplacingPhotoId(null);
    } else {
      // Append new photos while respecting max limit
      const availableSlots = maxPhotos - photos.length;
      if (validatedNewItems.length > availableSlots) {
        setErrorMsg(`You can only add ${availableSlots} more photo${availableSlots === 1 ? '' : 's'} (max ${maxPhotos}).`);
      }

      const itemsToAdd = validatedNewItems.slice(0, availableSlots);
      onChange([...photos, ...itemsToAdd]);
    }
  };

  // Remove individual photo
  const handleRemovePhoto = (photoId) => {
    const photoToRemove = photos.find((p) => p.id === photoId);
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.previewUrl);
    }
    const filtered = photos.filter((p) => p.id !== photoId);
    onChange(filtered);
    setErrorMsg('');
  };

  // Format file size nicely
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="hc-photo-uploader">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={galleryInputRef}
        multiple={!replacingPhotoId}
        accept="image/jpeg,image/png,image/webp"
        className="d-none"
        onChange={handleFileInputChange}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="d-none"
        onChange={handleFileInputChange}
      />

      {/* Header with Camera Icon & Photo Count */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-1.5 d-inline-flex align-items-center justify-content-center">
              <Camera size={18} />
            </div>
            <h6 className="fw-bold text-dark mb-0 fs-6">Add Photos of the Problem</h6>
            <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '0.72rem' }}>
              Optional
            </span>
          </div>
          <p className="text-secondary small mb-0">
            Help your handyman understand the issue before arriving.
          </p>
        </div>

        {/* Photo Counter Pill */}
        <div className="align-self-start align-self-sm-auto">
          <span 
            className={`badge px-2.5 py-1.5 rounded-pill fw-semibold ${
              photos.length > 0 
                ? 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25' 
                : 'bg-light text-secondary border'
            }`}
            style={{ fontSize: '0.78rem' }}
          >
            {photos.length} of {maxPhotos} photos added
          </span>
        </div>
      </div>

      {/* Validation / Error Message Alert */}
      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 p-2.5 mb-3 rounded-3 border-0 small">
          <AlertCircle size={16} className="flex-shrink-0" />
          <div className="flex-grow-1">{errorMsg}</div>
          <button 
            type="button" 
            className="btn btn-link text-danger p-0 ms-2 text-decoration-none" 
            onClick={() => setErrorMsg('')}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Action Buttons: Take Photo & Upload from Gallery */}
      <div className="d-flex flex-wrap gap-2.5 mb-3">
        <button
          type="button"
          className="btn btn-primary btn-sm px-3.5 py-2 rounded-3 d-inline-flex align-items-center gap-2 fw-medium shadow-sm"
          disabled={photos.length >= maxPhotos}
          onClick={() => handleInitiateTakePhoto(null)}
        >
          <Camera size={16} />
          <span>Take Photo</span>
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm px-3.5 py-2 rounded-3 d-inline-flex align-items-center gap-2 fw-medium"
          disabled={photos.length >= maxPhotos}
          onClick={() => handleInitiateGalleryUpload(null)}
        >
          <ImageIcon size={16} />
          <span>Upload from Gallery</span>
        </button>
      </div>

      {/* Photo Preview Grid or Clear Empty State */}
      {photos.length === 0 ? (
        <div 
          className="p-4 rounded-3 border border-2 border-dashed text-center bg-light transition-all"
          style={{ borderColor: 'var(--hc-border)', cursor: 'pointer' }}
          onClick={() => handleInitiateGalleryUpload(null)}
        >
          <div className="rounded-circle bg-white shadow-sm p-3 d-inline-flex align-items-center justify-content-center text-secondary mb-2">
            <Camera size={26} className="text-primary" />
          </div>
          <h6 className="fw-semibold text-dark mb-1 small">No photos attached yet</h6>
          <p className="text-secondary small mb-2" style={{ maxWidth: 360, margin: '0 auto', fontSize: '0.78rem' }}>
            Capture a clear photo of the leak, crack, damage, or equipment label. You can upload up to 5 photos (max 5 MB each).
          </p>
          <div className="d-inline-flex align-items-center gap-2 text-primary small fw-medium">
            <Upload size={14} /> Tap to select files or drag photos here
          </div>
        </div>
      ) : (
        <div className="row g-2.5">
          {photos.map((item, idx) => (
            <div key={item.id} className="col-6 col-sm-4 col-md-3 col-lg-2.4">
              <div 
                className="position-relative rounded-3 overflow-hidden border shadow-sm bg-white hc-photo-card transition-all"
                style={{ height: 160 }}
              >
                {/* Image Thumbnail */}
                <img
                  src={item.previewUrl}
                  alt={item.name || `Problem photo ${idx + 1}`}
                  className="w-100 h-100 object-fit-cover"
                  style={{ objectFit: 'cover' }}
                  onClick={() => setPreviewingPhoto(item)}
                />

                {/* Top Badge: Photo Number & File Size */}
                <div 
                  className="position-absolute top-0 start-0 end-0 p-1.5 d-flex justify-content-between align-items-center"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)' }}
                >
                  <span className="badge bg-dark bg-opacity-75 text-white" style={{ fontSize: '0.68rem' }}>
                    #{idx + 1}
                  </span>
                  <span className="badge bg-dark bg-opacity-75 text-white" style={{ fontSize: '0.68rem' }}>
                    {formatFileSize(item.size)}
                  </span>
                </div>

                {/* Bottom Overlay Actions: Zoom, Replace/Retake, Remove */}
                <div 
                  className="position-absolute bottom-0 start-0 end-0 p-1.5 d-flex justify-content-around align-items-center"
                  style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.85), transparent)' }}
                >
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-white p-1 hover:text-primary"
                    title="View Full Size"
                    onClick={() => setPreviewingPhoto(item)}
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-link text-white p-1"
                    title="Retake or Replace Photo"
                    onClick={() => handleInitiateTakePhoto(item.id)}
                  >
                    <RotateCcw size={15} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-1"
                    title="Remove Photo"
                    onClick={() => handleRemovePhoto(item.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Additional Photo Slot if under limit */}
          {photos.length < maxPhotos && (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2.4">
              <button
                type="button"
                className="w-100 h-100 rounded-3 border border-2 border-dashed bg-light text-secondary d-flex flex-column align-items-center justify-content-center p-3 transition-all"
                style={{ minHeight: 160, borderColor: 'var(--hc-border)' }}
                onClick={() => handleInitiateGalleryUpload(null)}
              >
                <div className="p-2 rounded-circle bg-white shadow-sm text-primary mb-1">
                  <Camera size={18} />
                </div>
                <span className="small fw-medium text-dark" style={{ fontSize: '0.78rem' }}>+ Add More</span>
                <span className="text-secondary" style={{ fontSize: '0.7rem' }}>
                  ({maxPhotos - photos.length} left)
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Live Camera Modal (Desktop / WebRTC) */}
      {isCameraModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(5px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-xl overflow-hidden bg-dark text-white">
              <div className="modal-header border-secondary px-4 py-3 bg-black bg-opacity-40">
                <div className="d-flex align-items-center gap-2">
                  <Camera size={18} className="text-primary" />
                  <h6 className="modal-title fw-bold text-white mb-0">Capture Problem Photo</h6>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={stopCameraStream}></button>
              </div>

              <div className="modal-body p-0 position-relative text-center bg-black" style={{ minHeight: 360 }}>
                {cameraLoading && (
                  <div className="position-absolute top-50 start-50 translate-middle text-white">
                    <div className="spinner-border text-primary mb-2" role="status" />
                    <div className="small">Starting camera sensor...</div>
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-100 h-100"
                  style={{ maxHeight: 480, objectFit: 'contain' }}
                />

                <div 
                  className="position-absolute bottom-0 start-0 end-0 p-3 d-flex justify-content-center gap-3 align-items-center"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
                >
                  <button
                    type="button"
                    className="btn btn-outline-light rounded-pill px-3 py-1.5 small"
                    onClick={stopCameraStream}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary rounded-circle p-3 shadow-lg d-flex align-items-center justify-content-center"
                    style={{ width: 62, height: 62, border: '4px solid rgba(255,255,255,0.4)' }}
                    onClick={handleCaptureFromLiveCamera}
                    title="Take Snapshot"
                  >
                    <Camera size={26} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Preview Modal */}
      {previewingPhoto && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(5px)', zIndex: 1070 }}
          onClick={() => setPreviewingPhoto(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-4 border-0 shadow-xl overflow-hidden bg-white">
              <div className="modal-header border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold text-dark mb-0">{previewingPhoto.name}</h6>
                  <span className="text-secondary small">{formatFileSize(previewingPhoto.size)}</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setPreviewingPhoto(null)}></button>
              </div>
              <div className="modal-body p-2 text-center bg-light">
                <img
                  src={previewingPhoto.previewUrl}
                  alt={previewingPhoto.name}
                  className="img-fluid rounded-2"
                  style={{ maxHeight: 520, objectFit: 'contain' }}
                />
              </div>
              <div className="modal-footer border-top px-4 py-2.5 bg-light d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm px-3 py-1.5 rounded-3" 
                  onClick={() => setPreviewingPhoto(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
