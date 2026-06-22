import React from 'react';
import { useListStaffDirectory } from '@/hooks/useCatalog';
import { Users } from 'lucide-react';

function initials(name: string | null): string {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
}

const OurStaff: React.FC = () => {
  const { data: staff, isLoading, error } = useListStaffDirectory();
  if (error) console.error('Failed to load staff directory:', error);

  return (
    <div className="min-h-screen bg-[#0D0A07] pt-32 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">The People Behind The Service</span>
          <h1 className="text-4xl md:text-5xl font-display text-[#F5F0E8] mt-3">Our Staff</h1>
          <p className="text-[#F5F0E8]/60 mt-4 max-w-xl mx-auto">
            Meet the team that makes every event run smoothly, from planning to the last plate cleared.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-[#1A1410] border border-[#C9A84C]/15 animate-pulse rounded-md" />)}
          </div>
        ) : !staff || staff.length === 0 ? (
          <div className="text-center py-16 text-[#F5F0E8]/50">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>Our team profiles are coming soon — check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {staff.map((member) => (
              <div key={member.id} className="bg-[#1A1410] border border-[#C9A84C]/15 rounded-md p-6 text-center hover:border-[#C9A84C]/40 transition-colors">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.fullName || 'Staff member'} className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] flex items-center justify-center font-serif text-2xl mx-auto mb-4">
                    {initials(member.fullName)}
                  </div>
                )}
                <h3 className="font-serif text-lg text-[#F5F0E8]">{member.fullName}</h3>
                {member.staffTitle && <p className="text-[#C9A84C] text-sm mt-0.5">{member.staffTitle}</p>}
                {member.bio && <p className="text-[#F5F0E8]/60 text-sm mt-3 leading-relaxed">{member.bio}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OurStaff;
