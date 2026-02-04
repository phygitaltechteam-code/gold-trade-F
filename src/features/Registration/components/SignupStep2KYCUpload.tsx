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
    <div className="bg-gray-50 dark:bg-gray-950 flex min-h-screen w-full items-center justify-center p-4 font-['Inter'] antialiased">
      <div className="relative mx-auto min-h-[844px] w-full max-w-[390px] overflow-hidden bg-[#f8f6f5] dark:bg-[#221610]">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-[#f8f6f5] p-4 dark:bg-[#221610]">
          <button
            onClick={onBack}
            className="flex size-12 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
          <h2 className="flex-1 pr-12 text-center text-lg font-bold dark:text-white">
            Verify Identity
          </h2>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 text-center">
          <div className="flex gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-slate-300" />
            <div className="h-1.5 flex-1 rounded-full bg-[#F57F3D]" />
            <div className="h-1.5 flex-1 rounded-full bg-slate-300" />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Step 2 of 3 • Passport Verification
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-32">
          <h2 className="text-[28px] font-bold dark:text-white">
            Passport Verification
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Upload your passport. We’ll verify it securely using encrypted OCR
            checks.
          </p>

          {/* Passport Number */}
          <label className="mt-6 block">
            <span className="text-base font-medium dark:text-white">
              Passport Number
            </span>
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3.5 outline-none focus:border-[#F57F3D]"
              placeholder="Enter passport number (e.g. G12345678)"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              maxLength={20}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              As shown on your passport (usually 8–9 characters)
            </p>
          </label>

          {/* Upload */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Upload Passport
            </h3>

            {file ? (
              <div className="mt-4 rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-green-500">
                  check_circle
                </span>
                <p className="mt-2 text-sm font-medium text-green-700">
                  Passport uploaded
                </p>
                <p className="text-xs text-green-600">
                  {file.name} ({formatFileSize(file.size)})
                </p>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-3 text-sm text-red-500"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed p-6 text-center">
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <span className="material-symbols-outlined text-4xl text-slate-400">
                  upload
                </span>
                <p className="mt-2 text-sm text-slate-600">
                  Upload passport main page
                </p>
                <p className="text-xs text-slate-500">
                  JPG, PNG or PDF • Max 10MB
                </p>
              </label>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[390px] border-t bg-white/80 p-6 backdrop-blur">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className={`h-14 w-full rounded-xl text-lg font-semibold ${
              isFormValid()
                ? 'bg-[#F57F3D] text-white'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupStep2KYCUpload;
