// components/SignupStep2KYCUpload.tsx
import {useState, type FC} from 'react';

interface SignupStep2KYCUploadProps {
  initialData: {
    type: 'Passport' | 'Aadhaar' | 'PAN Card';
    number: string;
    file: File | null;
  };
  onComplete: (data: any) => void;
  onBack: () => void;
}

const SignupStep2KYCUpload: FC<SignupStep2KYCUploadProps> = ({
  initialData,
  onComplete,
  onBack,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<
    'Passport' | 'Aadhaar' | 'PAN Card'
  >(initialData.type);
  const [docNumber, setDocNumber] = useState(initialData.number);
  const [file, setFile] = useState<File | null>(initialData.file);

  const handleFileUpload = (uploadedFile: File | null) => {
    setFile(uploadedFile);
  };

  const handleSubmit = () => {
    const formData = {
      type: selectedDoc,
      number: docNumber,
      file,
    };
    onComplete(formData);
  };

  const isFormValid = () => {
    return docNumber.trim().length > 0 && file !== null;
  };

  // Function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 flex min-h-screen w-full items-center justify-center p-4 font-['Inter'] antialiased selection:bg-[#F57F3D]/30">
      <div className="relative mx-auto min-h-[844px] w-full max-w-[390px] overflow-hidden bg-[#f8f6f5] dark:bg-[#221610]">
        {/* Subtle decorative backgrounds */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -right-20 top-1/4 h-80 w-80 rotate-45 transform rounded-[3rem] border border-slate-200/60 opacity-60 dark:border-slate-700/30" />
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full border border-slate-200/60 opacity-60 dark:border-slate-700/30" />
          <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-[#F57F3D]/5 blur-3xl" />
          <div className="absolute bottom-1/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-slate-200/50 to-transparent dark:via-slate-700/50" />
        </div>

        {/* Sticky header */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-[#f8f6f5] p-4 pb-2 backdrop-blur-sm dark:bg-[#221610]">
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

        {/* Progress bar */}
        <div className="relative z-10 flex w-full flex-col items-center justify-center gap-2 px-6 py-4">
          <div className="flex w-full flex-row items-center justify-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#ced9e9] dark:bg-slate-700" />
            <div className="h-1.5 flex-1 rounded-full bg-[#F57F3D]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#ced9e9] dark:bg-slate-700" />
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Step 2 of 3 • Identity Verification
          </p>
        </div>

        {/* Scrollable main content */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-32 pt-2">
          <h2 className="pb-3 text-[28px] font-bold leading-tight tracking-tight text-[#0d131c] dark:text-white">
            Document Verification
          </h2>
          <p className="pb-6 text-base font-normal leading-normal text-slate-600 dark:text-slate-300">
            Upload your government-issued ID. We'll verify it securely using
            bank-grade encryption and OCR technology.
          </p>

          {/* Document type selector */}
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-6">
            {(['Passport', 'Aadhaar', 'PAN Card'] as const).map((docType) => (
              <button
                key={docType}
                type="button"
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl px-5 text-sm font-medium transition-all active:scale-95 ${
                  selectedDoc === docType
                    ? 'bg-[#F57F3D] text-white shadow-md'
                    : 'border border-slate-200 bg-white text-[#0d131c] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                }`}
                onClick={() => {
                  setSelectedDoc(docType);
                  // Clear file when changing document type
                  setFile(null);
                }}
              >
                {docType === 'Passport' && (
                  <span className="material-symbols-outlined text-[18px]">
                    badge
                  </span>
                )}
                {docType === 'Aadhaar' && (
                  <span className="material-symbols-outlined text-[18px]">
                    fingerprint
                  </span>
                )}
                {docType === 'PAN Card' && (
                  <span className="material-symbols-outlined text-[18px]">
                    credit_card
                  </span>
                )}
                {docType}
              </button>
            ))}
          </div>

          {/* Document number input */}
          <div className="flex flex-col gap-6 pb-6">
            <label className="flex flex-col gap-2">
              <span className="text-base font-medium text-[#0d131c] dark:text-white">
                {selectedDoc} Number
              </span>
              <input
                className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none backdrop-blur-sm transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                placeholder={
                  selectedDoc === 'Passport'
                    ? 'Enter passport number (e.g. G12345678)'
                    : selectedDoc === 'Aadhaar'
                      ? '12-digit Aadhaar number (e.g. 1234 5678 9012)'
                      : '10-character PAN (e.g. ABCDE1234F)'
                }
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                type="text"
                maxLength={
                  selectedDoc === 'Aadhaar'
                    ? 14
                    : selectedDoc === 'PAN Card'
                      ? 10
                      : 20
                }
                required
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {selectedDoc === 'Passport'
                  ? 'As shown in your passport (usually 8–9 characters)'
                  : selectedDoc === 'Aadhaar'
                    ? '12 digits, usually grouped in 4s'
                    : 'Format: 5 letters + 4 numbers + 1 letter'}
              </p>
            </label>

            {/* Single upload section */}
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Upload Document
              </h3>

              <label className="flex cursor-pointer flex-col gap-3">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  {selectedDoc === 'PAN Card'
                    ? 'PAN Card (Front only)'
                    : selectedDoc === 'Passport'
                      ? 'Passport (Main page with photo)'
                      : 'Aadhaar (Front side)'}
                </span>

                {file ? (
                  <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center backdrop-blur-sm transition-colors dark:border-green-800 dark:bg-green-900/20">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-4xl text-green-500">
                        check_circle
                      </span>
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          ✓ Document uploaded successfully
                        </p>
                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                          {file.name} ({formatFileSize(file.size)})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="mt-2 flex items-center gap-1 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                        Remove file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-6 text-center backdrop-blur-sm transition-colors hover:border-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/50">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      className="hidden"
                      id="document-upload"
                      onChange={(e) =>
                        handleFileUpload(e.target.files?.[0] || null)
                      }
                    />
                    <label
                      htmlFor="document-upload"
                      className="flex cursor-pointer flex-col items-center"
                    >
                      <span className="material-symbols-outlined mb-2 text-4xl text-slate-400">
                        upload
                      </span>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Tap to upload or drag & drop
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        JPG, PNG or PDF • Max 10MB • Clear, well-lit photo
                      </p>
                    </label>
                  </div>
                )}

                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      info
                    </span>
                    {selectedDoc === 'Passport'
                      ? 'Upload the main page with your photo and personal details'
                      : selectedDoc === 'Aadhaar'
                        ? 'Upload the front side with your photo and Aadhaar number'
                        : "Upload the front side with your name, father's name, and PAN number"}
                  </p>
                </div>
              </label>
            </div>

            <p className="pt-4 text-center text-xs text-slate-500 dark:text-slate-400">
              We use automated checks (OCR + fraud detection) to verify your
              document quickly and securely.
            </p>
          </div>
        </div>

        {/* Fixed bottom bar with trust signal */}
        <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-[390px] border-t border-slate-100 bg-white/80 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#221610]/80">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="material-symbols-outlined text-[18px] text-green-600">
                verified_user
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Bank-grade 256-bit encryption • Secure verification
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-semibold shadow-lg transition-all ${
                isFormValid()
                  ? 'cursor-pointer bg-[#F57F3D] text-white shadow-[#F57F3D]/20 hover:bg-[#e06c2e] active:scale-[0.98]'
                  : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
              }`}
            >
              Continue
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupStep2KYCUpload;
