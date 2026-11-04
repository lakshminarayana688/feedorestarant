import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationDocument } from '../../types/restaurant';
import {
  uploadDocumentToStorage,
  uploadMultipleRestaurantPhotos,
  formatUploadTimestamp,
  validateRequiredDocuments,
} from '../../services/documentService';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  X,
  Camera,
  Building,
  ShieldCheck,
  Loader2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

export const DocumentUploadScreen: React.FC = () => {
  const {
    restaurant,
    documents,
    updateDocument,
    submitDocumentsForVerification,
    setScreen,
    showToast,
  } = useApp();

  const [selectedDocForPreview, setSelectedDocForPreview] = useState<VerificationDocument | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [currentTargetDocId, setCurrentTargetDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Camera Capture state for FSSAI Certificate
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Manage live camera media stream reactive lifecycle
  useEffect(() => {
    if (isCameraOpen && !capturedPhotoUrl) {
      let isCancelled = false;

      const launchCamera = async () => {
        setCameraError(null);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (!navigator?.mediaDevices?.getUserMedia) {
          setCameraError('Camera access is not supported by this browser. Please use a modern browser.');
          return;
        }

        try {
          let stream: MediaStream;
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { ideal: cameraFacing },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
              audio: false,
            });
          } catch {
            // Fallback for laptop webcams / systems without facingMode constraint support
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          }

          if (isCancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        } catch (err: any) {
          if (isCancelled) return;
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraError(
              'Camera permission was denied. Please allow camera access in your browser settings to photograph the original FSSAI Certificate.'
            );
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setCameraError(
              'No camera detected on this device. Please connect a webcam or use a mobile device with a camera.'
            );
          } else {
            setCameraError(err.message || 'Unable to access device camera.');
          }
        }
      };

      launchCamera();

      return () => {
        isCancelled = true;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };
    }
  }, [isCameraOpen, cameraFacing, capturedPhotoUrl]);

  const handleOpenCameraCapture = () => {
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    setCameraError(null);
    setIsCameraOpen(true);
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    setCameraError(null);
    setIsCameraOpen(false);
  };

  const handleFlipCamera = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          setCapturedPhotoUrl(dataUrl);
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const handleRetakePhoto = () => {
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
  };

  const handleConfirmPhoto = async () => {
    if (!capturedBlob) return;

    setIsSavingPhoto(true);
    try {
      const file = new File(
        [capturedBlob],
        `fssai_certificate_${Date.now()}.jpg`,
        { type: 'image/jpeg' }
      );

      const result = await uploadDocumentToStorage(
        restaurant.id || 'default',
        'doc-fssai',
        file
      );

      if (!result.success || !result.uploadedItem) {
        showToast(result.error || 'Failed to save FSSAI Certificate photo', 'error');
        setIsSavingPhoto(false);
        return;
      }

      updateDocument('doc-fssai', {
        status: 'UPLOADED',
        fileName: result.uploadedItem.name,
        fileSize: result.uploadedItem.size,
        uploadedAt: formatUploadTimestamp(new Date()),
        previewUrl: result.uploadedItem.url,
        filePath: result.uploadedItem.path,
        mimeType: 'image/jpeg',
      });

      showToast('FSSAI Certificate captured & saved successfully!', 'success');
      handleCloseCamera();
    } catch (err: any) {
      showToast(err?.message || 'Error saving FSSAI Certificate', 'error');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleTriggerUpload = (docId: string) => {
    if (docId === 'doc-fssai') {
      handleOpenCameraCapture();
      return;
    }
    setCurrentTargetDocId(docId);
    if (fileInputRef.current) {
      if (docId === 'doc-photos') {
        fileInputRef.current.accept = '.jpg,.jpeg,.png,image/jpeg,image/png';
        fileInputRef.current.multiple = true;
      } else {
        fileInputRef.current.accept = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
        fileInputRef.current.multiple = false;
      }
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentTargetDocId) return;

    const docId = currentTargetDocId;
    const targetDoc = documents.find((d) => d.id === docId);
    const docName = targetDoc?.name || 'Document';

    setUploadingDocId(docId);

    try {
      if (docId === 'doc-photos') {
        // Multiple Restaurant Photos (Kitchen & Facade)
        const fileList = Array.from(files);
        const result = await uploadMultipleRestaurantPhotos(
          restaurant.id || 'default',
          docId,
          fileList
        );

        if (!result.success || !result.uploadedItems || result.uploadedItems.length === 0) {
          showToast(result.error || 'Failed to upload restaurant photos', 'error');
          setUploadingDocId(null);
          return;
        }

        const totalSizeBytes = fileList.reduce((acc, f) => acc + f.size, 0);
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(totalSizeBytes) / Math.log(k));
        const formattedTotalSize = `${parseFloat((totalSizeBytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;

        const fileNamesDisplay =
          result.uploadedItems.length > 1
            ? `${result.uploadedItems.length} Photos (Kitchen & Facade)`
            : result.uploadedItems[0].name;

        updateDocument(docId, {
          status: 'UPLOADED',
          fileName: fileNamesDisplay,
          fileSize: formattedTotalSize,
          uploadedAt: formatUploadTimestamp(new Date()),
          previewUrl: result.uploadedItems[0].url,
          filePath: result.uploadedItems[0].path,
          mimeType: result.uploadedItems[0].mimeType,
          files: result.uploadedItems,
        });

        showToast(`${docName} uploaded successfully to secure storage!`, 'success');
      } else {
        // Single Document Upload
        const file = files[0];
        const result = await uploadDocumentToStorage(
          restaurant.id || 'default',
          docId,
          file
        );

        if (!result.success || !result.uploadedItem) {
          showToast(result.error || `Failed to upload ${docName}`, 'error');
          setUploadingDocId(null);
          return;
        }

        updateDocument(docId, {
          status: 'UPLOADED',
          fileName: result.uploadedItem.name,
          fileSize: result.uploadedItem.size,
          uploadedAt: formatUploadTimestamp(new Date()),
          previewUrl: result.uploadedItem.url,
          filePath: result.uploadedItem.path,
          mimeType: result.uploadedItem.mimeType,
        });

        showToast(`${docName} uploaded successfully to secure storage!`, 'success');
      }
    } catch (err: any) {
      showToast(err?.message || `Error uploading ${docName}`, 'error');
    } finally {
      setUploadingDocId(null);
      setCurrentTargetDocId(null);
    }
  };

  const handleOpenPreview = (doc: VerificationDocument) => {
    setActivePhotoIndex(0);
    setSelectedDocForPreview(doc);
  };

  const handleSubmit = async () => {
    const { isValid, missingNames } = validateRequiredDocuments(documents);
    if (!isValid) {
      showToast(`Please upload all required compliance documents: ${missingNames.join(', ')}`, 'error');
      return;
    }
    await submitDocumentsForVerification();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      {/* Hidden Device File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
          <div>
            <button
              onClick={() => setScreen('register')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Details</span>
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Restaurant Verification</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload statutory and business compliance documents for FEEDO onboarding approval.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted & Safe</span>
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="space-y-4 mb-8">
          {documents.map((doc) => {
            const isUploaded = doc.status !== 'NOT_UPLOADED';
            const isCurrentUploading = uploadingDocId === doc.id;

            return (
              <div
                key={doc.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isUploaded
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-xl shrink-0 ${
                        isUploaded
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                        {doc.isRequired ? (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-200 text-slate-600 font-medium px-1.5 py-0.2 rounded">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>
                      {doc.fileName && (
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                          ✓ {doc.fileName} ({doc.fileSize}) • {doc.uploadedAt}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isUploaded ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(doc)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          disabled={isCurrentUploading}
                          onClick={() => {
                            if (doc.id === 'doc-fssai') {
                              handleOpenCameraCapture();
                            } else {
                              handleTriggerUpload(doc.id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          {isCurrentUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-feedo-600" />
                              <span>Uploading...</span>
                            </>
                          ) : doc.id === 'doc-fssai' ? (
                            <>
                              <Camera className="w-3.5 h-3.5" />
                              <span>Retake</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Replace</span>
                            </>
                          )}
                        </button>
                        <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 rounded-full border border-emerald-300">
                          ✓ Uploaded
                        </span>
                      </>
                    ) : doc.id === 'doc-fssai' ? (
                      <button
                        type="button"
                        disabled={isCurrentUploading}
                        onClick={handleOpenCameraCapture}
                        className="px-4 py-2 text-xs font-bold text-white bg-feedo-500 hover:bg-feedo-600 rounded-xl flex items-center gap-1.5 shadow-md shadow-feedo-500/20 transition-all cursor-pointer"
                      >
                        {isCurrentUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-3.5 h-3.5" />
                            <span>Capture Photo</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isCurrentUploading}
                        onClick={() => handleTriggerUpload(doc.id)}
                        className="px-4 py-2 text-xs font-bold text-white bg-feedo-500 hover:bg-feedo-600 rounded-xl flex items-center gap-1.5 shadow-md shadow-feedo-500/20 transition-all cursor-pointer"
                      >
                        {isCurrentUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload File</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            FEEDO verifies documents within 24-48 hours.
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            className="py-3.5 px-8 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-feedo-500/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Submit for Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Genuine Document Preview Modal */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedDocForPreview(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 pr-8">
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {selectedDocForPreview.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedDocForPreview.fileName} • {selectedDocForPreview.fileSize} • {selectedDocForPreview.uploadedAt}
              </p>
            </div>

            {/* Document Content View */}
            <div className="flex-1 overflow-y-auto bg-slate-100 rounded-2xl border border-slate-200 p-3 sm:p-4 flex flex-col items-center justify-center min-h-[280px]">
              {selectedDocForPreview.files && selectedDocForPreview.files.length > 1 ? (
                /* Multiple Photos View */
                <div className="w-full space-y-3">
                  <div className="flex gap-2 border-b border-slate-200 pb-2">
                    {selectedDocForPreview.files.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activePhotoIndex === idx
                            ? 'bg-feedo-500 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {photo.label || `Photo ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col items-center">
                    <img
                      src={selectedDocForPreview.files[activePhotoIndex]?.url || selectedDocForPreview.previewUrl}
                      alt={selectedDocForPreview.files[activePhotoIndex]?.name || 'Photo'}
                      className="max-h-[320px] w-auto max-w-full object-contain rounded-xl shadow-xs"
                    />
                    <p className="text-[11px] text-slate-500 mt-2 font-medium">
                      {selectedDocForPreview.files[activePhotoIndex]?.name} ({selectedDocForPreview.files[activePhotoIndex]?.size})
                    </p>
                  </div>
                </div>
              ) : selectedDocForPreview.fileName?.toLowerCase().endsWith('.pdf') ||
                selectedDocForPreview.mimeType === 'application/pdf' ? (
                /* PDF Document View */
                <div className="w-full flex flex-col items-center h-full">
                  {selectedDocForPreview.previewUrl ? (
                    <iframe
                      src={selectedDocForPreview.previewUrl}
                      title={selectedDocForPreview.name}
                      className="w-full h-[320px] rounded-xl border border-slate-200 bg-white"
                    />
                  ) : (
                    <div className="p-8 text-center text-slate-500">
                      <FileText className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">PDF Document Ready</p>
                    </div>
                  )}
                  {selectedDocForPreview.previewUrl && (
                    <a
                      href={selectedDocForPreview.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 text-xs font-bold text-feedo-600 hover:text-feedo-700 flex items-center gap-1 hover:underline"
                    >
                      <span>Open Full PDF in New Tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : (
                /* Single Image View */
                <div className="flex flex-col items-center">
                  <img
                    src={selectedDocForPreview.previewUrl}
                    alt={selectedDocForPreview.name}
                    className="max-h-[340px] w-auto max-w-full object-contain rounded-xl shadow-xs"
                  />
                  {selectedDocForPreview.previewUrl && (
                    <a
                      href={selectedDocForPreview.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-xs font-bold text-feedo-600 hover:text-feedo-700 flex items-center gap-1 hover:underline"
                    >
                      <span>View Full Resolution</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Encrypted Vault • restaurant-documents</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedDocForPreview(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Capture Modal for FSSAI Certificate */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-feedo-50 text-feedo-600 rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {capturedPhotoUrl ? 'Review FSSAI Photo' : 'Capture FSSAI Certificate'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {capturedPhotoUrl
                      ? 'Confirm that license number and details are clearly readable'
                      : 'Take a clear live photo of the original FSSAI Certificate'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!capturedPhotoUrl && !cameraError && (
                  <button
                    type="button"
                    onClick={handleFlipCamera}
                    title="Switch Camera (Front/Rear)"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Close Camera"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Viewport / Photo Preview */}
            <div className="relative bg-slate-950 flex-1 min-h-[340px] sm:min-h-[400px] flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center text-white max-w-sm">
                  <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-200 font-semibold mb-4">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraError(null);
                      setCapturedPhotoUrl(null);
                    }}
                    className="px-4 py-2 bg-feedo-500 hover:bg-feedo-600 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              ) : capturedPhotoUrl ? (
                <div className="relative w-full h-full p-3 flex items-center justify-center bg-slate-950">
                  <img
                    src={capturedPhotoUrl}
                    alt="Captured FSSAI Certificate Preview"
                    className="max-h-[380px] w-auto max-w-full rounded-2xl object-contain border border-slate-800 shadow-xl"
                  />
                  <div className="absolute top-5 left-5 bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Photo Captured</span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover min-h-[340px]"
                  />
                  {/* Document Framing Guide */}
                  <div className="absolute inset-4 sm:inset-6 pointer-events-none border-2 border-dashed border-feedo-400/80 rounded-2xl flex flex-col justify-between p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-feedo-300 bg-slate-950/70 px-2 py-0.5 rounded self-start">
                      Align Original FSSAI Certificate Here
                    </span>
                    <span className="text-[10px] text-white/80 bg-slate-950/70 px-2 py-0.5 rounded self-center text-center">
                      Ensure 14-digit license number & details are in focus
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-100">
              {capturedPhotoUrl ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRetakePhoto}
                    disabled={isSavingPhoto}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPhoto}
                    disabled={isSavingPhoto}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Photo...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Photo</span>
                      </>
                    )}
                  </button>
                </div>
              ) : !cameraError ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="w-14 h-14 rounded-full bg-feedo-500 hover:bg-feedo-600 text-slate-950 flex items-center justify-center shadow-lg shadow-feedo-500/30 border-4 border-slate-100 transition-transform active:scale-95 cursor-pointer"
                    title="Take Photo"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-950" />
                  </button>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Tap to take live photo
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
