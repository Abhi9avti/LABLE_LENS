/**
 * METRISCAN - Real Device Camera Scanner Component
 * Uses navigator.mediaDevices.getUserMedia with real canvas frame capture.
 * Supports torch/flash, front/back camera switching, and fallback photo upload.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  FlipHorizontal,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Upload,
  X,
  Zap,
  ZapOff,
} from 'lucide-react';
import { SAMPLE_PACKAGED_PRODUCTS } from '../data/seedData';

interface RealCameraScannerProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
  instructionText?: string;
  continuousMode?: boolean;
  scanCountText?: string;
  isProcessing?: boolean;
}

export const RealCameraScanner: React.FC<RealCameraScannerProps> = ({
  onCapture,
  onClose,
  instructionText = 'Place the product label inside the frame.',
  continuousMode = false,
  scanCountText,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [capturedFlash, setCapturedFlash] = useState<boolean>(false);

  // Initialize Camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let isMounted = true;

    async function startCamera() {
      setCameraLoading(true);
      setCameraError(null);

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera device API is not supported on this browser or platform.');
        }

        let mediaStream: MediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        } catch {
          // Fallback to generic video constraints if specific facingMode fails
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (!isMounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }

        // Check if torch/flash is supported on video track
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = (videoTrack.getCapabilities && (videoTrack.getCapabilities() as any)) || {};
          if (capabilities.torch) {
            setTorchSupported(true);
          }
        }

        setCameraLoading(false);
      } catch (err: any) {
        if (isMounted) {
          console.warn('Real camera access error:', err);
          setCameraError(
            err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
              ? 'Camera permission was denied. Please allow camera access in your browser settings, or upload a package photo instead.'
              : 'Camera access is not available on this device. You can upload a photo instead.'
          );
          setCameraLoading(false);
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Toggle Torch/Flash
  const toggleTorch = async () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      try {
        const nextTorch = !torchOn;
        await (videoTrack.applyConstraints as any)({
          advanced: [{ torch: nextTorch }],
        });
        setTorchOn(nextTorch);
      } catch (e) {
        console.warn('Torch failed:', e);
      }
    }
  };

  // Switch between front and back camera
  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture real frame from video onto canvas
  const handleCapture = () => {
    if (!videoRef.current || isProcessing) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Flash animation effect
    setCapturedFlash(true);
    setTimeout(() => setCapturedFlash(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    onCapture(dataUrl);
  };

  // Handle manual file upload from input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCapture(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle picking a test sample if no physical item is available
  const handlePickSample = (sampleImage: string) => {
    onCapture(sampleImage);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none">
      {/* Hidden canvas for snapshotting */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Bar */}
      <div className="relative z-10 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wide">METRISCAN LIVE SCANNER</span>
          {scanCountText && (
            <span className="ml-2 text-[11px] bg-white/20 px-2 py-0.5 rounded-full text-white font-medium">
              {scanCountText}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {torchSupported && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-full transition-colors ${
                torchOn ? 'bg-amber-400 text-slate-950' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Toggle Flash"
            >
              {torchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={switchCamera}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            title="Switch Camera"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            title="Close Camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Camera Viewport / Error State */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Shutter flash overlay */}
        {capturedFlash && <div className="absolute inset-0 z-30 bg-white opacity-80 transition-opacity" />}

        {cameraLoading && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-slate-950">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p className="text-xs font-medium text-slate-300">Starting device camera...</p>
          </div>
        )}

        {cameraError ? (
          <div className="p-6 max-w-md mx-auto text-center text-white z-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base">Camera Notice</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Photo Instead
              </button>
            </div>

            {/* Quick test sample selector */}
            <div className="pt-4 border-t border-white/10 text-left">
              <span className="text-[11px] text-slate-400 block mb-2 font-medium text-center">
                Or test with a sample packaged commodity:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_PACKAGED_PRODUCTS.slice(0, 4).map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handlePickSample(sample.sampleResult.image)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-left text-xs transition-colors border border-white/10"
                  >
                    <span className="font-semibold block truncate text-slate-200">
                      {sample.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {sample.complianceState === 'COMPLIANT' ? '✓ Compliant' : '⚠ Issue detected'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Framing Guide Overlay */}
            <div className="relative z-10 w-[84%] max-w-[360px] aspect-[3/4] border-2 border-white/70 rounded-2xl flex flex-col justify-between p-4 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              {/* Corner Accents */}
              <div className="flex justify-between">
                <span className="w-5 h-5 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl"></span>
                <span className="w-5 h-5 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr"></span>
              </div>

              {/* Processing feedback or instruction */}
              <div className="text-center py-2">
                {isProcessing ? (
                  <div className="inline-flex items-center gap-2 bg-blue-600/90 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing package...</span>
                  </div>
                ) : (
                  <span className="inline-block bg-black/60 backdrop-blur-md text-white/90 text-xs px-3 py-1 rounded-full border border-white/20">
                    {instructionText}
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="w-5 h-5 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl"></span>
                <span className="w-5 h-5 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br"></span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 px-6 py-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex items-center justify-around">
        {/* Upload Fallback / Alternate Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
          title="Upload from library"
        >
          <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium">Upload</span>
        </button>

        {/* Large Shutter Button */}
        <button
          onClick={handleCapture}
          disabled={cameraLoading || !!cameraError || isProcessing}
          className="relative group disabled:opacity-40 transition-transform active:scale-95"
          title="Capture Photo"
        >
          <div className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1">
            <div className="w-full h-full rounded-full bg-white group-hover:bg-slate-200 transition-colors flex items-center justify-center">
              {isProcessing ? (
                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-blue-600" />
              )}
            </div>
          </div>
        </button>

        {/* Sample / Test helper */}
        <button
          onClick={() => {
            // Pick next test sample in rotation for quick demonstration
            const randomSample = SAMPLE_PACKAGED_PRODUCTS[Math.floor(Math.random() * SAMPLE_PACKAGED_PRODUCTS.length)];
            handlePickSample(randomSample.sampleResult.image);
          }}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
          title="Quick Test Sample"
        >
          <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
            <RefreshCw className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium">Sample</span>
        </button>
      </div>
    </div>
  );
};
