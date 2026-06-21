import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

/**
 * Country dial codes, sorted alphabetically by country name. This isn't
 * exhaustive of every ITU member territory, but covers all standard
 * ISO 3166-1 countries used in normal phone dialing — enough for a global
 * sign-up form. Ghana is listed first since it's this business's home
 * market and the most common choice.
 */
const COUNTRIES: { name: string; code: string; dial: string }[] = [
  { name: 'Ghana', code: 'GH', dial: '+233' },
  { name: 'Afghanistan', code: 'AF', dial: '+93' },
  { name: 'Albania', code: 'AL', dial: '+355' },
  { name: 'Algeria', code: 'DZ', dial: '+213' },
  { name: 'Argentina', code: 'AR', dial: '+54' },
  { name: 'Australia', code: 'AU', dial: '+61' },
  { name: 'Austria', code: 'AT', dial: '+43' },
  { name: 'Bangladesh', code: 'BD', dial: '+880' },
  { name: 'Belgium', code: 'BE', dial: '+32' },
  { name: 'Benin', code: 'BJ', dial: '+229' },
  { name: 'Brazil', code: 'BR', dial: '+55' },
  { name: 'Burkina Faso', code: 'BF', dial: '+226' },
  { name: 'Cameroon', code: 'CM', dial: '+237' },
  { name: 'Canada', code: 'CA', dial: '+1' },
  { name: 'Chile', code: 'CL', dial: '+56' },
  { name: 'China', code: 'CN', dial: '+86' },
  { name: "Côte d'Ivoire", code: 'CI', dial: '+225' },
  { name: 'Denmark', code: 'DK', dial: '+45' },
  { name: 'Egypt', code: 'EG', dial: '+20' },
  { name: 'Ethiopia', code: 'ET', dial: '+251' },
  { name: 'Finland', code: 'FI', dial: '+358' },
  { name: 'France', code: 'FR', dial: '+33' },
  { name: 'Gambia', code: 'GM', dial: '+220' },
  { name: 'Germany', code: 'DE', dial: '+49' },
  { name: 'Greece', code: 'GR', dial: '+30' },
  { name: 'Guinea', code: 'GN', dial: '+224' },
  { name: 'India', code: 'IN', dial: '+91' },
  { name: 'Indonesia', code: 'ID', dial: '+62' },
  { name: 'Ireland', code: 'IE', dial: '+353' },
  { name: 'Israel', code: 'IL', dial: '+972' },
  { name: 'Italy', code: 'IT', dial: '+39' },
  { name: 'Japan', code: 'JP', dial: '+81' },
  { name: 'Kenya', code: 'KE', dial: '+254' },
  { name: 'Liberia', code: 'LR', dial: '+231' },
  { name: 'Malaysia', code: 'MY', dial: '+60' },
  { name: 'Mali', code: 'ML', dial: '+223' },
  { name: 'Mexico', code: 'MX', dial: '+52' },
  { name: 'Morocco', code: 'MA', dial: '+212' },
  { name: 'Netherlands', code: 'NL', dial: '+31' },
  { name: 'New Zealand', code: 'NZ', dial: '+64' },
  { name: 'Niger', code: 'NE', dial: '+227' },
  { name: 'Nigeria', code: 'NG', dial: '+234' },
  { name: 'Norway', code: 'NO', dial: '+47' },
  { name: 'Pakistan', code: 'PK', dial: '+92' },
  { name: 'Philippines', code: 'PH', dial: '+63' },
  { name: 'Poland', code: 'PL', dial: '+48' },
  { name: 'Portugal', code: 'PT', dial: '+351' },
  { name: 'Qatar', code: 'QA', dial: '+974' },
  { name: 'Russia', code: 'RU', dial: '+7' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966' },
  { name: 'Senegal', code: 'SN', dial: '+221' },
  { name: 'Sierra Leone', code: 'SL', dial: '+232' },
  { name: 'Singapore', code: 'SG', dial: '+65' },
  { name: 'South Africa', code: 'ZA', dial: '+27' },
  { name: 'South Korea', code: 'KR', dial: '+82' },
  { name: 'Spain', code: 'ES', dial: '+34' },
  { name: 'Sweden', code: 'SE', dial: '+46' },
  { name: 'Switzerland', code: 'CH', dial: '+41' },
  { name: 'Tanzania', code: 'TZ', dial: '+255' },
  { name: 'Togo', code: 'TG', dial: '+228' },
  { name: 'Turkey', code: 'TR', dial: '+90' },
  { name: 'Uganda', code: 'UG', dial: '+256' },
  { name: 'Ukraine', code: 'UA', dial: '+380' },
  { name: 'United Arab Emirates', code: 'AE', dial: '+971' },
  { name: 'United Kingdom', code: 'GB', dial: '+44' },
  { name: 'United States', code: 'US', dial: '+1' },
  { name: 'Zambia', code: 'ZM', dial: '+260' },
  { name: 'Zimbabwe', code: 'ZW', dial: '+263' },
];

interface PhoneInputProps {
  /** Full E.164 value, e.g. "+233547164110". Kept as a single string so the
   *  parent form (and Supabase's signInWithOtp call) doesn't need to know
   *  this is internally split into a country code + local number. */
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

/** Best-effort split of an existing E.164 value back into {dial, rest} so the
 *  dropdown shows the right country if a value is already set (e.g. editing). */
function splitExisting(value: string): { dial: string; rest: string } {
  const match = COUNTRIES
    .slice()
    .sort((a, b) => b.dial.length - a.dial.length) // longest dial code first, so +1 doesn't shadow +1xxx-style entries
    .find(c => value.startsWith(c.dial));
  if (match) return { dial: match.dial, rest: value.slice(match.dial.length) };
  return { dial: '+233', rest: value.replace(/^\+/, '') };
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, required }) => {
  const initial = splitExisting(value);
  const [dial, setDial] = useState(initial.dial);
  const [localNumber, setLocalNumber] = useState(initial.rest);

  // Keep the combined E.164 string in sync whenever either piece changes.
  useEffect(() => {
    const digitsOnly = localNumber.replace(/[^\d]/g, '');
    onChange(digitsOnly ? `${dial}${digitsOnly}` : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dial, localNumber]);

  return (
    <div className="flex gap-2">
      <select
        value={dial}
        onChange={(e) => setDial(e.target.value)}
        aria-label="Country code"
        className="h-11 px-2 bg-[#0D0A07] border border-[#3A3430] text-[#F5F0E8] rounded-none text-sm focus:outline-none focus:border-[#C9A84C] max-w-[7.5rem]"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.dial}>
            {c.name} {c.dial}
          </option>
        ))}
      </select>
      <Input
        type="tel"
        required={required}
        placeholder="547164110"
        value={localNumber}
        onChange={(e) => setLocalNumber(e.target.value)}
        className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11 flex-1"
      />
    </div>
  );
};

export default PhoneInput;
