// Country center coordinates and metadata for GERMS
// Used by all 3 apps: Dashboard, GERMS Alert, GERMS Pro

export interface CountryCenter {
  code: string;
  lat: number;
  lng: number;
  zoom: number;
  label: string;
  flag: string;
  dial: string;
}

export const countryCenters: Record<string, CountryCenter> = {
  CI: { code: 'CI', lat: 5.3400, lng: -4.0100, zoom: 13, label: "Cote d'Ivoire", flag: '🇨🇮', dial: '+225' },
  FR: { code: 'FR', lat: 48.8566, lng: 2.3522, zoom: 12, label: 'France', flag: '🇫🇷', dial: '+33' },
  SN: { code: 'SN', lat: 14.6928, lng: -17.4467, zoom: 13, label: 'Senegal', flag: '🇸🇳', dial: '+221' },
  CM: { code: 'CM', lat: 3.8480, lng: 11.5021, zoom: 13, label: 'Cameroun', flag: '🇨🇲', dial: '+237' },
  MA: { code: 'MA', lat: 33.9716, lng: -6.8498, zoom: 12, label: 'Maroc', flag: '🇲🇦', dial: '+212' },
  US: { code: 'US', lat: 38.9072, lng: -77.0369, zoom: 11, label: 'USA', flag: '🇺🇸', dial: '+1' },
  GB: { code: 'GB', lat: 51.5074, lng: -0.1278, zoom: 12, label: 'UK', flag: '🇬🇧', dial: '+44' },
  ML: { code: 'ML', lat: 12.6392, lng: -8.0029, zoom: 13, label: 'Mali', flag: '🇲🇱', dial: '+223' },
  BF: { code: 'BF', lat: 12.3714, lng: -1.5197, zoom: 13, label: 'Burkina Faso', flag: '🇧🇫', dial: '+226' },
  GN: { code: 'GN', lat: 9.6412, lng: -13.5784, zoom: 13, label: 'Guinee', flag: '🇬🇳', dial: '+224' },
  TG: { code: 'TG', lat: 6.1725, lng: 1.2314, zoom: 13, label: 'Togo', flag: '🇹🇬', dial: '+228' },
  BJ: { code: 'BJ', lat: 6.3703, lng: 2.3912, zoom: 13, label: 'Benin', flag: '🇧🇯', dial: '+229' },
  NE: { code: 'NE', lat: 13.5116, lng: 2.1254, zoom: 13, label: 'Niger', flag: '🇳🇪', dial: '+227' },
  GA: { code: 'GA', lat: 0.4162, lng: 9.4673, zoom: 13, label: 'Gabon', flag: '🇬🇦', dial: '+241' },
  CD: { code: 'CD', lat: -4.3217, lng: 15.3125, zoom: 12, label: 'RD Congo', flag: '🇨🇩', dial: '+243' },
  CG: { code: 'CG', lat: -4.2634, lng: 15.2429, zoom: 13, label: 'Congo', flag: '🇨🇬', dial: '+242' },
  MG: { code: 'MG', lat: -18.8792, lng: 47.5079, zoom: 12, label: 'Madagascar', flag: '🇲🇬', dial: '+261' },
  DZ: { code: 'DZ', lat: 36.7538, lng: 3.0588, zoom: 12, label: 'Algerie', flag: '🇩🇿', dial: '+213' },
  TN: { code: 'TN', lat: 36.8065, lng: 10.1815, zoom: 12, label: 'Tunisie', flag: '🇹🇳', dial: '+216' },
  BE: { code: 'BE', lat: 50.8503, lng: 4.3517, zoom: 12, label: 'Belgique', flag: '🇧🇪', dial: '+32' },
  CH: { code: 'CH', lat: 46.9480, lng: 7.4474, zoom: 12, label: 'Suisse', flag: '🇨🇭', dial: '+41' },
  CA: { code: 'CA', lat: 45.5017, lng: -73.5673, zoom: 12, label: 'Canada', flag: '🇨🇦', dial: '+1' },
};

export const defaultCenter = countryCenters.CI;

export function getCountryCenter(code: string): CountryCenter {
  return countryCenters[code] || defaultCenter;
}
