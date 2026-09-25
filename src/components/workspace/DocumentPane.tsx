"use client";

import React from 'react';
import { useSessionStore } from '@/core/state/sessionStore';

export function DocumentPane() {
  const documentUrl = useSessionStore((state) => state.documentUrl);
  const activeDocumentName = useSessionStore((state) => state.activeDocumentName);

  return (
    <div className="flex h-full w-full flex-col border-r border-[var(--color-border-default)] bg-[var(--color-warm-white)] lg:w-1/2">
      {/* Document Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border-default)] px-4 py-3 bg-[var(--color-warm-white)] overflow-x-auto">
        <div className="rounded-full bg-[var(--color-slate-900)] px-4 py-1.5 text-sm font-medium text-white shadow-sm whitespace-nowrap">
          {activeDocumentName || 'Document'}
        </div>
      </div>
      
      {documentUrl ? (
        <div className="flex-1 overflow-hidden bg-white">
          <iframe 
            src={`${documentUrl}#toolbar=0&navpanes=0`} 
            title="Document Preview"
            className="h-full w-full border-none"
          />
        </div>
      ) : (
        /* Mock Document Content matching Figma design */
        <div className="flex-1 overflow-y-auto bg-white px-12 py-10 shadow-sm">
          <div className="mx-auto max-w-2xl space-y-8 text-[15px] leading-[1.8] text-[var(--color-slate-900)]">
            <h2 className="mb-8 font-bold tracking-wide">RESIDENTIAL RENTAL AGREEMENT</h2>
            
            <div className="relative">
              <span className="absolute -left-32 top-1 font-mono text-[12px] text-[var(--color-text-muted)]">§1 · Parties</span>
              <p>
                This Agreement is made and entered into on the 1st day of October 2025, between <strong className="font-semibold">Mr. Rajesh Kumar</strong> (hereinafter &quot;Landlord&quot;) residing at Flat 4B, Kondapur, Hyderabad, and <strong className="font-semibold">Ms. Priya Sharma</strong> (hereinafter &quot;Tenant&quot;) currently residing at Ameerpet, Hyderabad.
              </p>
            </div>
            
            <div className="relative">
              <span className="absolute -left-32 top-1 font-mono text-[12px] text-[var(--color-text-muted)]">§2 · Property & Term</span>
              <p>
                The Landlord agrees to let and the Tenant agrees to take on rent the premises situated at Flat 201, Green Valley Apartments, Gachibowli, Hyderabad — 500032, for a period of 11 months commencing October 1, 2025.
              </p>
            </div>
            
            <div className="relative">
              <span className="absolute -left-32 top-1 font-mono text-[12px] text-[var(--color-text-muted)]">§3 · Rent & Deposit</span>
              <p>
                The monthly rent is fixed at ₹22,000 (Rupees Twenty-Two Thousand only), payable on or before the 5th of each month. The Tenant shall pay a <span className="border-b-[1.5px] border-[#E53E3E] bg-[#FFF5F5] text-[var(--color-slate-900)]">security deposit of ₹1,32,000 (equivalent to 6 months rent)</span>, refundable at the end of the tenancy subject to deductions.
              </p>
            </div>
            
            <div className="relative">
              <span className="absolute -left-32 top-1 font-mono text-[12px] text-[var(--color-text-muted)]">§4 · Landlord Rights</span>
              <p>4.1 The Landlord reserves the right to inspect the premises at any time.</p>
              <p className="mt-4">
                4.2 <span className="border-b-[1.5px] border-[#E53E3E] bg-[#FFF5F5] text-[var(--color-slate-900)]">The Landlord may enter the premises without prior notice to the Tenant.</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
