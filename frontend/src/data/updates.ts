export interface CollegeUpdate {
  id: string;
  title: string;
  description: string;
  category: 'Urgent' | 'Academic' | 'Exams' | 'Results';
  date: string;
  source: string;
  link?: string;
}

export const collegeUpdates: CollegeUpdate[] = [
  {
    id: 'update-1',
    title: 'MAKAUT Odd Semester Exam Form Fill-up 2026',
    description: 'The online portal for submission of exam forms for BBA, BCA, B.Tech odd semester students will open on July 5, 2026. Make sure to clear all semester fees beforehand.',
    category: 'Exams',
    date: 'June 30, 2026',
    source: 'MAKAUT Exam Cell',
    link: 'https://makautexam.net'
  },
  {
    id: 'update-2',
    title: 'BCA 1st Year digital electronics solution guides released',
    description: 'Solution sets for digital electronics past years (2020-2024) have been compiled and verified by educators. Check the subject page to download PDFs directly.',
    category: 'Academic',
    date: 'June 29, 2026',
    source: 'EduPapers Academic Team'
  },
  {
    id: 'update-3',
    title: 'Even Semester 2026 Examination Results Out',
    description: 'Results for B.Tech CSE/ECE/IT 8th Semester and MCA 4th Semester exams held in May 2026 are now available on the official result portal. Click to verify your SGPA/YGPA.',
    category: 'Results',
    date: 'June 28, 2026',
    source: 'MAKAUT Controller of Exams',
    link: 'https://makautexam.net'
  },
  {
    id: 'update-4',
    title: 'Syllabus Revision Notice: BBA MIC101',
    description: 'Minor syllabus adjustments for BBA 1st sem Minor paper "Computer Fundamental" (MIC101) have been published. Topic additions include fundamental cloud concepts.',
    category: 'Urgent',
    date: 'June 25, 2026',
    source: 'MAKAUT Board of Studies'
  },
  {
    id: 'update-5',
    title: 'MAKAUT Convocation Ceremony Dates Announced',
    description: 'The annual convocation ceremony for the graduating batch of 2025 will be held in August. Registration begins online on July 10.',
    category: 'Academic',
    date: 'June 20, 2026',
    source: 'Registrar Office'
  }
];
