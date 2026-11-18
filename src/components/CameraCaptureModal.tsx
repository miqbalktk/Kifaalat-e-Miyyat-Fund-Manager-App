import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, CheckCircle2, AlertCircle, Upload } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  language: string;
  onClose: () => void;
  onCapture: (dataUrl: string, file: File) => void;
  onFallbackFilePick?: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  language,
  onClose,
  onCapture,
  onFallbackFilePick
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    stopStream();
    setErrorMsg(null);
    setCapturedUrl(null);
    setCapturedFile(null);
    setIsStarting(true);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsStarting(false);
      setErrorMsg(
        language === 'ur'
          ? 'اس براؤزر یا ڈیوائس میں براہِ راست کیمرہ دستیاب نہیں ہے۔ براہ کرم نیچے موجود متبادل بٹن استعمال کریں۔'
          : 'Live camera access is not supported in this browser context. Please use the device camera picker below.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      // Retry without facingMode constraint (useful for laptops or single-camera devices)
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err2: any) {
        setErrorMsg(
          language === 'ur'
            ? 'کیمرہ کی اجازت نہیں ملی یا کیمرہ منسلک نہیں ہے۔ براہ کرم کیمرہ کی اجازت دیں یا نیچے سے فائل/کیمرہ منتخب کریں۔'
            : `Unable to access camera (${err2?.message || 'Permission denied'}). Please allow camera permission or use file picker below.`
        );
      }
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/png');
    canvas.toBlob((blob) => {
      if (blob) {
        const fileName = `kmf-receipt-camera-${Date.now()}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        setCapturedFile(file);
        setCapturedUrl(dataUrl);
      }
    }, 'image/png');
  };

  const handleConfirm = () => {
    if (capturedUrl && capturedFile) {
      stopStream();
      onCapture(capturedUrl, capturedFile);
      onClose();
    }
  };

  const handleToggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopStream();
          onClose();
        }
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#004d30] text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm font-urdu">
              {language === 'ur' ? 'رسید کی تصویر کھینچیں (براہ راست کیمرہ)' : 'Take Receipt Photo (Live Camera)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="p-4 space-y-4">
          <canvas ref={canvasRef} className="hidden" />

          {errorMsg ? (
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-xs font-medium text-rose-800 dark:text-rose-200 leading-relaxed">
                {errorMsg}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 rounded-xl bg-[#004d30] text-white text-xs font-bold cursor-pointer"
                >
                  {language === 'ur' ? 'کیمرہ دوبارہ چلائیں' : 'Retry Camera'}
                </button>
                {onFallbackFilePick && (
                  <button
                    type="button"
                    onClick={() => {
                      stopStream();
                      onClose();
                      onFallbackFilePick();
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'ur' ? 'ڈیوائس سے تصویر منتخب کریں' : 'Choose Image File'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : capturedUrl ? (
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black flex items-center justify-center max-h-80">
                <img src={capturedUrl} alt="Captured receipt" className="max-h-80 object-contain" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCapturedUrl(null);
                    setCapturedFile(null);
                    startCamera(facingMode);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  {language === 'ur' ? 'دوبارہ تصویر لیں' : 'Retake Photo'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'ur' ? 'یہ تصویر منسلک کریں' : 'Attach This Photo'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border border-slate-300 dark:border-slate-700">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isStarting && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                    {language === 'ur' ? 'کیمرہ کھل رہا ہے...' : 'Starting camera...'}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{language === 'ur' ? 'کیمرہ بدلیں' : 'Switch Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTakePhoto}
                  disabled={isStarting}
                  className="flex-1 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Camera className="w-4 h-4" />
                  <span>{language === 'ur' ? 'تصویر کھینچیں (Capture)' : 'Capture Receipt Photo'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
