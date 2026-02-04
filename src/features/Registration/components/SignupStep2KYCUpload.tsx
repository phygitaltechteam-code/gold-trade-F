import {useState, type FC} from 'react';

type KYCPassportData = {
  type: 'Passport';
  number: string;
  file: File | null;
};

interface SignupStep2KYCUploadProps {
  initialData: KYCPassportData;
  onComplete: (data: KYCPassportData) => void;
  onBack: () => void;
}

const SignupStep2KYCUpload: FC<SignupStep2KYCUploadProps> = ({
  initialData,
  onComplete,
  onBack,
}) => {
  const [docNumber, setDocNumber] = useState(initialData.number);
  const [file, setFile] = useState<File | null>(initialData.file);

  const handleSubmit = () => {
    onComplete({
      type: 'Passport',
      number: docNumber,
      file,
    });
  };

  const isFormValid = () => docNumber.trim().length > 0 && file !== null;

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="bg-white dark:bg-gray-950 flex min-h-screen w-full items-center justify-center font-['Inter'] antialiased md:p-6">
      {/* Main container */}
      <div className="relative mx-auto w-full max-w-[min(390px,95vw,500px)] overflow-hidden bg-white rounded-2xl dark:bg-[#221610] md:max-w-[700px] md:min-h-[600px]">
        
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white p-4 dark:bg-[#221610] md:p-6">
          <button
            onClick={onBack}
            className="flex size-12 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 md:size-14"
          >
            <span className="material-symbols-outlined text-2xl md:text-[26px]">
              arrow_back
            </span>
          </button>
          <h2 className="flex-1 pr-12 text-center text-lg font-bold dark:text-white md:text-xl">
            Verify Identity
          </h2>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 text-center md:px-8 md:py-6">
          <div className="flex gap-2 md:gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-slate-300" />
            <div className="h-1.5 flex-1 rounded-full bg-[#F57F3D]" />
            <div className="h-1.5 flex-1 rounded-full bg-slate-300" />
          </div>
          <p className="mt-2 text-xs text-slate-500 md:text-sm">
            Step 2 of 3 • Passport Verification
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-32 md:px-8 md:pb-8">
          <h2 className="text-[28px] font-bold dark:text-white md:text-[32px]">
            Passport Verification
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300 md:mt-3 md:text-lg">
            Upload your passport. We'll verify it securely using encrypted OCR
            checks.
          </p>

          {/* Passport Number */}
          <div className="mt-6 md:mt-8">
            <label className="block">
              <span className="text-base font-medium dark:text-white md:text-lg">
                Passport Number
              </span>
              <input
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 outline-none focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 md:py-4 md:text-lg"
                placeholder="Enter passport number (e.g. G12345678)"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                maxLength={20}
                required
              />
              <p className="mt-1 text-xs text-slate-500 md:text-sm">
                As shown on your passport (usually 8–9 characters)
              </p>
            </label>
          </div>

          {/* Upload Section */}
          <div className="mt-8 md:mt-10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 md:text-base">
              Upload Passport
            </h3>

            {file ? (
              <div className="mt-4 rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center md:p-8">
                <span className="material-symbols-outlined text-4xl text-green-500 md:text-5xl">
                  check_circle
                </span>
                <p className="mt-2 text-sm font-medium text-green-700 md:text-base">
                  Passport uploaded
                </p>
                <p className="text-xs text-green-600 md:text-sm">
                  {file.name} ({formatFileSize(file.size)})
                </p>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-3 text-sm text-red-500 hover:text-red-700 md:text-base"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-[#F57F3D] hover:bg-gray-100 md:p-8">
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <span className="material-symbols-outlined text-4xl text-slate-400 md:text-5xl">
                  upload
                </span>
                <p className="mt-2 text-sm text-slate-600 md:text-base">
                  Upload passport main page
                </p>
                <p className="text-xs text-slate-500 md:text-sm">
                  JPG, PNG or PDF • Max 10MB
                </p>
                <div className="mt-4 flex flex-col items-center gap-2 md:flex-row md:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-slate-400">
                      photo_camera
                    </span>
                    <span className="text-xs text-slate-500">Clear photo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-slate-400">
                      visibility
                    </span>
                    <span className="text-xs text-slate-500">All details visible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-slate-400">
                      light_mode
                    </span>
                    <span className="text-xs text-slate-500">Good lighting</span>
                  </div>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[min(390px,95vw,500px)] border-t border-gray-200 bg-white/95 p-6 backdrop-blur md:relative md:mt-6 md:max-w-[700px] md:border-t-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="md:px-8 md:pb-6">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`h-14 w-full rounded-xl text-lg font-semibold transition-all md:h-16 md:text-xl md:max-w-[400px] md:mx-auto md:block ${
                isFormValid()
                  ? 'bg-[#F57F3D] text-white hover:bg-[#e06c2e] shadow-lg shadow-[#F57F3D]/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupStep2KYCUpload;