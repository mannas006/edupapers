import type { MakautPaper } from '../data/makaut_papers';

export const cleanSubjectName = (paper: MakautPaper | { title: string; course: string; code: string; year: string; semester: number }) => {
  let title = paper.title.toUpperCase();
  const course = paper.course.toUpperCase();
  const code = paper.code.toUpperCase();
  const year = paper.year;
  const sem = paper.semester;

  // Remove course name like "BARCH-", "MCA-", "BTECH-" from start
  if (title.startsWith(`${course}-`)) {
    title = title.substring(course.length + 1);
  }

  // Remove semester reference if it's there, e.g. "1-SEM-", "SEM-1-", "1SEM-"
  title = title.replace(new RegExp(`^${sem}-SEM-`, 'i'), '');
  title = title.replace(new RegExp(`^SEM-${sem}-`, 'i'), '');
  title = title.replace(new RegExp(`^${sem}SEM-`, 'i'), '');

  // Remove year suffix
  title = title.replace(new RegExp(`-${year}$`, 'i'), '');

  // Remove code if not generic
  if (code !== 'GENERIC') {
    title = title.replace(new RegExp(`-${code}`, 'g'), '');
    title = title.replace(new RegExp(`${code}-`, 'g'), '');
    title = title.replace(new RegExp(code, 'g'), '');
  }

  // Remove generic semester tags
  title = title.replace(/^(1|2|3|4|5|6|7|8|9|10)-SEM-/i, '');
  title = title.replace(/-SEM-(1|2|3|4|5|6|7|8|9|10)/i, '');
  title = title.replace(/-SEM-/i, '-');

  // Remove leftover years (e.g. -2011, -2015, etc.)
  title = title.replace(/-(20|19)\d{2}$/, '');

  let tokens = title.split('-');
  const filterList = ['SEM', 'SEMESTER', 'GENERIC', 'YEAR', course];
  const codeSegmentRegex = /^(hu|cs|mca|bca|m|ph|me|ee|ec|ce|ch|arch|bba|mba|math|cse|it|ece|eee|bme|aeie|ft|ap|ch|bs|hs|es|pc|pe|oe|mc)$/i;

  tokens = tokens.filter(t => {
    t = t.trim();
    if (!t) return false;
    if (filterList.includes(t.toUpperCase())) return false;
    if (/^\d{3,4}$/.test(t)) return false;
    if (codeSegmentRegex.test(t)) return false;
    return true;
  });

  let cleanName = tokens.join(' ').toLowerCase();
  cleanName = cleanName.replace(/\s+/g, ' ').trim();
  cleanName = cleanName.replace(/\b\w/g, (l) => l.toUpperCase());

  if (!cleanName) {
    cleanName = paper.title.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  return cleanName;
};

export const getSubjectSlug = (courseName: string, semester: number, subjectName: string) => {
  const normalizedCourse = courseName.toUpperCase().replace(/[^A-Z0-9]/g, '').toLowerCase();
  const normalizedSubject = subjectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${normalizedCourse}-${semester}-sem-${normalizedSubject}`;
};
