import React from 'react';
import { FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';

interface DocCardProps {
  name: string;
  type: string;
  status: string;
  icon: React.ComponentType<any>;
  color: string;
  url: string;
}

const DocCard: React.FC<DocCardProps> = ({ name, type, status, icon: Icon, color, url }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:border-orange-200"
  >
    <div className={`rounded-lg p-3 ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-medium text-slate-900">{name}</div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        {type} • <span className="font-medium text-emerald-600">{status}</span>
      </div>
    </div>
    <ExternalLink className="h-4 w-4 text-slate-300 transition-colors group-hover:text-orange-500" />
  </a>
);

interface ClientDocsProps {
  displayClient: any;
}

export const ClientDocs: React.FC<ClientDocsProps> = ({ displayClient }) => {
  const hasDocs =
    displayClient?.aadharCard ||
    displayClient?.panCard ||
    displayClient?.passport ||
    displayClient?.photo;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/30 px-4 py-3 md:px-6 md:py-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Verified Documentation
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:gap-4 md:p-6 lg:grid-cols-3">
        {displayClient?.aadharCard && (
          <DocCard
            name="Aadhar Card"
            type="ID Proof"
            status="Verified"
            icon={FileText}
            color="bg-rose-50 text-rose-500"
            url={displayClient.aadharCard}
          />
        )}
        {displayClient?.panCard && (
          <DocCard
            name="PAN Card"
            type="Tax ID"
            status="Verified"
            icon={FileText}
            color="bg-orange-50 text-orange-500"
            url={displayClient.panCard}
          />
        )}
        {displayClient?.passport && (
          <DocCard
            name="Passport"
            type="ID Proof"
            status="Verified"
            icon={FileText}
            color="bg-blue-50 text-blue-500"
            url={displayClient.passport}
          />
        )}
        {displayClient?.photo && (
          <DocCard
            name="Profile Photo"
            type="Photo"
            status="Verified"
            icon={ImageIcon}
            color="bg-purple-50 text-purple-500"
            url={displayClient.photo}
          />
        )}
        {!hasDocs && (
          <p className="col-span-3 py-4 text-center text-sm text-slate-400">
            No documents uploaded
          </p>
        )}
      </div>
    </div>
  );
};
