const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const startUrl = 'https://www.makaut.com/';
const outputFilePath = path.join(__dirname, '../frontend/src/data/makaut_papers.ts');

const visitedIndexes = new Set();
const queue = [startUrl];
const papersMap = new Map(); // key: pdfUrl, value: Paper object

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}. Status code: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Normalizes relative URLs to absolute
function resolveUrl(base, relative) {
  try {
    return new URL(relative, base).href;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log('Starting comprehensive crawl of makaut.com...');
  
  while (queue.length > 0) {
    const currentUrl = queue.shift();
    if (visitedIndexes.has(currentUrl)) continue;
    visitedIndexes.add(currentUrl);
    
    console.log(`Crawling index page [${visitedIndexes.size} visited, ${queue.length} in queue]: ${currentUrl}`);
    
    try {
      const html = await fetchUrl(currentUrl);
      
      // 1. Find all links on the page
      // Match href="something"
      const hrefRegex = /href="([^"]+)"/gi;
      let hrefMatch;
      
      while ((hrefMatch = hrefRegex.exec(html)) !== null) {
        const rawUrl = hrefMatch[1].trim();
        const resolved = resolveUrl(currentUrl, rawUrl);
        if (!resolved) continue;
        
        const parsedResolved = new URL(resolved);
        
        // Only crawl same-domain links
        if (parsedResolved.hostname !== 'www.makaut.com' && parsedResolved.hostname !== 'makaut.com') {
          continue;
        }
        
        // Remove hash / queries for normalization
        parsedResolved.hash = '';
        parsedResolved.search = '';
        const normalizedUrl = parsedResolved.href;
        
        // Distinguish between index pages and individual paper pages
        if (normalizedUrl.includes('/papers/')) {
          // This is a paper link! We extract paper info from it directly
          // Format is usually: https://www.makaut.com/papers/filename.html or .pdf
          const matchPaperName = /\/papers\/([^/]+)$/i.exec(normalizedUrl);
          if (matchPaperName) {
            const filename = matchPaperName[1];
            if (filename.endsWith('.html') || filename.endsWith('.pdf')) {
              const baseName = filename.replace(/\.(html|pdf)$/i, '');
              const pdfUrl = `https://www.makaut.com/papers/${baseName}.pdf`;
            }
          }
        } else {
          // This is an index page (e.g. bca.html, btech-cse-question-papers.html, etc.)
          if (normalizedUrl.endsWith('.html') || normalizedUrl === 'https://www.makaut.com/' || normalizedUrl === 'https://makaut.com/') {
            if (!visitedIndexes.has(normalizedUrl) && !queue.includes(normalizedUrl)) {
              queue.push(normalizedUrl);
            }
          }
        }
      }
      
      // 2. Extract papers from this index page
      // Match pattern like: <a href="[anything]papers/[filename].html" ...> [Title] </a>
      // Or sometimes directly ending in .pdf
      const paperRegex = /href="([^"]*papers\/([^"]+\.(html|pdf)))"[^>]*>([\s\S]*?)<\/a>/gi;
      let paperMatch;
      
      while ((paperMatch = paperRegex.exec(html)) !== null) {
        const fullHref = paperMatch[1];
        const filename = paperMatch[2];
        const titleText = paperMatch[4].replace(/<[^>]+>/g, '').trim(); // strip HTML tags inside title
        
        const baseName = filename.replace(/\.(html|pdf)$/i, '');
        const pdfUrl = `https://www.makaut.com/papers/${baseName}.pdf`;
        
        if (papersMap.has(pdfUrl)) continue; // skip duplicates
        
        const parts = baseName.split('-');
        
        // Determine course
        let course = 'BTECH'; // Default
        const potentialCourse = parts[0].toUpperCase();
        const validCourses = [
          'BTECH', 'BBA', 'BCA', 'BSC', 'BA', 'BPHARM', 'MBA', 'MCA', 'MSC', 'MTECH', 
          'BHM', 'BHSM', 'BIRM', 'BMS', 'BNS', 'BOPTM', 'BSCM', 'BSM', 'BTTM', 'CHE', 
          'MHA', 'BARCH', 'MHMCT', 'MMA', 'MMS', 'MPHARM', 'MPHIL', 'HM', 'PBIR', 'PGDGI'
        ];
        if (validCourses.includes(potentialCourse)) {
          course = potentialCourse;
        } else {
          // Try to search course specifier in url path or name
          const foundCourse = validCourses.find(c => currentUrl.toLowerCase().includes(`/${c.toLowerCase()}.html`) || baseName.toLowerCase().startsWith(`${c.toLowerCase()}-`));
          if (foundCourse) {
            course = foundCourse;
          }
        }
        
        // Determine semester
        let semester = 1;
        const semIndex = parts.indexOf('sem');
        if (semIndex !== -1 && parts[semIndex - 1]) {
          semester = parseInt(parts[semIndex - 1], 10) || 1;
        }
        
        // Determine year
        let year = '2026';
        const lastPart = parts[parts.length - 1];
        if (lastPart && /^\d{4}$/.test(lastPart)) {
          year = lastPart;
        } else if (parts[parts.length - 2] && /^\d{4}$/.test(parts[parts.length - 2])) {
          year = parts[parts.length - 2];
        }
        
        // Determine subject code (e.g. mic101, bcac102, es-ee101, etc.)
        let code = '';
        const codeRegex = /^[a-z]{2,4}\d{3,4}[a-z]?$/i;
        const compoundCodeRegex = /^[a-z]{2,3}-[a-z]{2,4}\d{3,4}$/i;
        const simplePartRegex = /^[a-z]{3,4}-\d{3}$/i; // e.g. bca-102
        
        for (let i = 0; i < parts.length; i++) {
          if (codeRegex.test(parts[i])) {
            code = parts[i].toUpperCase();
            break;
          }
          if (i < parts.length - 1 && compoundCodeRegex.test(`${parts[i]}-${parts[i+1]}`)) {
            code = `${parts[i]}-${parts[i+1]}`.toUpperCase();
            break;
          }
          if (i < parts.length - 1 && simplePartRegex.test(`${parts[i]}-${parts[i+1]}`)) {
            code = `${parts[i]}-${parts[i+1]}`.toUpperCase();
            break;
          }
        }
        
        papersMap.set(pdfUrl, {
          id: baseName,
          title: titleText,
          pdfUrl,
          course,
          semester,
          code: code || 'GENERIC',
          year
        });
      }
      
    } catch (err) {
      console.error(`Error crawling ${currentUrl}:`, err.message);
    }
    
    // Polite delay
    await sleep(100);
  }
  
  const papers = Array.from(papersMap.values());
  console.log(`\nCrawl finished! Discovered ${visitedIndexes.size} index pages.`);
  console.log(`Found ${papers.length} unique MAKAUT question papers.`);
  
  // Sort papers for consistency
  papers.sort((a, b) => a.id.localeCompare(b.id));
  
  const tsContent = `export interface MakautPaper {
  id: string;
  title: string;
  pdfUrl: string;
  course: string;
  semester: number;
  code: string;
  year: string;
}

export const makautPapers: MakautPaper[] = ${JSON.stringify(papers, null, 2)};
`;

  fs.writeFileSync(outputFilePath, tsContent, 'utf8');
  console.log(`Successfully wrote ${papers.length} papers to ${outputFilePath}`);
}

run();
