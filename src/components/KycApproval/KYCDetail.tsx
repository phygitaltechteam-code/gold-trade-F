import React from 'react';
import { ArrowLeft, CheckCircle2, Info, User, Building2, Users, Clock, X, Check } from 'lucide-react';
import { KYCRequest } from './kyctypes';

interface KYCDetailProps {
  request: KYCRequest;
  onBack: () => void;
}

export const KYCDetail: React.FC<KYCDetailProps> = ({ request, onBack }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-[#1A1C1E]">
      {/* Top Header */}
      <header className="bg-white border-b border-stroke h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="truncate">
            <h1 className="text-lg font-bold truncate">KYC Approval Portal</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="truncate">Case #{request.id}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
              <span className="flex-shrink-0">Submitted: {request.submissionDate}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-bold text-gray-600">Pending Review</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Personal Details */}
            <section className="bg-white rounded-xl border border-stroke shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-stroke flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2 text-base">
                  <User className="w-4 h-4 text-gray-900" />
                  Personal Details
                </h2>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-bold rounded border border-green-100">
                  Email Verified
                </span>
              </div>
              <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Full Legal Name
                  </p>
                  <p className="text-sm font-bold text-gray-900 break-words">
                    {request.legalName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Date of Birth
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {request.dob} (38 Yrs)
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Nationality
                  </p>
                  <p className="text-sm font-bold text-gray-900">India</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Tax ID / PAN
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-900">{request.taxId}</p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Residential Address
                  </p>
                  <p className="text-sm font-bold text-gray-900 leading-relaxed break-words">
                    {request.address}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Phone Number
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{request.phoneNumber}</p>
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded border border-green-100">
                      Verified
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Occupation
                  </p>
                  <p className="text-sm font-bold text-gray-900">{request.occupation}</p>
                </div>
              </div>
            </section>

            {/* Bank Details */}
            <section className="bg-white rounded-xl border border-stroke shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-stroke">
                <h2 className="font-bold flex items-center gap-2 text-base">
                  <Building2 className="w-4 h-4 text-gray-900" />
                  Bank Details
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 border border-stroke rounded-lg p-4 flex gap-3">
                  <div className="p-1 bg-gray-200 rounded-full h-fit flex-shrink-0">
                    <Info className="w-3 h-3 text-gray-600" />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Bank account name must match the legal name provided above exactly.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Bank Name
                    </p>
                    <p className="text-sm font-bold text-gray-900 break-words">
                      {request.bankName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Account Number
                    </p>
                    <p className="text-sm font-bold text-gray-900 font-mono tracking-tighter">
                      {request.accountNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      IFSC Code
                    </p>
                    <p className="text-sm font-bold text-gray-900 font-mono tracking-tighter">
                      {request.ifscCode}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Nominee Details */}
            <section className="bg-white rounded-xl border border-stroke shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-stroke">
                <h2 className="font-bold flex items-center gap-2 text-base">
                  <Users className="w-4 h-4 text-gray-900" />
                  Nominee Details
                </h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Nominee Name
                  </p>
                  <p className="text-sm font-bold text-gray-900 break-words">
                    {request.nomineeName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Relationship
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {request.nomineeRelationship}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Documents */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white rounded-xl border border-stroke shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-stroke flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2 text-base">
                  <CheckCircle2 className="w-4 h-4 text-gray-900" />
                  Aadhaar Verification
                </h2>
                <span className="text-xs font-bold text-gray-400 font-mono">
                  **** **** 1234
                </span>
              </div>
              <div className="p-6 space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Aadhaar Front Image
                    </p>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                      Verified
                    </span>
                  </div>
                  <div className="aspect-[1.6/1] bg-[#EAEAEA] rounded-lg overflow-hidden border border-stroke relative group cursor-pointer">
                    <img
                      src="https://picsum.photos/seed/aadhaar-front/600/375"
                      alt="Aadhaar Front"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Aadhaar Back Image
                  </p>
                  <div className="aspect-[1.6/1] bg-white rounded-lg overflow-hidden border border-stroke group cursor-pointer">
                    <img
                      src="https://picsum.photos/seed/aadhaar-back/600/375"
                      alt="Aadhaar Back"
                      className="w-full h-full object-contain p-4 opacity-90 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <footer className="bg-white border-t border-stroke py-4 px-4 lg:px-8 mt-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Admin Remarks
            </p>
            <input
              type="text"
              placeholder="Enter reason for rejection or approval notes..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-stroke rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-stroke rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              <X className="w-4 h-4" />
              <span>Reject</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-8 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
              <Check className="w-4 h-4" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};