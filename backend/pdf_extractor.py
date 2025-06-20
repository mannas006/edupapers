import os
import logging
from typing import List, Dict
import fitz  # PyMuPDF
import re
import pytesseract
from PIL import Image
import io

logger = logging.getLogger(__name__)

class PDFExtractor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.logger = logger

    def extract_questions(self) -> List[Dict]:
        """Extract questions from PDF using OCR if needed."""
        try:
            # First try direct text extraction
            doc = fitz.open(self.pdf_path)
            text = ""
            
            # Check if we can extract text directly
            for page in doc:
                page_text = page.get_text()
                if page_text.strip():
                    text += page_text
            
            # If no text found, use OCR
            if not text.strip():
                self.logger.info("No text found, using OCR extraction...")
                text = self._extract_text_with_ocr(doc)
            else:
                self.logger.info(f"Direct text extraction successful, extracted {len(text)} characters")
            
            doc.close()
            
            if not text.strip():
                self.logger.warning("No text could be extracted from PDF")
                return []
            
            # Log a sample of the extracted text for debugging
            self.logger.debug(f"Sample extracted text (first 500 chars): {text[:500]}")
            
            # Parse questions from text
            questions = self._parse_text_for_questions(text)
            self.logger.info(f"Extracted {len(questions)} questions from PDF.")
            
            # Log question summary
            if questions:
                self.logger.info("Question extraction summary:")
                for q in questions[:3]:  # Log first 3 questions for verification
                    self.logger.info(f"  {q.get('group', 'Unknown')} Q{q.get('question_number', '?')}: {q.get('text', '')[:100]}...")
            
            return questions
            
        except Exception as e:
            self.logger.error(f"Failed to extract questions from PDF: {e}")
            return []

    def _extract_text_with_ocr(self, doc) -> str:
        """Extract text using OCR from PDF images."""
        all_text = ""
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Convert page to image
            mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better OCR
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # OCR the image
            try:
                image = Image.open(io.BytesIO(img_data))
                page_text = pytesseract.image_to_string(image, lang='eng')
                all_text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
                self.logger.info(f"OCR extracted {len(page_text)} characters from page {page_num + 1}")
            except Exception as e:
                self.logger.warning(f"OCR failed for page {page_num + 1}: {e}")
        
        return all_text

    def _parse_text_for_questions(self, text: str) -> List[Dict]:
        """Parse questions from extracted text according to group structure."""
        questions = []
        
        # Clean the text first - remove unwanted content
        cleaned_text = self._clean_pdf_text(text)
        
        # Split text into sections by groups
        group_a_section = self._extract_section(cleaned_text, "Group-A", "Group-B")
        group_b_section = self._extract_section(cleaned_text, "Group-B", "Group-C")
        group_c_section = self._extract_section(cleaned_text, "Group-C", "END OF PAPER")
        
        # Parse each group
        if group_a_section:
            questions.extend(self._parse_group_a_mcqs(group_a_section))
        
        if group_b_section:
            questions.extend(self._parse_group_b_short_answer(group_b_section))
        
        if group_c_section:
            questions.extend(self._parse_group_c_long_answer(group_c_section))
        
        return questions

    def _clean_pdf_text(self, text: str) -> str:
        """Clean PDF text by removing unwanted content."""
        # List of patterns to remove
        unwanted_patterns = [
            r'Group-A\s*\(Very Short Answer Type Question\)',
            r'Group-B\s*\([^)]+\)',
            r'Group-C\s*\([^)]+\)',
            r'Answer any ten of the following\s*:?',
            r'Answer any \w+ of the following\s*:?',
            r'\[\s*\d+\s*x\s*\d+\s*=\s*\d+\s*\]',
            r'End of paper',
            r'END OF PAPER',
            r'Time\s*:\s*\d+\s*hours?',
            r'Marks?\s*:\s*\d+',
            r'Maximum Marks?\s*:\s*\d+',
            r'Full Marks?\s*:\s*\d+',
            r'Instructions?\s*:',
            r'Note\s*:',
            r'Attempt any \w+ questions?',
            r'All questions? are compulsory',
            r'Page\s*\d+\s*of\s*\d+',
            r'Question Paper Code\s*:',
            r'Roll No\.?\s*:',
            r'Name\s*:',
            r'Subject\s*:',
            r'Course\s*:',
            r'Semester\s*:',
            r'Date\s*:',
            r'Duration\s*:'
        ]
        
        cleaned_text = text
        for pattern in unwanted_patterns:
            cleaned_text = re.sub(pattern, '', cleaned_text, flags=re.IGNORECASE)
        
        # Remove extra whitespace
        cleaned_text = re.sub(r'\n\s*\n', '\n\n', cleaned_text)
        cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
        
        return cleaned_text

    def _extract_section(self, text: str, start_marker: str, end_marker: str) -> str:
        """Extract text between two markers with improved detection."""
        # More flexible pattern matching for group markers
        start_patterns = [
            start_marker,
            start_marker.replace('-', ''),
            start_marker.replace('-', ' '),
            start_marker.upper(),
            start_marker.lower(),
            r'Group\s*-?\s*A.*?Question\)'  # Special pattern for "Group-A (Very Short Answer Type Question)"
        ]
        
        start_pos = -1
        for pattern in start_patterns:
            if start_marker == "Group-A" and pattern == r'Group\s*-?\s*A.*?Question\)':
                # Use regex search for this pattern
                match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if match:
                    start_pos = match.start()
                    break
            else:
                pos = text.find(pattern)
                if pos != -1:
                    start_pos = pos
                    break
        
        if start_pos == -1:
            self.logger.debug(f"Could not find start marker '{start_marker}' in text")
            return text  # Return full text if no start marker found
        
        # Find the actual start of questions (after the group header and instructions)
        section_start = text[start_pos:]
        
        # Skip past common instruction patterns to get to actual questions
        question_start_patterns = [
            r'(?:Answer any \w+ of the following\s*:?)',
            r'(?:\[\s*\d+\s*x\s*\d+\s*=\s*\d+\s*\])',
            r'(?:Very Short Answer Type Question\s*)',
            r'(?:Short Answer Type Question\s*)',
            r'(?:Long Answer Type Question\s*)'
        ]
        
        for pattern in question_start_patterns:
            match = re.search(pattern, section_start, re.IGNORECASE)
            if match:
                section_start = section_start[match.end():]
        
        # Now find the end marker
        end_patterns = [
            end_marker,
            end_marker.replace('-', ''),
            end_marker.replace('-', ' '),
            end_marker.upper(),
            end_marker.lower()
        ]
        
        end_pos = -1
        for pattern in end_patterns:
            pos = section_start.find(pattern)
            if pos != -1:
                end_pos = pos
                break
        
        if end_pos == -1:
            result = section_start.strip()
        else:
            result = section_start[:end_pos].strip()
        
        self.logger.debug(f"Extracted {start_marker} section: {len(result)} characters")
        return result

    def _parse_group_a_mcqs(self, section: str) -> List[Dict]:
        """Parse Group A MCQs from actual PDF text with improved cleaning and flexible parsing."""
        questions = []
        
        # Log the section we're working with for debugging
        self.logger.debug(f"Parsing Group-A section ({len(section)} chars):")
        self.logger.debug(f"First 1000 chars: {section[:1000]}")
        
        # Additional cleaning specific to Group A
        cleaned_section = section
        
        # Remove any remaining unwanted text patterns
        unwanted_in_section = [
            r'Group\s*-?\s*A.*?Question\)',
            r'Answer any \w+ of the following\s*:?',
            r'\[\s*\d+\s*x\s*\d+\s*=\s*\d+\s*\]',
            r'Choose the correct option',
            r'Select the correct answer',
            r'Tick the correct option',
            r'The Figures in the margin indicate full marks',
            r'Candidate are required to give their answers',
            r'Time Allotted\s*:\s*\d+\s*Hours',
            r'Full Marks\s*:\s*\d+',
            r'Paper Code\s*:',
            r'UPID\s*:',
            r'MAULANA ABUL KALAM AZAD UNIVERSITY',
            r'CS/B\.TECH',
            r'Computer Networks',
            r'---\s*Page\s*\d+\s*---'
        ]
        
        for pattern in unwanted_in_section:
            cleaned_section = re.sub(pattern, '', cleaned_section, flags=re.IGNORECASE | re.DOTALL)
        
        self.logger.debug(f"After cleaning ({len(cleaned_section)} chars):")
        self.logger.debug(f"First 500 chars: {cleaned_section[:500]}")
        
        # Try multiple parsing strategies
        questions = self._parse_strategy_numbered(cleaned_section)
        
        # If that didn't work, try parsing by sentences/paragraphs
        if not questions:
            self.logger.debug("Numbered strategy failed, trying sentence-based parsing...")
            questions = self._parse_strategy_sentences(cleaned_section)
        
        # If still no questions, try a more aggressive line-by-line approach
        if not questions:
            self.logger.debug("Sentence strategy failed, trying line-by-line parsing...")
            questions = self._parse_strategy_lines(cleaned_section)
        
        self.logger.info(f"Successfully parsed {len(questions)} questions from Group-A")
        return questions
    
    def _parse_strategy_numbered(self, section: str) -> List[Dict]:
        """Parse questions using numbered format (1., 2., etc.)"""
        questions = []
        lines = section.split('\n')
        current_question = ""
        current_options = []
        question_count = 0
        in_question = False
        
        for line in lines:
            line = line.strip()
            if not line or len(line) < 3:
                continue
            
            # Look for question numbers with various formats
            question_patterns = [
                r'^(\d+)\.\s*(.+)',     # 1. Question text
                r'^(\d+)\)\s*(.+)',     # 1) Question text
                r'^\((\d+)\)\s*(.+)',   # (1) Question text
                r'^Q\.?\s*(\d+)\s*[.:]?\s*(.+)'  # Q.1 Question text or Q1: 
            ]
            
            found_question = False
            for pattern in question_patterns:
                match = re.match(pattern, line, re.IGNORECASE)
                if match:
                    # Save previous question if we have one
                    if current_question and question_count < 10:
                        questions.append({
                            'group': 'Group-A',
                            'question_number': question_count + 1,
                            'type': 'MCQ',
                            'text': current_question.strip(),
                            'options': current_options
                        })
                        question_count += 1
                    
                    # Start new question
                    question_num = match.group(1)
                    question_text = match.group(2)
                    current_question = question_text
                    current_options = []
                    in_question = True
                    found_question = True
                    
                    self.logger.debug(f"Found question {question_num}: {question_text[:100]}")
                    break
            
            if found_question:
                continue
            
            # Look for options with various formats
            option_patterns = [
                r'^[\(\)]*[a-dA-D][\)\(]\s*(.+)',  # a) text or (a) text
                r'^[a-dA-D][.:\-]\s*(.+)',        # a. text or a: text
                r'^\([a-dA-D]\)\s*(.+)',          # (a) text
                r'^[a-dA-D]\s+(.+)'               # a text (space separated)
            ]
            
            if in_question:
                found_option = False
                for pattern in option_patterns:
                    match = re.match(pattern, line, re.IGNORECASE)
                    if match and len(match.group(1).strip()) > 2:
                        current_options.append(line)
                        self.logger.debug(f"Found option: {line}")
                        found_option = True
                        break
                
                # If not an option and we're in a question, add to question text
                if not found_option and len(line) > 5:
                    # Don't add if it looks like a new question
                    if not any(re.match(p, line, re.IGNORECASE) for p in question_patterns):
                        current_question += " " + line
        
        # Don't forget the last question
        if current_question and question_count < 10 and len(current_question.strip()) > 10:
            questions.append({
                'group': 'Group-A',
                'question_number': question_count + 1,
                'type': 'MCQ',
                'text': current_question.strip(),
                'options': current_options
            })
        
        # If we still didn't find questions, try a more aggressive approach
        if not questions:
            self.logger.debug("No questions found with standard approach, trying alternative parsing...")
            
            # Remove everything before the first numbered item
            text_after_instructions = section  # Use the original section parameter
            first_number_match = re.search(r'\d+\.\s*', text_after_instructions)
            if first_number_match:
                text_after_instructions = text_after_instructions[first_number_match.start():]
                
                # Split by question numbers
                question_parts = re.split(r'(\d+)\.\s*', text_after_instructions)
                
                for i in range(1, len(question_parts), 2):
                    if i + 1 < len(question_parts):
                        question_num = question_parts[i]
                        question_text = question_parts[i + 1].strip()
                        
                        if len(question_text) > 10:  # Only meaningful questions
                            # Extract options from the question text
                            options = []
                            option_matches = re.findall(r'[\(\)]*[a-dA-D][\)\(]\s*([^\n\r]+)', question_text)
                            for opt in option_matches:
                                options.append(opt.strip())
                            
                            # Clean question text (remove options)
                            clean_text = re.sub(r'[\(\)]*[a-dA-D][\)\(]\s*[^\n\r]+', '', question_text)
                            clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                            
                            if clean_text and len(clean_text) > 5:
                                questions.append({
                                    'group': 'Group-A',
                                    'question_number': len(questions) + 1,
                                    'type': 'MCQ',
                                    'text': clean_text,
                                    'options': options
                                })
                                
                                if len(questions) >= 10:
                                    break
        
        self.logger.info(f"Successfully parsed {len(questions)} questions from Group-A")
        return questions

    def _parse_group_b_short_answer(self, section: str) -> List[Dict]:
        """Parse Group B short answer questions from actual PDF text."""
        questions = []
        
        # Parse actual questions from the PDF text
        question_pattern = r'(?:Question\s*)?Q?(\d+)[\:\.]?\s*(.+?)(?=(?:Question\s*)?Q?\d+[\:\.]|$)'
        matches = re.findall(question_pattern, section, re.DOTALL | re.IGNORECASE)
        
        for i, (q_num, question_text) in enumerate(matches[:5], 1):  # Limit to 5 questions
            question_text = re.sub(r'\s+', ' ', question_text.strip())
            
            if question_text:
                questions.append({
                    'group': 'Group-B',
                    'question_number': i,
                    'type': 'Short Answer',
                    'text': question_text,
                    'options': []
                })
        
        return questions

    def _parse_group_c_long_answer(self, section: str) -> List[Dict]:
        """Parse Group C long answer questions from actual PDF text."""
        questions = []
        
        # Parse actual questions from the PDF text
        question_pattern = r'(?:Question\s*)?Q?(\d+)[\:\.]?\s*(.+?)(?=(?:Question\s*)?Q?\d+[\:\.]|$)'
        matches = re.findall(question_pattern, section, re.DOTALL | re.IGNORECASE)
        
        for i, (q_num, question_text) in enumerate(matches[:5], 1):  # Limit to 5 questions
            question_text = re.sub(r'\s+', ' ', question_text.strip())
            
            if question_text:
                questions.append({
                    'group': 'Group-C',
                    'question_number': i,
                    'type': 'Long Answer',
                    'text': question_text,
                    'options': []
                })
        
        return questions

    def _is_group_marker(self, line: str) -> bool:
        line_clean = line.strip().lower().replace('-', ' ').replace('_', ' ')
        return (
            'group a' in line_clean or
            'group b' in line_clean or
            'group c' in line_clean
        )

    def extract_to_csv(self, output_path: str) -> None:
        """Extract questions and save to CSV file."""
        questions = self.extract_questions()
        
        # Create CSV data
        import csv
        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['group', 'question_number', 'type', 'text', 'options']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for question in questions:
                # Convert options list to string
                options_str = ' | '.join(question.get('options', []))
                question_copy = question.copy()
                question_copy['options'] = options_str
                writer.writerow(question_copy)
        
        self.logger.info(f"Extracted {len(questions)} questions to {output_path}")
    
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass
    
    def _parse_strategy_sentences(self, section: str) -> List[Dict]:
        """Parse questions by looking for sentence patterns."""
        questions = []
        
        # Look for question-like sentences (ending with ?)
        sentences = re.split(r'[.!?]+', section)
        
        for i, sentence in enumerate(sentences):
            sentence = sentence.strip()
            if len(sentence) > 20 and '?' in sentence:
                # This might be a question
                questions.append({
                    'group': 'Group-A',
                    'question_number': len(questions) + 1,
                    'type': 'MCQ',
                    'text': sentence.strip(),
                    'options': []
                })
                
                if len(questions) >= 10:
                    break
        
        return questions
    
    def _parse_strategy_lines(self, section: str) -> List[Dict]:
        """Parse questions by examining each line for meaningful content."""
        questions = []
        lines = section.split('\n')
        
        for line in lines:
            line = line.strip()
            # Look for lines that might be questions
            if (len(line) > 15 and  # Reasonable length
                any(char in line for char in '?.:') and  # Has punctuation
                not line.isupper() and  # Not all caps (likely not header)
                not re.match(r'^[a-dA-D][\)\(]', line)):  # Not an option
                
                questions.append({
                    'group': 'Group-A',
                    'question_number': len(questions) + 1,
                    'type': 'MCQ',
                    'text': line,
                    'options': []
                })
                
                if len(questions) >= 10:
                    break
        
        return questions