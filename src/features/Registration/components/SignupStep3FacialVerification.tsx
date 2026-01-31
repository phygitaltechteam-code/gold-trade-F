// components/SignupStep3FacialVerification.tsx
import type { FC } from 'react';
import { useRef, useState, useEffect } from 'react';

interface SignupStep3FacialVerificationProps {
  onComplete: (image: File | null) => void;
  onBack: () => void;
}

const SignupStep3FacialVerification: FC<SignupStep3FacialVerificationProps> = ({ onComplete, onBack }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();
    
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      setCameraError(null);
      
      // Check if browser supports mediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setIsCameraInitialized(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError(
        error instanceof Error 
          ? error.message 
          : 'Unable to access camera. Please check permissions.'
      );
      setCameraActive(false);
      setIsCameraInitialized(true);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setIsCapturing(true);

    // Convert canvas to blob and then to File
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a File object from the blob
        const file = new File([blob], 'face-verification.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        // Simulate processing delay
        setTimeout(() => {
          setCapturedImage(file);
          setIsCapturing(false);
        }, 1000);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsCapturing(true);
      
      // Stop camera if active
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        setCameraActive(false);
      }

      // Simulate processing delay
      setTimeout(() => {
        setCapturedImage(file);
        setIsCapturing(false);
      }, 1000);
    }
  };

  const handleContinueWithoutPhoto = () => {
    // Stop camera if active
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onComplete(null);
  };

  const handleUseCamera = () => {
    if (!cameraActive) {
      initializeCamera();
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    if (!cameraActive) {
      initializeCamera();
    }
  };

  const handleComplete = () => {
    if (capturedImage) {
      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      onComplete(capturedImage);
    }
  };

  const handleUploadPhoto = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 antialiased font-['Inter'] selection:bg-[#F57F3D]/30">
      <div className="w-full max-w-[390px] mx-auto min-h-[844px] bg-[#f8f6f5] dark:bg-[#221610] overflow-hidden relative">
        
        {/* Hidden file input for photo upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Hidden canvas for capturing photos */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-80 -right-80 size-[600px] rounded-full bg-gradient-to-br from-[#F57F3D]/5 to-transparent blur-3xl" />
          <div className="absolute -bottom-80 -left-80 size-[600px] rounded-full bg-gradient-to-tr from-[#F57F3D]/5 to-transparent blur-3xl" />
        </div>

        {/* Sticky header */}
        <div className="flex items-center p-4 pb-2 justify-between bg-[#f8f6f5]/90 dark:bg-[#221610]/90 sticky top-0 z-20 backdrop-blur-sm">
          <button 
            onClick={onBack}
            className="text-[#0d131c] dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h2 className="text-[#0d131c] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Verify Identity
          </h2>
        </div>

        {/* Progress bar */}
        <div className="flex w-full flex-col items-center justify-center gap-2 py-4 px-6 relative z-10">
          <div className="flex w-full flex-row items-center justify-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#F57F3D]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#F57F3D]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#F57F3D]" />
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Step 3 of 3 • Facial Verification</p>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto pb-32 px-6 pt-2">
          <div className="text-center">
            <h2 className="text-[#0d131c] dark:text-white tracking-tight text-[28px] font-bold leading-tight pb-3">
              Facial Verification
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base font-normal leading-normal pb-6">
              Position your face in the oval and take a photo. This helps prevent fraud and keep your account secure.
            </p>
          </div>

          {/* Facial capture area */}
          <div className="mb-10 flex flex-col items-center justify-center">
            <div className="relative mx-auto h-[320px] w-[260px]">
              {/* Camera overlay frame */}
              <div className={`absolute inset-0 rounded-[40%] border-4 border-[#F57F3D] ${isCapturing ? 'animate-pulse' : ''} opacity-70 z-20 pointer-events-none`} />
              
              {/* Camera display or captured image */}
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[40%] border-4 border-[#F57F3D] bg-slate-50 shadow-xl dark:bg-slate-900">
                {capturedImage ? (
                  <div className="flex flex-col items-center justify-center p-4 w-full h-full">
                    <img 
                      src={URL.createObjectURL(capturedImage)} 
                      alt="Captured face" 
                      className="w-full h-full object-cover rounded-[40%]"
                    />
                    <div className="absolute top-6 rounded-full bg-black/50 px-4 py-1.5 backdrop-blur-md">
                      <p className="text-sm font-medium text-white">Captured</p>
                    </div>
                  </div>
                ) : cameraError ? (
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="material-symbols-outlined text-6xl text-amber-500 mb-4">
                      camera_off
                    </span>
                    <p className="text-center text-amber-600 font-medium mb-2">Camera Error</p>
                    <p className="text-center text-sm text-slate-600 dark:text-slate-300 px-4">
                      {cameraError}
                    </p>
                    <button
                      onClick={initializeCamera}
                      className="mt-4 px-4 py-2 bg-[#F57F3D] text-white rounded-lg font-medium hover:bg-[#e06c2e] transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : !isCameraInitialized ? (
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F57F3D]"></div>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">Initializing camera...</p>
                  </div>
                ) : cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover rounded-[40%] transform scale-x(-1)" // Mirror for selfie view
                    />
                    <div className="absolute top-6 rounded-full bg-black/50 px-4 py-1.5 backdrop-blur-md">
                      <p className="text-sm font-medium text-white">
                        {isCapturing ? 'Processing...' : 'Looking Good'}
                      </p>
                    </div>
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <p className="text-sm font-medium text-white drop-shadow-md">
                        Position your face in the frame
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
                      camera_alt
                    </span>
                    <p className="text-center text-slate-600 dark:text-slate-300 mb-4">
                      Camera is not active
                    </p>
                    <button
                      onClick={handleUseCamera}
                      className="px-4 py-2 bg-[#F57F3D] text-white rounded-lg font-medium hover:bg-[#e06c2e] transition-colors"
                    >
                      Use Camera
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Status message */}
            {isCapturing ? (
              <p className="mt-6 animate-pulse text-base font-semibold text-[#F57F3D]">
                Verifying identity...
              </p>
            ) : capturedImage ? (
              <p className="mt-6 text-base font-semibold text-green-600">
                ✓ Photo captured successfully!
              </p>
            ) : cameraError ? (
              <p className="mt-6 text-base font-semibold text-amber-600">
                Camera access required for auto-verification
              </p>
            ) : (
              <p className="mt-6 text-base font-semibold text-slate-600">
                Ready to capture
              </p>
            )}
          </div>

          {/* Action buttons for capture/retake/upload */}
          <div className="flex flex-col gap-4 mb-8">
            {capturedImage ? (
              <div className="flex gap-3">
                <button
                  onClick={handleRetakePhoto}
                  className="flex-1 h-14 rounded-xl font-semibold text-base border-2 border-[#F57F3D] text-[#F57F3D] hover:bg-[#F57F3D]/10 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">replay</span>
                  Retake Photo
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 h-14 rounded-xl font-semibold text-base bg-[#F57F3D] hover:bg-[#e06c2e] text-white shadow-[#F57F3D]/20 transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleUploadPhoto}
                  disabled={isCapturing}
                  className={`flex-1 h-14 rounded-xl font-semibold text-base border-2 border-[#F57F3D] text-[#F57F3D] transition-colors flex items-center justify-center gap-2 ${
                    isCapturing
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[#F57F3D]/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">upload</span>
                  Upload Photo
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={isCapturing || !cameraActive}
                  className={`flex-1 h-14 rounded-xl font-semibold text-base bg-[#F57F3D] text-white shadow-[#F57F3D]/20 transition-colors flex items-center justify-center gap-2 ${
                    isCapturing || !cameraActive
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[#e06c2e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">camera_alt</span>
                  {isCapturing ? 'Processing...' : 'Capture'}
                </button>
              </div>
            )}
          </div>

          {/* Continue without photo option */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-center text-slate-600 dark:text-slate-400 mb-4">
              Having trouble with the camera?
            </p>
            <button
              onClick={handleContinueWithoutPhoto}
              className="w-full h-14 rounded-xl font-semibold text-base border-2 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              Continue Without Photo
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">(Optional)</span>
            </button>
            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              You can complete verification later in your account settings
            </p>
          </div>

          {/* Tips */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-[#F57F3D] text-2xl mb-2">
                light_mode
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Good Lighting</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Face a light source</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-[#F57F3D] text-2xl mb-2">
                face
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Neutral Face</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">No glasses or hats</p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            This is a secure, one-time check. Your biometric data is encrypted and never stored as an image.
          </p>
        </div>

        {/* Fixed bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto p-6 bg-white/80 dark:bg-[#221610]/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-20">
          <div className="flex flex-col gap-4 items-center">
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="material-symbols-outlined text-green-600 text-[18px]">verified_user</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Bank-grade encryption • AI liveness detection
              </span>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2">
              <div className={`h-2 w-2 rounded-full ${cameraActive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {cameraActive ? 'Camera active' : 'Camera not active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupStep3FacialVerification;