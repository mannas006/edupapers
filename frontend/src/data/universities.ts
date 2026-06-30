import type { University, SearchableSubject } from '../types';

const defaultLogo = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-20 h-20 text-gray-400">
  <path d="M2 3h20v6H2z" />
  <path d="M4 9v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
  <path d="M10 13h4" />
  <path d="M10 17h4" />
</svg>
`;

export const universities: University[] = [
  {
    id: '8',
    name: 'Maulana Abul Kalam Azad University of Technology (MAKAUT)',
    shortName: 'MAKAUT',
    logo: 'https://upload.wikimedia.org/wikipedia/en/3/37/Maulana_Abul_Kalam_Azad_University_of_Technology_Logo.svg',
    courses: [
      { id: '21', name: 'B.Tech', semesters: 8, subjects: {} },
      { id: '22', name: 'M.Tech', semesters: 4, subjects: {} },
      { id: '23', name: 'BCA', semesters: 6, subjects: {} },
      { id: '24', name: 'MCA', semesters: 4, subjects: {} },
      { id: '25', name: 'MBA', semesters: 4, subjects: {} },
      { id: '26', name: 'BBA', semesters: 6, subjects: {} },
      { id: '27', name: 'B.Sc', semesters: 6, subjects: {} },
      { id: '28', name: 'BA', semesters: 6, subjects: {} },
      { id: '29', name: 'B.Pharm', semesters: 8, subjects: {} },
      { id: '30', name: 'M.Sc', semesters: 4, subjects: {} },
      { id: '31', name: 'BHM', semesters: 8, subjects: {} },
      { id: '32', name: 'BHSM', semesters: 6, subjects: {} },
      { id: '33', name: 'BIRM', semesters: 6, subjects: {} },
      { id: '34', name: 'BMS', semesters: 6, subjects: {} },
      { id: '35', name: 'BNS', semesters: 6, subjects: {} },
      { id: '36', name: 'BOPTM', semesters: 8, subjects: {} },
      { id: '37', name: 'BSCM', semesters: 6, subjects: {} },
      { id: '38', name: 'BSM', semesters: 6, subjects: {} },
      { id: '39', name: 'BTTM', semesters: 8, subjects: {} },
      { id: '40', name: 'CHE', semesters: 6, subjects: {} },
      { id: '41', name: 'MHA', semesters: 4, subjects: {} },
      { id: '42', name: 'B.Arch', semesters: 10, subjects: {} },
      { id: '43', name: 'MHMCT', semesters: 4, subjects: {} },
      { id: '44', name: 'MMA', semesters: 4, subjects: {} },
      { id: '45', name: 'MMS', semesters: 4, subjects: {} },
      { id: '46', name: 'M.Pharm', semesters: 4, subjects: {} },
      { id: '47', name: 'M.Phil', semesters: 4, subjects: {} },
      { id: '48', name: 'HM', semesters: 6, subjects: {} },
      { id: '49', name: 'PBIR', semesters: 4, subjects: {} },
      { id: '50', name: 'PGDGI', semesters: 2, subjects: {} }
    ]
  }
];

// Flatten the data for easier searching (fallback to empty list since we resolve search items dynamically from crawled database)
export const allSearchableSubjects: SearchableSubject[] = [];
