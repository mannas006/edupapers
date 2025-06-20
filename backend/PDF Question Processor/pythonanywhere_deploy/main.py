#!/usr/bin/env python3
import os
import argparse
import logging
from pathlib import Path
from typing import Optional
import sys
try:
    from dotenv import load_dotenv
except ImportError:
    logging.warning("dotenv not installed, GOOGLE_API_KEY must be set manually.")
    load_dotenv = lambda: None

from pdf_extractor import PDFExtractor
from gemini_client import GeminiClient

logging.basicConfig(level=logging.INFO)
logging.getLogger("pdf_extractor").setLevel(logging.DEBUG)

logger = logging.getLogger(__name__)

# Load .env file and log the GOOGLE_API_KEY status
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
logging.debug("GEMINI_API_KEY read from .env: {0}".format("set" if api_key else "NOT SET"))

def setup_directories() -> tuple[Path, Path]:
    """Create necessary directories if they don't exist."""
    temp_dir = Path("temp")
    output_dir = Path("output")
    
    temp_dir.mkdir(exist_ok=True)
    output_dir.mkdir(exist_ok=True)
    
    return temp_dir, output_dir

def process_pdf(
    pdf_path: str,
    api_key: Optional[str] = None,
    temp_dir: Optional[Path] = None,
    output_dir: Optional[Path] = None
) -> None:
    """Process a PDF file through the entire pipeline."""
    # Setup directories
    temp_dir, output_dir = setup_directories()
    
    # Generate output paths
    pdf_name = Path(pdf_path).stem
    temp_csv = temp_dir / f"{pdf_name}_questions.csv"
    output_json = output_dir / f"{pdf_name}_answers.json"
    
    try:
        # Step 1: Extract questions from PDF
        logger.info(f"Starting extraction from {pdf_path}")
        with PDFExtractor(pdf_path) as extractor:
            extractor.extract_to_csv(str(temp_csv))
        
        # Step 2: Process questions with Gemini
        logger.info("Initializing Gemini client")
        client = GeminiClient(pdf_path)
        
        # Read questions from CSV
        import pandas as pd
        df = pd.read_csv(temp_csv)
        questions = df['question'].tolist()
        
        # Step 3: Get answers from Gemini
        logger.info("Processing questions with Gemini")
        results = client.process_questions(questions)
        
        # Step 4: Save results
        logger.info("Saving results")
        client.save_results(results, str(output_json))
        
        logger.info(f"Pipeline completed successfully. Results saved to {output_json}")
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise
    finally:
        # Cleanup temporary files
        if temp_csv.exists():
            temp_csv.unlink()

def main():
    if len(sys.argv) != 2:
        print("Usage: python main.py <pdf_file>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    if not os.path.exists(pdf_path):
        print(f"Error: File {pdf_path} does not exist")
        sys.exit(1)
    
    try:
        # Setup directories
        setup_directories()
        
        # Extract questions from PDF
        logger.info(f"Starting extraction from {pdf_path}")
        extractor = PDFExtractor(pdf_path)
        questions = extractor.extract_questions()
        
        if not questions:
            logger.error("No questions extracted from PDF")
            sys.exit(1)
        
        # Process questions with Gemini
        logger.info("Initializing Gemini client")
        client = GeminiClient(pdf_path)
        logger.info("Processing questions with Gemini")
        results = client.process_questions(questions)
        
        # Save results
        logger.info("Saving results")
        if results:
            logger.info(f"Pipeline completed successfully. Results saved to output/{os.path.splitext(os.path.basename(pdf_path))[0]}_answers.json")
        else:
            logger.error("No results generated")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Error in pipeline: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 