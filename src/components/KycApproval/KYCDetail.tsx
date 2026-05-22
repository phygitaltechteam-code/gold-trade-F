import React, {useState} from 'react';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CheckCircle2,
  Info,
  User,
  Building2,
  Users,
  Clock,
  X,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {KYCRequest} from './kyctypes';
import {useGetKYCRequestById, useApproveKYC, useRejectKYC} from './mutationapi';
import {createFileRoute} from '@tanstack/react-router';

interface KYCDetailProps {
  request: KYCRequest;
  onBack: () => void;
}

export const KYCDetail: React.FC<KYCDetailProps> = ({request, onBack}) => {
  const Route = createFileRoute('/_app/KYCApproval/kycdetailes/$id')();
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const {data: detailedRequest, isLoading} = useGetKYCRequestById(Route.id!);
  const approveKYC = useApproveKYC();
  const rejectKYC = useRejectKYC();

  const displayRequest = detailedRequest || request;

  const handleApprove = () => {
    approveKYC.mutate(
      {
        id: request.id,
      },
      {
        onSuccess: () => {
          setTimeout(() => onBack(), 1500);
        },
      },
    );
  };

  const handleReject = () => {
    if (!rejectNote.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    rejectKYC.mutate(
      {
        id: request.id,
        note: rejectNote,
      },
      {
        onSuccess: () => {
          setTimeout(() => onBack(), 1500);
        },
      },
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'In-Review':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Action Required':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const isProcessing = approveKYC.isPending || rejectKYC.isPending;

  return (
    <div className="font-sans min-h-screen bg-[#F8F9FB] text-[#1A1C1E]">
      {/* Top Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-stroke bg-white px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={onBack}
            className="hover:bg-gray-100 flex-shrink-0 rounded-full p-2 transition-colors"
            disabled={isProcessing}
          >
            <ArrowLeft className="text-gray-600 h-5 w-5" />
          </button>
          <div className="truncate">
            <h1 className="truncate text-lg font-bold">KYC Approval Portal</h1>
            <div className="text-gray-500 flex items-center gap-2 text-xs">
              <span className="truncate">
                {displayRequest.CRN
                  ? `Case #${displayRequest.CRN}`
                  : `Case #${displayRequest.id?.substring(0, 8)}...`}
              </span>
              <span className="bg-gray-300 h-1 w-1 flex-shrink-0 rounded-full"></span>
              <span className="flex-shrink-0">
                Submitted: {displayRequest.submissionDate}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${getStatusColor(displayRequest.status || 'Pending')}`}
        >
          <Clock className="h-4 w-4" />
          <span className="text-xs font-bold">{displayRequest.status}</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Column - Details */}
          <div className="space-y-6 lg:col-span-7">
            {/* Personal Details */}
            <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <User className="text-gray-900 h-4 w-4" />
                  Personal Details
                </h2>
                {displayRequest.user?.isVerified && (
                  <span className="rounded border border-green-100 bg-green-50 px-2 py-0.5 text-xs font-bold text-green-600">
                    Email Verified
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6">
                <div className="col-span-2">
                  <div className="mb-4 flex items-center gap-3">
                    {displayRequest.photo ? (
                      <img
                        src={displayRequest.photo}
                        alt={displayRequest.legalName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-gray-100 text-gray-400 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold">
                        {getInitials(displayRequest.legalName || 'Unknown')}
                      </div>
                    )}
                    <div>
                      <p className="text-gray-900 text-lg font-bold">
                        {displayRequest.legalName}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {displayRequest.email}
                      </p>
                      {displayRequest.CRN && (
                        <p className="text-gray-400 text-xs">
                          CRN: {displayRequest.CRN}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    Date of Birth
                  </p>
                  <p className="text-gray-900 text-sm font-bold">
                    {displayRequest.dob || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    Nationality
                  </p>
                  <p className="text-gray-900 text-sm font-bold">
                    {displayRequest.nationality}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    Tax ID / PAN
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-gray-900 text-sm font-bold">
                      {displayRequest.taxId}
                    </p>
                    {displayRequest.panCard && (
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    Phone Number
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 text-sm font-bold">
                      {displayRequest.phoneNumber}
                    </p>
                    {displayRequest.user?.phoneNumber && (
                      <span className="rounded border border-green-100 bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    Residential Address
                  </p>
                  <p className="text-gray-900 break-words text-sm font-bold leading-relaxed">
                    {displayRequest.address || 'Not provided'}
                  </p>
                </div>
              </div>
            </section>

            {/* Bank Details */}
            <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
              <div className="border-b border-stroke px-6 py-4">
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <Building2 className="text-gray-900 h-4 w-4" />
                  Bank Details
                </h2>
              </div>
              <div className="space-y-6 p-6">
                <div className="bg-gray-50 flex gap-3 rounded-lg border border-stroke p-4">
                  <div className="bg-gray-200 h-fit flex-shrink-0 rounded-full p-1">
                    <Info className="text-gray-600 h-3 w-3" />
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Bank account name must match the legal name provided above
                    exactly.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">
                      Bank Name
                    </p>
                    <p className="text-gray-900 break-words text-sm font-bold">
                      {displayRequest.bankName || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">
                      Account Number
                    </p>
                    <p className="text-gray-900 font-mono text-sm font-bold tracking-tighter">
                      {displayRequest.accountNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">
                      IFSC Code
                    </p>
                    <p className="text-gray-900 font-mono text-sm font-bold tracking-tighter">
                      {displayRequest.ifscCode || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Nominee Details */}
            <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
              <div className="border-b border-stroke px-6 py-4">
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <Users className="text-gray-900 h-4 w-4" />
                  Nominee Details
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-8 p-6">
                <div>
                  <p className="text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    Nominee Name
                  </p>
                  <p className="text-gray-900 break-words text-sm font-bold">
                    {displayRequest.nomineeName || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    Relationship
                  </p>
                  <p className="text-gray-900 text-sm font-bold">
                    {displayRequest.nomineeRelationship || 'Not provided'}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Documents */}
          <div className="space-y-6 lg:col-span-5">
            <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <CheckCircle2 className="text-gray-900 h-4 w-4" />
                  Document Verification
                </h2>
                <span className="text-gray-400 font-mono text-xs font-bold">
                  {displayRequest.aadhaarNumber}
                </span>
              </div>
              <div className="space-y-8 p-6">
                {displayRequest.aadharCard && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        Aadhaar Card
                      </p>
                      <span className="rounded border border-green-100 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                        Uploaded
                      </span>
                    </div>
                    <div className="group relative aspect-[1.6/1] cursor-pointer overflow-hidden rounded-lg border border-stroke bg-[#EAEAEA]">
                      <img
                        src={displayRequest.aadharCard}
                        alt="Aadhaar Card"
                        className="h-full w-full object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/600x375?text=Aadhaar+Card';
                        }}
                      />
                    </div>
                  </div>
                )}

                {displayRequest.panCard && (
                  <div className="space-y-3">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                      PAN Card
                    </p>
                    <div className="group aspect-[1.6/1] cursor-pointer overflow-hidden rounded-lg border border-stroke bg-white">
                      <img
                        src={displayRequest.panCard}
                        alt="PAN Card"
                        className="h-full w-full object-contain p-4"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/600x375?text=PAN+Card';
                        }}
                      />
                    </div>
                  </div>
                )}

                {displayRequest.passport && (
                  <div className="space-y-3">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                      Passport
                    </p>
                    <div className="group aspect-[1.6/1] cursor-pointer overflow-hidden rounded-lg border border-stroke bg-white">
                      <img
                        src={displayRequest.passport}
                        alt="Passport"
                        className="h-full w-full object-contain p-4"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/600x375?text=Passport';
                        }}
                      />
                    </div>
                  </div>
                )}

                {displayRequest.photo &&
                  !displayRequest.aadharCard &&
                  !displayRequest.panCard &&
                  !displayRequest.passport && (
                    <div className="space-y-3">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        Profile Photo
                      </p>
                      <div className="group aspect-square w-32 cursor-pointer overflow-hidden rounded-full border border-stroke bg-white">
                        <img
                          src={displayRequest.photo}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}

                {!displayRequest.aadharCard &&
                  !displayRequest.panCard &&
                  !displayRequest.passport &&
                  !displayRequest.photo && (
                    <div className="py-8 text-center">
                      <AlertCircle className="text-gray-300 mx-auto mb-4 h-12 w-12" />
                      <p className="text-gray-400">No documents uploaded</p>
                    </div>
                  )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-4 text-lg font-bold">Reject KYC Request</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Are you sure you want to reject this KYC request? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="hover:bg-gray-50 flex-1 rounded-lg border border-stroke px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectKYC.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {rejectKYC.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <footer className="sticky bottom-0 mt-6 border-t border-stroke bg-white px-4 py-4 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <div className="flex-1">
            <p className="text-gray-400 mb-2 text-xs font-bold uppercase tracking-wider">
              Rejection Reason (Required for rejection)
            </p>
            <input
              type="text"
              placeholder="Enter reason for rejection..."
              className="bg-gray-50 w-full rounded-lg border border-stroke px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRejectConfirm(true)}
              disabled={isProcessing || !rejectNote.trim()}
              className="text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-lg border border-stroke bg-white px-6 py-2.5 text-sm font-bold transition-colors disabled:opacity-50"
            >
              {rejectKYC.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <span>Reject</span>
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {approveKYC.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>Approve</span>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {(approveKYC.isSuccess || rejectKYC.isSuccess) && (
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full rounded-t-lg bg-green-500 px-4 py-2 text-sm font-medium text-white">
            KYC {approveKYC.isSuccess ? 'approved' : 'rejected'} successfully!
            Redirecting...
          </div>
        )}
      </footer>
    </div>
  );
};
