import os
import json
import logging
from typing import Dict, List, Optional, Any
import google.generativeai as genai  # type: ignore
from tqdm import tqdm
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self, pdf_path: str):
        """Initialize Gemini client with API key from environment."""
        self.pdf_path = pdf_path
        load_dotenv()
        api_key = os.getenv('GEMINI_API_KEY')
        logger.debug(f"Loaded GEMINI_API_KEY: {'set' if api_key else 'NOT SET'}")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    def analyze_question(self, question: str, max_retries: int = 3) -> str:
        """Analyze a single question using Gemini API."""
        prompt = f"""Please analyze and answer the following question in a clear and concise manner:

{question}

Provide a well-structured response that directly addresses the question."""

        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                return response.text or "No response generated"
            except Exception as e:
                if attempt == max_retries - 1:
                    error_msg = f"Error analyzing question: {str(e)}"
                    logger.error(f"Failed to analyze question after {max_retries} attempts: {e}")
                    return error_msg
                logger.warning(f"Attempt {attempt + 1} failed, retrying...")
                continue
        
        return "Failed to analyze question after all retries"  # Fallback return

    def process_questions(self, questions: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Process questions with Gemini and return answers."""
        logger.info(f"Processing {len(questions)} questions with Gemini")
        results = []
        
        # Process each question with progress bar
        for idx, question in enumerate(tqdm(questions, desc="Analyzing questions")):
            try:
                # Use index as fallback for number
                number = question.get('number', f"Q{idx+1}")
                group = question.get('group', '')
                text = question.get('text', '')
                options = question.get('options', [])
                options_str = ''
                if options:
                    options_str = '\nOptions:\n' + '\n'.join(options)
                formatted_question = f"{group}\nQuestion {number}:\n{text}{options_str}"
                
                # Get answer from Gemini
                response = self.model.generate_content(
                    f"""Please provide a detailed answer to the following question. 
                    Format your response with clear sections and bullet points where appropriate.
                    If the question has multiple parts, address each part separately.
                    
                    Question:
                    {formatted_question}
                    
                    Answer:"""
                )
                
                # Format the result with question and answer on separate lines
                result = {
                    "question": formatted_question,
                    "answer": response.text.strip() if hasattr(response, 'text') and response.text else "No response generated"
                }
                results.append(result)
                
            except Exception as e:
                logger.error(f"Error processing question: {str(e)}")
                results.append({
                    "question": formatted_question if 'formatted_question' in locals() else str(question),
                    "answer": f"Error processing question: {str(e)}"
                })
        
        # Save results to JSON with pretty formatting
        if results:
            output_file = os.path.join('output', f"{os.path.splitext(os.path.basename(self.pdf_path))[0]}_answers.json")
            with open(output_file, 'w') as f:
                json.dump(results, f, indent=2)
            logger.info(f"Saved {len(results)} results to {output_file}")
        
        return results

    def save_results(self, results: List[Dict[str, str]], output_path: str) -> None:
        """Save results to a JSON file."""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved {len(results)} results to {output_path}") 