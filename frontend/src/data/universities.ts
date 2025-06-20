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
        id: '1',
        name: 'University of Calcutta (CU)',
        shortName: 'CU',
        logo: 'https://upload.wikimedia.org/wikipedia/en/f/f0/University_of_Calcutta_logo.svg',
        courses: [
          { id: '1', name: 'B.Tech', semesters: 8, subjects: {
              1: [
                { question: 'Test Subject 1', type: 'Theory', year: '2023-2024' },
                { question: 'Test Subject 2', type: 'Theory', year: '2023-2024' },
                { question: 'Test Subject 3', type: 'Theory', year: '2023-2024' },
                { question: 'Test Subject 4', type: 'Theory', year: '2023-2024' },
                { question: 'Test Subject 5', type: 'Theory', year: '2023-2024' },
                { question: 'Test Subject 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '2', name: 'M.Tech', semesters: 4, subjects: {
              1: [
                { question: 'Advanced Topics 1', type: 'Theory', year: '2023-2024' },
                { question: 'Advanced Topics 2', type: 'Theory', year: '2023-2024' },
                { question: 'Advanced Topics 3', type: 'Theory', year: '2023-2024' },
                { question: 'Advanced Topics 4', type: 'Theory', year: '2023-2024' },
                { question: 'Advanced Topics 5', type: 'Theory', year: '2023-2024' },
                { question: 'Advanced Topics 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '3', name: 'BCA', semesters: 6, subjects: {
              1: [
                { question: 'BCA Subject A', type: 'Theory', year: '2023-2024' },
                { question: 'BCA Subject B', type: 'Theory', year: '2023-2024' },
                { question: 'BCA Subject C', type: 'Theory', year: '2023-2024' },
                { question: 'BCA Subject D', type: 'Theory', year: '2023-2024' },
                { question: 'BCA Subject E', type: 'Theory', year: '2023-2024' },
                { question: 'BCA Subject F', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '4', name: 'MCA', semesters: 4, subjects: {
              1: [
                { question: 'Design and Analysis of Algorithms', type: 'Theory', year: '2023-2024' },
                { question: 'Mathematical Foundations', type: 'Theory', year: '2023-2024' },
                { question: 'Advanced Database Management Systems', type: 'Theory', year: '2023-2024' },
                { question: 'Theory of Computation', type: 'Theory', year: '2023-2024' },
                { question: 'Advanced Computer Architecture', type: 'Theory', year: '2023-2024' },
                { question: 'Algorithm Design Laboratory', type: 'Practical', year: '2023-2024' },
                { question: 'Advanced Database Management and Web Design Laboratory', type: 'Practical', year: '2023-2024' },
                { question: 'Internet Technologies Laboratory', type: 'Practical', year: '2023-2024' },
                { question: 'Soft Skills', type: 'Sessional', year: '2023-2024' },
              ],
              2: [
                { question: 'Advanced Networking', type: 'Theory', year: '2023-2024' },
                { question: 'Machine Learning', type: 'Theory', year: '2023-2024' },
                { question: 'Software Engineering', type: 'Theory', year: '2023-2024' },
                { question: 'Economics and Accountancy', type: 'Theory', year: '2023-2024' },
                { question: 'Elective I: Distributed Systems and Cloud Computing', type: 'Elective', year: '2023-2024' },
                { question: 'Elective I: Blockchain Technology', type: 'Elective', year: '2023-2024' },
                { question: 'Elective I: Mobile Computing', type: 'Elective', year: '2023-2024' },
                { question: 'Elective I: Digital Marketing', type: 'Elective', year: '2023-2024' },
                { question: 'Advanced Networking Laboratory', type: 'Practical', year: '2023-2024' },
                { question: 'Machine Learning Laboratory', type: 'Practical', year: '2023-2024' },
                { question: 'Software Engineering Laboratory / Seminar I (Group A / Group B)', type: 'Practical/Sessional', year: '2023-2024' },
                { question: 'Environmental Science', type: 'Theory', year: '2023-2024' },
              ],
              3: [
                { question: 'Data Science', type: 'Theory', year: '2023-2024' },
                { question: 'Cryptography and Network Security', type: 'Theory', year: '2023-2024' },
                { question: 'IoT and Embedded Systems', type: 'Theory', year: '2023-2024' },
                { question: 'Elective II: Quantum Computing', type: 'Elective', year: '2023-2024' },
                { question: 'Elective II: High Performance Computing', type: 'Elective', year: '2023-2024' },
                { question: 'Elective II: VLSI', type: 'Elective', year: '2023-2024' },
                { question: 'Elective II: Real-Time Systems', type: 'Elective', year: '2023-2024' },
                { question: 'Elective III: Computer Vision', type: 'Elective', year: '2023-2024' },
                { question: 'Elective III: Deep Learning', type: 'Elective', year: '2023-2024' },
                { question: 'Elective III: Natural Language Processing', type: 'Elective', year: '2023-2024' },
                { question: 'Elective III: Computational Biology', type: 'Elective', year: '2023-2024' },
                { question: 'Data Science Laboratory', type: 'Practical', year: '2023-2024' },
                { question: 'IoT and Embedded Systems Laboratory / Seminar II (Group A / Group B)', type: 'Practical/Sessional', year: '2023-2024' },
                { question: 'Mini Project', type: 'Sessional', year: '2023-2024' },
                { question: 'Ethics & Values and Cyber Law', type: 'Theory', year: '2023-2024' },
              ],
              4: [
                { question: 'Project', type: 'Sessional', year: '2023-2024' },
                { question: 'Journal Study', type: 'Sessional', year: '2023-2024' },
                { question: 'Grand Viva Voce', type: 'Sessional', year: '2023-2024' },
              ]
            }
          },
          { id: '5', name: 'MBA', semesters: 4, subjects: {
              1: [
                { question: 'MBA Subject P', type: 'Theory', year: '2023-2024' },
                { question: 'MBA Subject Q', type: 'Theory', year: '2023-2024' },
                { question: 'MBA Subject R', type: 'Theory', year: '2023-2024' },
                { question: 'MBA Subject S', type: 'Theory', year: '2023-2024' },
                { question: 'MBA Subject T', type: 'Theory', year: '2023-2024' },
                { question: 'MBA Subject U', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
        ]
      },
      {
        id: '2',
        name: 'Jadavpur University (JU)',
        shortName: 'JU',
        logo: 'https://upload.wikimedia.org/wikipedia/en/5/58/Jadavpur_University_Logo.svg',
        courses: [
          { id: '6', name: 'B.Tech', semesters: 8, subjects: {
              1: [
                { question: 'JU BTech Subject 1', type: 'Theory', year: '2023-2024' },
                { question: 'JU BTech Subject 2', type: 'Theory', year: '2023-2024' },
                { question: 'JU BTech Subject 3', type: 'Theory', year: '2023-2024' },
                { question: 'JU BTech Subject 4', type: 'Theory', year: '2023-2024' },
                { question: 'JU BTech Subject 5', type: 'Theory', year: '2023-2024' },
                { question: 'JU BTech Subject 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '7', name: 'M.Tech', semesters: 4, subjects: {
              1: [
                { question: 'JU MTech Subject A', type: 'Theory', year: '2023-2024' },
                { question: 'JU MTech Subject B', type: 'Theory', year: '2023-2024' },
                { question: 'JU MTech Subject C', type: 'Theory', year: '2023-2024' },
                { question: 'JU MTech Subject D', type: 'Theory', year: '2023-2024' },
                { question: 'JU MTech Subject E', type: 'Theory', year: '2023-2024' },
                { question: 'JU MTech Subject F', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '8', name: 'MCA', semesters: 4, subjects: {
              1: [
                { question: 'JU MCA Subject X', type: 'Theory', year: '2023-2024' },
                { question: 'JU MCA Subject Y', type: 'Theory', year: '2023-2024' },
                { question: 'JU MCA Subject Z', type: 'Theory', year: '2023-2024' },
                { question: 'JU MCA Subject W', type: 'Theory', year: '2023-2024' },
                { question: 'JU MCA Subject V', type: 'Theory', year: '2023-2024' },
                { question: 'JU MCA Subject U', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '9', name: 'MBA', semesters: 4, subjects: {
              1: [
                { question: 'JU MBA Subject P', type: 'Theory', year: '2023-2024' },
                { question: 'JU MBA Subject Q', type: 'Theory', year: '2023-2024' },
                { question: 'JU MBA Subject R', type: 'Theory', year: '2023-2024' },
                { question: 'JU MBA Subject S', type: 'Theory', year: '2023-2024' },
                { question: 'JU MBA Subject T', type: 'Theory', year: '2023-2024' },
                { question: 'JU MBA Subject U', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
        ]
      },
      {
        id: '3',
        name: 'Institute of Engineering and Management (IEM)',
        shortName: 'IEM',
        logo: 'https://iem.edu.in/app/themes/iem-group-wp-theme/resources/logo.png',
        courses: [
          { id: '10', name: 'B.Tech', semesters: 8, subjects: {
              1: [
                { question: 'IEM BTech Subject 1', type: 'Theory', year: '2023-2024' },
                { question: 'IEM BTech Subject 2', type: 'Theory', year: '2023-2024' },
                { question: 'IEM BTech Subject 3', type: 'Theory', year: '2023-2024' },
                { question: 'IEM BTech Subject 4', type: 'Theory', year: '2023-2024' },
                { question: 'IEM BTech Subject 5', type: 'Theory', year: '2023-2024' },
                { question: 'IEM BTech Subject 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '11', name: 'M.Tech', semesters: 4, subjects: {
              1: [
                { question: 'IEM MTech Subject A', type: 'Theory', year: '2023-2024' },
                { question: 'IEM MTech Subject B', type: 'Theory', year: '2023-2024' },
                { question: 'IEM MTech Subject C', type: 'Theory', year: '2023-2024' },
                { question: 'IEM MTech Subject D', type: 'Theory', year: '2023-2024' },
                { question: 'IEM MTech Subject E', type: 'Theory', year: '2023-2024' },
                { question: 'IEM MTech Subject F', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '12', name: 'MCA', semesters: 4, subjects: {
              1: [
                { question: 'Programming Fundamentals and Object Oriented Concepts', type: 'Theory', year: '2023-2024' },
                { question: 'Mathematical Foundations', type: 'Theory', year: '2023-2024' },
                { question: 'Management Information Systems', type: 'Theory', year: '2023-2024' },
                { question: 'Digital Systems', type: 'Theory', year: '2023-2024' },
                { question: 'Graph Theory and Combinatorics', type: 'Theory', year: '2023-2024' },
                { question: 'Computer Programming Lab', type: 'Practical', year: '2023-2024' },
                { question: 'Digital Systems Lab', type: 'Practical', year: '2023-2024' },
                { question: 'Communication Skills and Language Lab', type: 'Practical', year: '2023-2024' },
              ],
              2: [
                { question: 'Data Structures and Algorithms', type: 'Theory', year: '2023-2024' },
                { question: 'Advanced Programming with Java and Python', type: 'Theory', year: '2023-2024' },
                { question: 'Computer Organization and Architecture', type: 'Theory', year: '2023-2024' },
                { question: 'Operating Systems', type: 'Theory', year: '2023-2024' },
                { question: 'Database Management Systems', type: 'Theory', year: '2023-2024' },
                { question: 'Data Structures and Algorithms Lab', type: 'Practical', year: '2023-2024' },
                { question: 'Operating Systems Lab', type: 'Practical', year: '2023-2024' },
                { question: 'Database Management Systems Lab', type: 'Practical', year: '2023-2024' },
                { question: 'Advanced Programming Lab', type: 'Practical', year: '2023-2024' },
              ],
              3: [
                { question: 'Software Engineering', type: 'Theory', year: '2023-2024' },
                { question: 'Automata and Language Processors', type: 'Theory', year: '2023-2024' },
                { question: 'Data Communication and Computer Networks', type: 'Theory', year: '2023-2024' },
                { question: 'Elective-I: Artificial Intelligence and Applications', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-I: Machine Learning', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-I: Pattern Recognition', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-I: Introduction to Data Science', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-I: Optimization Techniques', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-I: Soft Computing', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-II: Distributed Computing', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-II: Internet of Things (IoT)', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-II: Network Security', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-II: Web Technologies', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-II: Software Project Management', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-II: Microprocessors and Embedded Systems', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-III: Computer Graphics', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-III: Computer Vision', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-III: Bioinformatics', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-III: Information Retrieval', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-III: Natural Language Processing', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-III: Multimedia', type: 'Elective', year: '2023-2024' },
                { question: 'Elective-III: Biometric Systems', type: 'Elective', year: '2023-2024' },
                { question: 'Software Engineering Lab', type: 'Practical', year: '2023-2024' },
                { question: 'Data Communication and Computer Networks Lab', type: 'Practical', year: '2023-2024' },
              ],
              4: [
                { question: 'Seminar', type: 'Sessional', year: '2023-2024' },
                { question: 'Project', type: 'Sessional', year: '2023-2024' },
              ]
            }
          },

          { id: '13', name: 'MBA', semesters: 4, subjects: {
              1: [
                { question: 'Quantitative Techniques', type: 'Theory', year: '2023-2024' },
                { question: 'Indian Ethos and Business Ethics', type: 'Theory', year: '2023-2024' },
                { question: 'Legal and Business Environment (Micro and Macro)', type: 'Theory', year: '2023-2024' },
                { question: 'Business Communication', type: 'Theory', year: '2023-2024' },
                { question: 'Organizational Behaviour', type: 'Theory', year: '2023-2024' },
                { question: 'Managerial Economics (Micro)', type: 'Theory', year: '2023-2024' }
              ],
            }
          }
        ]
      },
        {
        id: '4',
        name: 'Visva-Bharati University',
        shortName: 'VBU',
        logo: 'https://upload.wikimedia.org/wikipedia/en/a/a8/Visva-Bharati_University_Logo.svg',
        courses: [
          { id: '14', name: 'B.Tech', semesters: 8, subjects: {
              1: [
                { question: 'VBU BTech Subject 1', type: 'Theory', year: '2023-2024' },
                { question: 'VBU BTech Subject 2', type: 'Theory', year: '2023-2024' },
                { question: 'VBU BTech Subject 3', type: 'Theory', year: '2023-2024' },
                { question: 'VBU BTech Subject 4', type: 'Theory', year: '2023-2024' },
                { question: 'VBU BTech Subject 5', type: 'Theory', year: '2023-2024' },
                { question: 'VBU BTech Subject 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '15', name: 'M.Tech', semesters: 4, subjects: {
              1: [
                { question: 'VBU MTech Subject A', type: 'Theory', year: '2023-2024' },
                { question: 'VBU MTech Subject B', type: 'Theory', year: '2023-2024' },
                { question: 'VBU MTech Subject C', type: 'Theory', year: '2023-2024' },
                { question: 'VBU MTech Subject D', type: 'Theory', year: '2023-2024' },
                { question: 'VBU MTech Subject E', type: 'Theory', year: '2023-2024' },
                { question: 'VBU MTech Subject F', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
        ]
      },
      {
        id: '8',
        name: 'Maulana Abul Kalam Azad University of Technology (MAKAUT)',
        shortName: 'MAKAUT',
        logo: 'https://upload.wikimedia.org/wikipedia/en/3/37/Maulana_Abul_Kalam_Azad_University_of_Technology_Logo.svg',
        courses: [
          { id: '21', name: 'B.Tech', semesters: 8, subjects: {
              1: [
                { question: 'MAKAUT BTech Subject 1', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT BTech Subject 2', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT BTech Subject 3', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT BTech Subject 4', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT BTech Subject 5', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT BTech Subject 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '22', name: 'M.Tech', semesters: 4, subjects: {
              1: [
                { question: 'MAKAUT MTech Subject A', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT MTech Subject B', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT MTech Subject C', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT MTech Subject D', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT MTech Subject E', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT MTech Subject F', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '23', name: 'BCA', semesters: 8, subjects: {
            1: [
              { question: 'Programming for Problem Solving', type: 'Theory', year: '2023-2024' },
              { question: 'Digital Electronics', type: 'Theory', year: '2023-2024' },
              { question: 'Principles of Management', type: 'Theory', year: '2023-2024' },
              { question: 'Generic Elective (GE)', type: 'Theory', year: '2023-2024' },
              { question: 'English & Professional Communication', type: 'Theory', year: '2023-2024' },
              { question: 'Life Skills & Personality Development', type: 'Theory', year: '2023-2024' },
              { question: 'Yoga/Health & Wellness/Sports/Physical Fitness and Wellness/Community Services', type: 'Theory', year: '2023-2024' },
            ],
            2: [
              { question: 'Computer Architecture', type: 'Theory', year: '2023-2024' },
              { question: 'Basics of Web Design Using HTML, CSS, JavaScript', type: 'Theory', year: '2023-2024' },
              { question: 'Organization Behaviour / Business Ethics & Corporate Governance', type: 'Theory', year: '2023-2024' },
              { question: 'Generic Elective (GE)', type: 'Theory', year: '2023-2024' },
              { question: 'Modern Indian Languages and Literature', type: 'Theory', year: '2023-2024' },
              { question: 'IT Tools for Business / Monetizing Social Media or Design Thinking', type: 'Theory', year: '2023-2024' },
              { question: 'Critical Thinking / NSS / Mental Health / Environmental Studies', type: 'Theory', year: '2023-2024' },
            ],
            3: [
              { question: 'Python Programming', type: 'Theory', year: '2023-2024' },
              { question: 'Data Structure Through C', type: 'Theory', year: '2023-2024' },
              { question: 'Principles of Marketing / Business & Sustainability', type: 'Theory', year: '2023-2024' },
              { question: 'Generic Elective (GE)', type: 'Theory', year: '2023-2024' },
              { question: 'The Constitution, Human Rights, and Law', type: 'Theory', year: '2023-2024' },
              { question: 'Understanding Basics of Cyber Security', type: 'Theory', year: '2023-2024' },
            ],
            4: [
              { question: 'Database Management System (DBMS)', type: 'Theory', year: '2023-2024' },
              { question: 'Operating System', type: 'Theory', year: '2023-2024' },
              { question: 'Software Engineering', type: 'Theory', year: '2023-2024' },
              { question: 'Human Resource Management / Corporate Social Responsibility (CSR)', type: 'Theory', year: '2023-2024' },
              { question: 'Society, Culture, and Human Behavior / Universal Human Values (UHV)', type: 'Theory', year: '2023-2024' },
              { question: 'Sales and Distribution Management / E-Commerce', type: 'Theory', year: '2023-2024' },
            ],
            5: [
              { question: 'PHP with MySQL', type: 'Theory', year: '2023-2024' },
              { question: 'Object-Oriented Programming with Java', type: 'Theory', year: '2023-2024' },
              { question: 'Financial Management', type: 'Theory', year: '2023-2024' },
              { question: 'Internship', type: 'Practical', year: '2023-2024' },
              { question: 'Entrepreneurship', type: 'Theory', year: '2023-2024' },
            ],
            6: [
              { question: 'Advanced Java with Web Application', type: 'Theory', year: '2023-2024' },
              { question: 'Unix and Shell Programming', type: 'Theory', year: '2023-2024' },
              { question: 'Networking', type: 'Theory', year: '2023-2024' },
              { question: 'Customer Relationship Management', type: 'Theory', year: '2023-2024' },
              { question: 'Career Planning and Management / Managing Workplace Diversity', type: 'Theory', year: '2023-2024' },
            ],
            7: [
              { question: 'Data Mining & Data Warehousing / Machine Learning / Pattern Recognition', type: 'Theory', year: '2023-2024' },
              { question: 'Cyber Security', type: 'Theory', year: '2023-2024' },
              { question: 'Research Methodology', type: 'Theory', year: '2023-2024' },
              { question: 'Consumer Behavior / Exploring Business Opportunity', type: 'Theory', year: '2023-2024' },
              { question: 'Strategic Management / Intellectual Property Rights', type: 'Theory', year: '2023-2024' },
            ],
            8: [
              { question: 'Blockchain Technology / Cloud Computing', type: 'Theory', year: '2023-2024' },
              { question: 'Statistical Programming with R Programming / Data Analysis with Python', type: 'Theory', year: '2023-2024' },
              { question: 'Research Project', type: 'Practical', year: '2023-2024' },
            ]
          } },
          { id: '24', name: 'MCA', semesters: 4, subjects: {
            1: [
              { question: 'Programming Concept with Python', type: 'Theory', year: '2023-2024' },
              { question: 'Relational Database Management System', type: 'Theory', year: '2023-2024' },
              { question: 'Computer Organization and Architecture', type: 'Theory', year: '2023-2024' },
              { question: 'Discrete Mathematics', type: 'Theory', year: '2023-2024' },
              { question: 'Environment and Ecology', type: 'Elective I', year: '2023-2024' },
              { question: 'Management Accounting', type: 'Elective I', year: '2023-2024' },
              { question: 'Constitution of India', type: 'Elective I', year: '2023-2024' },
              { question: 'Stress Management through Yoga', type: 'Elective I', year: '2023-2024' },
              { question: 'Ethics in Business Profession', type: 'Elective I', year: '2023-2024' },
              { question: 'Managerial Economics', type: 'Elective I', year: '2023-2024' },
              { question: 'Soft Skill and Interpersonal Communication', type: 'Practical', year: '2023-2024' },
              { question: 'Python Programming Lab', type: 'Practical', year: '2023-2024' },
              { question: 'Relational Database Management System Lab', type: 'Practical', year: '2023-2024' },
            ],
            2: [
              { question: 'Data Structure with Python', type: 'Theory', year: '2023-2024' },
              { question: 'Operating System', type: 'Theory', year: '2023-2024' },
              { question: 'Object Oriented Programming with Java', type: 'Theory', year: '2023-2024' },
              { question: 'Networking', type: 'Theory', year: '2023-2024' },
              { question: 'Numerical and Statistical Analysis', type: 'Elective II', year: '2023-2024' },
              { question: 'Computer Graphics', type: 'Elective II', year: '2023-2024' },
              { question: 'Probability and Statistics', type: 'Elective II', year: '2023-2024' },
              { question: 'Introduction to Cyber Security', type: 'Elective II', year: '2023-2024' },
              { question: 'Introduction to IoT', type: 'Elective II', year: '2023-2024' },
              { question: 'Automata Theory and Computational Complexity', type: 'Elective II', year: '2023-2024' },
              { question: 'Data Structure Lab with Python', type: 'Practical', year: '2023-2024' },
              { question: 'Operating System Lab (Unix)', type: 'Practical', year: '2023-2024' },
              { question: 'Object Oriented Programming Lab using Java', type: 'Practical', year: '2023-2024' },
            ],
            3: [
              { question: 'Software Engineering using UML', type: 'Theory', year: '2023-2024' },
              { question: 'Artificial Intelligence', type: 'Theory', year: '2023-2024' },
              { question: 'Design and Analysis of Algorithm', type: 'Theory', year: '2023-2024' },
              { question: 'Image Processing', type: 'Elective III', year: '2023-2024' },
              { question: 'Web Enabled JAVA Programming', type: 'Elective III', year: '2023-2024' },
              { question: 'Cloud Computing', type: 'Elective III', year: '2023-2024' },
              { question: 'Web Technology using PHP', type: 'Elective III', year: '2023-2024' },
              { question: 'Android Application Development', type: 'Elective III', year: '2023-2024' },
              { question: 'Basic Data Science', type: 'Elective III', year: '2023-2024' },
              { question: 'Information Retrieval', type: 'Elective IV', year: '2023-2024' },
              { question: 'Data Warehousing and Data Mining', type: 'Elective IV', year: '2023-2024' },
              { question: 'Introduction to Big Data Analytics', type: 'Elective IV', year: '2023-2024' },
              { question: 'Graph Theory', type: 'Elective IV', year: '2023-2024' },
              { question: 'Operation Research and Optimization Techniques', type: 'Elective IV', year: '2023-2024' },
              { question: 'Pattern Recognition', type: 'Elective IV', year: '2023-2024' },
              { question: 'Machine Learning', type: 'Elective IV', year: '2023-2024' },
              { question: 'Elective III Lab', type: 'Practical & Sessional', year: '2023-2024' },
              { question: 'Minor Project and Viva-voce', type: 'Practical & Sessional', year: '2023-2024' },
            ],
            4: [
              { question: 'Open Elective (via NPTEL/SWAYAM)', type: 'Theory', year: '2023-2024' },
              { question: 'Comprehensive Viva-voce', type: 'Sessional', year: '2023-2024' },
              { question: 'Major Project and Viva-voce', type: 'Sessional', year: '2023-2024' },
            ]
          } },
          { id: '25', name: 'MBA', semesters: 4, subjects: {
              1: [
                { question: 'MAKAUT MBA Subject P', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT MBA Subject Q', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT MBA Subject R', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT MBA Subject S', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT MBA Subject T', type: 'Theory', year: '2023-2024' },
                { question: 'MAKAUT MBA Subject U', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
        ]
      },
        {
        id: '9',
        name: 'Aliah University',
        shortName: 'AU',
        logo: 'https://upload.wikimedia.org/wikipedia/en/4/45/Aliah_University_Logo.png',
        courses: [
          { id: '26', name: 'B.Tech', semesters: 8, subjects: {
              1: [
                { question: 'AU BTech Subject 1', type: 'Theory', year: '2023-2024' },
                { question: 'AU BTech Subject 2', type: 'Theory', year: '2023-2024' },
                { question: 'AU BTech Subject 3', type: 'Theory', year: '2023-2024' },
                { question: 'AU BTech Subject 4', type: 'Theory', year: '2023-2024' },
                { question: 'AU BTech Subject 5', type: 'Theory', year: '2023-2024' },
                { question: 'AU BTech Subject 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '27', name: 'M.Tech', semesters: 4, subjects: {
              1: [
                { question: 'AU MTech Subject A', type: 'Theory', year: '2023-2024' },
                { question: 'AU MTech Subject B', type: 'Theory', year: '2023-2024' },
                { question: 'AU MTech Subject C', type: 'Theory', year: '2023-2024' },
                { question: 'AU MTech Subject D', type: 'Theory', year: '2023-2024' },
                { question: 'AU MTech Subject E', type: 'Theory', year: '2023-2024' },
                { question: 'AU MTech Subject F', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '28', name: 'BCA', semesters: 8, subjects: {
              1: [
                { question: 'AU BCA Subject X', type: 'Theory', year: '2023-2024' },
                { question: 'AU BCA Subject Y', type: 'Theory', year: '2023-2024' },
                { question: 'AU BCA Subject Z', type: 'Theory', year: '2023-2024' },
                { question: 'AU BCA Subject W', type: 'Theory', year: '2023-2024' },
                { question: 'AU BCA Subject V', type: 'Theory', year: '2023-2024' },
                { question: 'AU BCA Subject U', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '29', name: 'MCA', semesters: 4, subjects: {
              1: [
                { question: 'AU MCA Subject P', type: 'Theory', year: '2023-2024' },
                { question: 'AU MCA Subject Q', type: 'Theory', year: '2023-2024' },
                { question: 'AU MCA Subject R', type: 'Theory', year: '2023-2024' },
                { question: 'AU MCA Subject S', type: 'Theory', year: '2023-2024' },
                { question: 'AU MCA Subject T', type: 'Theory', year: '2023-2024' },
                { question: 'AU MCA Subject U', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '30', name: 'MBA', semesters: 8, subjects: {
              1: [
                { question: 'AU MBA Subject 1', type: 'Theory', year: '2023-2024' },
                { question: 'AU MBA Subject 2', type: 'Theory', year: '2023-2024' },
                { question: 'AU MBA Subject 3', type: 'Theory', year: '2023-2024' },
                { question: 'AU MBA Subject 4', type: 'Theory', year: '2023-2024' },
                { question: 'AU MBA Subject 5', type: 'Theory', year: '2023-2024' },
                { question: 'AU MBA Subject 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
        ]
      },
      {
        id: '10',
        name: 'University of Burdwan',
        shortName: 'BU',
        logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/University_of_Burdwan_logo.png',
        courses: [
          { id: '31', name: 'B.Tech', semesters: 8, subjects: {
              1: [
                { question: 'BU BTech Subject 1', type: 'Theory', year: '2023-2024' },
                { question: 'BU BTech Subject 2', type: 'Theory', year: '2023-2024' },
                { question: 'BU BTech Subject 3', type: 'Theory', year: '2023-2024' },
                { question: 'BU BTech Subject 4', type: 'Theory', year: '2023-2024' },
                { question: 'BU BTech Subject 5', type: 'Theory', year: '2023-2024' },
                { question: 'BU BTech Subject 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '32', name: 'M.Tech', semesters: 4, subjects: {
              1: [
                { question: 'BU MTech Subject A', type: 'Theory', year: '2023-2024' },
                { question: 'BU MTech Subject B', type: 'Theory', year: '2023-2024' },
                { question: 'BU MTech Subject C', type: 'Theory', year: '2023-2024' },
                { question: 'BU MTech Subject D', type: 'Theory', year: '2023-2024' },
                { question: 'BU MTech Subject E', type: 'Theory', year: '2023-2024' },
                { question: 'BU MTech Subject F', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '33', name: 'BCA', semesters: 8, subjects: {
              1: [
                { question: 'BU BCA Subject X', type: 'Theory', year: '2023-2024' },
                { question: 'BU BCA Subject Y', type: 'Theory', year: '2023-2024' },
                { question: 'BU BCA Subject Z', type: 'Theory', year: '2023-2024' },
                { question: 'BU BCA Subject W', type: 'Theory', year: '2023-2024' },
                { question: 'BU BCA Subject V', type: 'Theory', year: '2023-2024' },
                { question: 'BU BCA Subject U', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '34', name: 'MCA', semesters: 4, subjects: {
              1: [
                { question: 'BU MCA Subject P', type: 'Theory', year: '2023-2024' },
                { question: 'BU MCA Subject Q', type: 'Theory', year: '2023-2024' },
                { question: 'BU MCA Subject R', type: 'Theory', year: '2023-2024' },
                { question: 'BU MCA Subject S', type: 'Theory', year: '2023-2024' },
                { question: 'BU MCA Subject T', type: 'Theory', year: '2023-2024' },
                { question: 'BU MCA Subject U', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '35', name: 'MBA', semesters: 8, subjects: {
              1: [
                { question: 'BU MBA Subject 1', type: 'Theory', year: '2023-2024' },
                { question: 'BU MBA Subject 2', type: 'Theory', year: '2023-2024' },
                { question: 'BU MBA Subject 3', type: 'Theory', year: '2023-2024' },
                { question: 'BU MBA Subject 4', type: 'Theory', year: '2023-2024' },
                { question: 'BU MBA Subject 5', type: 'Theory', year: '2023-2024' },
                { question: 'BU MBA Subject 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
        ]
      },
      {
        id: '12',
        name: 'Amity University Kolkata',
        shortName: 'AUK',
        logo: 'https://upload.wikimedia.org/wikipedia/en/f/ff/Amity_University_logo.png',
        courses: [
          { id: '41', name: 'B.Tech', semesters: 8, subjects: {
              1: [
                { question: 'AUK BTech Subject 1', type: 'Theory', year: '2023-2024' },
                { question: 'AUK BTech Subject 2', type: 'Theory', year: '2023-2024' },
                { question: 'AUK BTech Subject 3', type: 'Theory', year: '2023-2024' },
                { question: 'AUK BTech Subject 4', type: 'Theory', year: '2023-2024' },
                { question: 'AUK BTech Subject 5', type: 'Theory', year: '2023-2024' },
                { question: 'AUK BTech Subject 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '42', name: 'M.Tech', semesters: 4, subjects: {
              1: [
                { question: 'AUK MTech Subject A', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MTech Subject B', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MTech Subject C', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MTech Subject D', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MTech Subject E', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MTech Subject F', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '43', name: 'BCA', semesters: 8, subjects: {
              1: [
                { question: 'AUK BCA Subject X', type: 'Theory', year: '2023-2024' },
                { question: 'AUK BCA Subject Y', type: 'Theory', year: '2023-2024' },
                { question: 'AUK BCA Subject Z', type: 'Theory', year: '2023-2024' },
                { question: 'AUK BCA Subject W', type: 'Theory', year: '2023-2024' },
                { question: 'AUK BCA Subject V', type: 'Theory', year: '2023-2024' },
                { question: 'AUK BCA Subject U', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '44', name: 'MCA', semesters: 4, subjects: {
              1: [
                { question: 'AUK MCA Subject P', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MCA Subject Q', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MCA Subject R', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MCA Subject S', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MCA Subject T', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MCA Subject U', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
          { id: '45', name: 'MBA', semesters: 8, subjects: {
              1: [
                { question: 'AUK MBA Subject 1', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MBA Subject 2', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MBA Subject 3', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MBA Subject 4', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MBA Subject 5', type: 'Theory', year: '2023-2024' },
                { question: 'AUK MBA Subject 6', type: 'Theory', year: '2023-2024' }
              ],
            }
          },
        ]
      }
    ];

    // Flatten the data for easier searching
    export const allSearchableSubjects: SearchableSubject[] = universities.flatMap(uni =>
      uni.courses.flatMap(course => {
        const subjects = course.subjects || {};
        return Object.entries(subjects).flatMap(([semester, subjectList]) =>
          subjectList.map(subject => ({
            universityId: uni.id,
            universityName: uni.name,
            courseId: course.id,
            courseName: course.name,
            semester: parseInt(semester, 10),
            subjectName: subject.question,
          }))
        );
      })
    );
