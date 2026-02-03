// components/SignupStep3FacialVerification.tsx
import type {FC} from 'react';
import {useState, useRef, useCallback} from 'react';
import Webcam from 'react-webcam';

interface SignupStep3FacialVerificationProps {
  onComplete: (image: File | null) => void;
  onBack: () => void;
}

const SignupStep3FacialVerification: FC<SignupStep3FacialVerificationProps> = ({
  onComplete,
  onBack,
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const videoConstraints = {
    facingMode: 'user',
    width: {ideal: 1280},
    height: {ideal: 720},
  };

  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return;

    setIsCapturing(true);

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setIsCapturing(false);
      return;
    }

    // data:image/jpeg;base64,... → Blob → File
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        if (blob.size === 0) throw new Error('Empty image');
        const file = new File([blob], 'face-verification.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        // Simulate processing delay (same as original)
        setTimeout(() => {
          setCapturedImage(file);
          setIsCapturing(false);
        }, 1000);
      })
      .catch((err) => {
        console.error('Capture failed:', err);
        setIsCapturing(false);
      });
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsCapturing(true);
      // No need to stop webcam stream manually — react-webcam handles cleanup
      setTimeout(() => {
        setCapturedImage(file);
        setIsCapturing(false);
      }, 1000);
    }
  };

  const handleContinueWithoutPhoto = () => {
    onComplete(null);
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
  };

  const handleComplete = () => {
    if (capturedImage) {
      onComplete(capturedImage);
    }
  };

  const handleUploadPhoto = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 flex min-h-screen w-full items-center justify-center p-4 font-['Inter'] antialiased selection:bg-[#F57F3D]/30">
      <div className="relative mx-auto min-h-[844px] w-full max-w-[390px] overflow-hidden bg-[#f8f6f5] dark:bg-[#221610]">
        {/* Hidden file input for photo upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Background elements – unchanged */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-80 -top-80 size-[600px] rounded-full bg-gradient-to-br from-[#F57F3D]/5 to-transparent blur-3xl" />
          <div className="absolute -bottom-80 -left-80 size-[600px] rounded-full bg-gradient-to-tr from-[#F57F3D]/5 to-transparent blur-3xl" />
        </div>

        {/* Sticky header – unchanged */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-[#f8f6f5]/90 p-4 pb-2 backdrop-blur-sm dark:bg-[#221610]/90">
          <button
            onClick={onBack}
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-[#0d131c] transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
          <h2 className="flex-1 pr-12 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-[#0d131c] dark:text-white">
            Verify Identity
          </h2>
        </div>

        {/* Progress bar – unchanged */}
        <div className="relative z-10 flex w-full flex-col items-center justify-center gap-2 px-6 py-4">
          <div className="flex w-full flex-row items-center justify-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#F57F3D]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#F57F3D]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#F57F3D]" />
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Step 3 of 3 • Facial Verification
          </p>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-6 pb-32 pt-2">
          <div className="text-center">
            <h2 className="pb-3 text-[28px] font-bold leading-tight tracking-tight text-[#0d131c] dark:text-white">
              Facial Verification
            </h2>
            <p className="pb-6 text-base font-normal leading-normal text-slate-600 dark:text-slate-300">
              Position your face in the oval and take a photo. This helps
              prevent fraud and keep your account secure.
            </p>
          </div>

          {/* Facial capture area – almost identical structure */}
          <div className="mb-10 flex flex-col items-center justify-center">
            <div className="relative mx-auto h-[340px] w-[280px]">
              {/* Camera overlay frame – pulse during capture */}
              <div
                className={`absolute inset-0 rounded-[40%] border-2 border-[#F57F3D] ${
                  isCapturing ? 'animate-pulse' : ''
                } pointer-events-none z-20 opacity-70`}
              />

              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[40%] border-4 border-[#F57F3D] bg-slate-50 shadow-xl dark:bg-slate-900">
                {capturedImage ? (
                  <div className="flex h-full w-full flex-col items-center justify-center p-4">
                    <img
                      src={URL.createObjectURL(capturedImage)}
                      alt="Captured face"
                      className="h-full w-full rounded-[40%] object-cover"
                    />
                    <div className="absolute top-6 rounded-full bg-black/50 px-4 py-1.5 backdrop-blur-md">
                      <p className="text-sm font-medium text-white">Captured</p>
                    </div>
                  </div>
                ) : cameraError ? (
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="material-symbols-outlined mb-4 text-6xl text-amber-500">
                      camera_off
                    </span>
                    <p className="mb-2 text-center font-medium text-amber-600">
                      Camera Error
                    </p>
                    <p className="px-4 text-center text-sm text-slate-600 dark:text-slate-300">
                      {cameraError}
                    </p>
                    <button
                      onClick={() => setCameraError(null)} // retry resets error → webcam remounts
                      className="mt-4 rounded-lg bg-[#F57F3D] px-4 py-2 font-medium text-white transition-colors hover:bg-[#e06c2e]"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      mirrored={true} // built-in mirroring (replaces your scale-x(-1))
                      className="h-full w-full rounded-[40%] object-cover"
                      onUserMediaError={(err: MediaError) => {
                        setCameraError(
                          err.message ||
                            'Unable to access camera. Please check permissions and ensure a secure (HTTPS) connection.',
                        );
                        setCameraActive(false);
                      }}
                      onUserMedia={() => {
                        setCameraActive(true);
                        setCameraError(null);
                      }}
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
                )}
              </div>
            </div>

            {/* Status message – same logic */}
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

          {/* Action buttons – same layout & styles */}
          <div className="mb-8 flex flex-col gap-4">
            {capturedImage ? (
              <div className="flex gap-3">
                <button
                  onClick={handleRetakePhoto}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#F57F3D] text-base font-semibold text-[#F57F3D] transition-colors hover:bg-[#F57F3D]/10"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    replay
                  </span>
                  Retake Photo
                </button>
                <button
                  onClick={handleComplete}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#F57F3D] text-base font-semibold text-white shadow-[#F57F3D]/20 transition-colors hover:bg-[#e06c2e]"
                >
                  Continue
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleUploadPhoto}
                  disabled={isCapturing}
                  className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#F57F3D] text-base font-semibold text-[#F57F3D] transition-colors ${
                    isCapturing
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-[#F57F3D]/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    upload
                  </span>
                  Upload Photo
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={isCapturing || !!cameraError || !cameraActive}
                  className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#F57F3D] text-base font-semibold text-white shadow-[#F57F3D]/20 transition-colors ${
                    isCapturing || !!cameraError || !cameraActive
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-[#e06c2e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    camera_alt
                  </span>
                  {isCapturing ? 'Processing...' : 'Capture'}
                </button>
              </div>
            )}
          </div>

          {/* Continue without photo – unchanged */}
          <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-800">
            <p className="mb-4 text-center text-slate-600 dark:text-slate-400">
              Having trouble with the camera?
            </p>
            <button
              onClick={handleContinueWithoutPhoto}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-300 text-base font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/50"
            >
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
              Continue Without Photo
              <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                (Optional)
              </span>
            </button>
            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              You can complete verification later in your account settings
            </p>
          </div>

          {/* Tips – unchanged */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white/80 p-4 text-center backdrop-blur-sm dark:border-slate-800 dark:bg-slate-800/50">
              <span className="material-symbols-outlined mb-2 text-2xl text-[#F57F3D]">
                light_mode
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Good Lighting
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Face a light source
              </p>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white/80 p-4 text-center backdrop-blur-sm dark:border-slate-800 dark:bg-slate-800/50">
              <span className="material-symbols-outlined mb-2 text-2xl text-[#F57F3D]">
                face
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Neutral Face
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                No glasses or hats
              </p>
            </div>
          </div>
        </div>

        {/* Fixed bottom bar – adapted camera status */}
        <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-[390px] border-t border-slate-100 bg-white/80 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#221610]/80">
          <div className="flex flex-col items-center gap-4">
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${cameraActive ? 'animate-pulse bg-green-500' : 'bg-amber-500'}`}
              />
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
