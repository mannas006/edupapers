"""
Supabase Integration for EduPapers.site
Handles database operations for storing extracted questions
"""

import os
import logging
from typing import List, Dict, Optional
from datetime import datetime
import json

try:
    from supabase import create_client, Client
except ImportError:
    print("Installing supabase...")
    os.system("pip install supabase")
    from supabase import create_client, Client

logger = logging.getLogger(__name__)

class SupabaseQuestionManager:
    def __init__(self, supabase_url: str = None, supabase_key: str = None):
        self.supabase_url = supabase_url or os.getenv('SUPABASE_URL')
        self.supabase_key = supabase_key or os.getenv('SUPABASE_SERVICE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and Service Key must be provided")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
    def store_questions(self, questions: List[Dict], paper_metadata: Dict) -> bool:
        """
        Store extracted questions in Supabase questions table
        """
        try:
            # Parse paper metadata
            semester = paper_metadata.get('semester', '')
            subject_code = paper_metadata.get('subject_code', '')
            subject_name = paper_metadata.get('subject_name', '')
            year = paper_metadata.get('year', datetime.now().year)
            university = paper_metadata.get('university', '')
            paper_type = paper_metadata.get('paper_type', 'Regular')
            
            # Prepare questions for insertion
            question_records = []
            
            for question in questions:
                # Map our question structure to database schema
                record = {
                    'semester': semester,
                    'subject_code': subject_code,
                    'subject_name': subject_name,
                    'year': int(year) if str(year).isdigit() else datetime.now().year,
                    'university': university,
                    'paper_type': paper_type,
                    'group_name': question.get('group', ''),
                    'question_number': question.get('question_number', 1),
                    'question_type': question.get('type', 'MCQ'),
                    'question_text': question.get('text', ''),
                    'options': json.dumps(question.get('options', [])) if question.get('options') else None,
                    'correct_answer': question.get('correct_answer', ''),
                    'explanation': question.get('explanation', ''),
                    'difficulty_level': question.get('difficulty', 'Medium'),
                    'marks': question.get('marks', 1),
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                }
                question_records.append(record)
            
            # Insert questions in batches
            batch_size = 50
            total_inserted = 0
            
            for i in range(0, len(question_records), batch_size):
                batch = question_records[i:i + batch_size]
                
                response = self.supabase.table('questions').insert(batch).execute()
                
                if response.data:
                    total_inserted += len(response.data)
                    logger.info(f"Inserted batch {i//batch_size + 1}: {len(response.data)} questions")
                else:
                    logger.error(f"Failed to insert batch {i//batch_size + 1}")
                    return False
            
            logger.info(f"Successfully stored {total_inserted} questions in database")
            return True
            
        except Exception as e:
            logger.error(f"Error storing questions in Supabase: {e}")
            return False
    
    def get_questions_by_semester(self, semester: str, subject_code: str = None) -> List[Dict]:
        """
        Retrieve questions by semester and optionally by subject
        """
        try:
            query = self.supabase.table('questions').select('*').eq('semester', semester)
            
            if subject_code:
                query = query.eq('subject_code', subject_code)
            
            response = query.execute()
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Error retrieving questions: {e}")
            return []
    
    def update_question_answer(self, question_id: int, answer: str, explanation: str = None) -> bool:
        """
        Update a question with AI-generated answer and explanation
        """
        try:
            update_data = {
                'correct_answer': answer,
                'updated_at': datetime.now().isoformat()
            }
            
            if explanation:
                update_data['explanation'] = explanation
            
            response = self.supabase.table('questions').update(update_data).eq('id', question_id).execute()
            
            return bool(response.data)
            
        except Exception as e:
            logger.error(f"Error updating question answer: {e}")
            return False
    
    def get_paper_metadata_from_filename(self, filename: str) -> Dict:
        """
        Extract metadata from PDF filename
        Expected format: SEMESTER_SUBJECTCODE_YEAR.pdf or similar
        """
        try:
            # Remove file extension
            base_name = filename.replace('.pdf', '').replace('.PDF', '')
            
            # Try to parse common filename patterns
            parts = base_name.split('_')
            
            metadata = {
                'semester': '',
                'subject_code': '',
                'subject_name': '',
                'year': datetime.now().year,
                'university': 'MAKAUT',  # Default for your site
                'paper_type': 'Regular'
            }
            
            if len(parts) >= 3:
                # Pattern: SEMESTER_SUBJECTCODE_YEAR
                if parts[0].upper().startswith('SEM'):
                    metadata['semester'] = parts[0]
                    metadata['subject_code'] = parts[1] if len(parts) > 1 else ''
                    
                    # Look for year
                    for part in parts:
                        if part.isdigit() and len(part) == 4:
                            metadata['year'] = int(part)
                            break
            
            # Try to extract from filename like "1750076423461_ESC501_SoftwareEngineering_2024"
            if 'ESC' in base_name or 'CSE' in base_name:
                for part in parts:
                    if part.startswith(('ESC', 'CSE', 'ECE', 'EE', 'ME')):
                        metadata['subject_code'] = part
                        break
                
                # Extract subject name
                subject_parts = [p for p in parts if not p.isdigit() and len(p) > 3 and p not in [metadata['subject_code']]]
                if subject_parts:
                    metadata['subject_name'] = ' '.join(subject_parts)
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error parsing filename metadata: {e}")
            return {
                'semester': '',
                'subject_code': '',
                'subject_name': '',
                'year': datetime.now().year,
                'university': 'MAKAUT',
                'paper_type': 'Regular'
            }
    
    def check_duplicate_paper(self, metadata: Dict) -> bool:
        """
        Check if a paper with similar metadata already exists
        """
        try:
            response = self.supabase.table('questions').select('id').eq('semester', metadata.get('semester', '')).eq('subject_code', metadata.get('subject_code', '')).eq('year', metadata.get('year', 0)).limit(1).execute()
            
            return len(response.data) > 0 if response.data else False
            
        except Exception as e:
            logger.error(f"Error checking for duplicates: {e}")
            return False


class EduPapersProcessor:
    """
    Main processor class for EduPapers.site integration
    """
    
    def __init__(self, supabase_url: str = None, supabase_key: str = None):
        self.db_manager = SupabaseQuestionManager(supabase_url, supabase_key)
        
    def process_uploaded_pdf(self, pdf_path: str, filename: str = None, metadata: Optional[Dict] = None) -> Dict:
        """
        Complete processing pipeline for uploaded PDF
        """
        try:
            from pdf_extractor import PDFExtractor
            from gemini_client import GeminiClient
            
            # Extract filename if not provided
            if not filename:
                filename = os.path.basename(pdf_path)
            
            # Get metadata from filename or use provided metadata
            if not metadata:
                metadata = self.db_manager.get_paper_metadata_from_filename(filename)
            else:
                # Merge with filename metadata if available
                filename_metadata = self.db_manager.get_paper_metadata_from_filename(filename)
                metadata = {**filename_metadata, **metadata}
            
            # Check for duplicates
            if self.db_manager.check_duplicate_paper(metadata):
                return {
                    'success': False,
                    'message': 'Paper already exists in database',
                    'metadata': metadata
                }
            
            # Extract questions from PDF
            logger.info(f"Processing PDF: {filename}")
            extractor = PDFExtractor(pdf_path)
            questions = extractor.extract_questions()
            
            if not questions:
                return {
                    'success': False,
                    'message': 'No questions found in PDF',
                    'metadata': metadata
                }
            
            # Store questions in database
            success = self.db_manager.store_questions(questions, metadata)
            
            if not success:
                return {
                    'success': False,
                    'message': 'Failed to store questions in database',
                    'metadata': metadata
                }
            
            # Optional: Generate AI answers (can be done asynchronously)
            try:
                gemini_client = GeminiClient(pdf_path)
                ai_results = gemini_client.process_questions(questions)
                
                # Update questions with AI answers
                # This could be done in background for better performance
                
            except Exception as e:
                logger.warning(f"AI processing failed: {e}")
                # Continue without AI answers
            
            return {
                'success': True,
                'message': f'Successfully processed {len(questions)} questions',
                'questions_count': len(questions),
                'metadata': metadata,
                'questions': questions
            }
            
        except Exception as e:
            logger.error(f"Error processing PDF: {e}")
            return {
                'success': False,
                'message': f'Processing failed: {str(e)}',
                'metadata': {}
            }


# Example usage and testing
if __name__ == "__main__":
    # Test the integration
    print("Testing EduPapers Supabase Integration...")
    
    # You'll need to set these environment variables
    # SUPABASE_URL=your_supabase_url
    # SUPABASE_SERVICE_KEY=your_service_key
    
    try:
        processor = EduPapersProcessor()
        
        # Test with existing PDF
        pdf_path = "1750076423461_ESC501_SoftwareEngineering_2024.pdf"
        if os.path.exists(pdf_path):
            result = processor.process_uploaded_pdf(pdf_path)
            print(f"Processing result: {result}")
        else:
            print("Test PDF not found")
            
    except Exception as e:
        print(f"Test failed: {e}")
        print("Make sure to set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables")
