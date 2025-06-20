#!/usr/bin/env python3
"""
Test script to debug PDF extraction and Supabase storage
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_supabase_connection():
    """Test Supabase connection and check tables"""
    try:
        from supabase_integration import SupabaseQuestionManager
        
        logger.info("Testing Supabase connection...")
        
        # Check environment variables
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')
        
        logger.info(f"SUPABASE_URL: {supabase_url[:50]}..." if supabase_url else "SUPABASE_URL: Not set")
        logger.info(f"SUPABASE_KEY: {'Set' if supabase_key else 'Not set'}")
        
        # Initialize manager
        manager = SupabaseQuestionManager(supabase_url, supabase_key)
        
        # Test connection by trying to query the questions table
        try:
            test_query = manager.supabase.table('questions').select('id').limit(1).execute()
            logger.info("✅ Successfully connected to Supabase and 'questions' table exists")
            logger.info(f"Query result: {test_query.data}")
        except Exception as e:
            logger.error(f"❌ Failed to query 'questions' table: {e}")
            
            # Try querying papers table instead
            try:
                test_query = manager.supabase.table('papers').select('id').limit(1).execute()
                logger.info("✅ Successfully connected to Supabase and 'papers' table exists")
                logger.info("⚠️  But 'questions' table doesn't exist - this might be the issue!")
            except Exception as e2:
                logger.error(f"❌ Failed to query 'papers' table too: {e2}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Supabase connection test failed: {e}")
        return False

def test_pdf_extraction():
    """Test PDF extraction with OCR"""
    try:
        # Check if tesseract is available
        import pytesseract
        version = pytesseract.get_tesseract_version()
        logger.info(f"✅ Tesseract OCR available: {version}")
        
        # Check if PyMuPDF is available
        import fitz
        logger.info(f"✅ PyMuPDF available: {fitz.version}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ PDF extraction libraries test failed: {e}")
        return False

def test_gemini_api():
    """Test Gemini API connection"""
    try:
        gemini_key = os.getenv('GEMINI_API_KEY')
        if not gemini_key:
            logger.error("❌ GEMINI_API_KEY not found in environment")
            return False
            
        logger.info("✅ GEMINI_API_KEY is set")
        
        # Try to import and initialize Gemini client
        from gemini_client import GeminiClient
        logger.info("✅ Gemini client module loaded successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Gemini API test failed: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("🧪 Starting EduPapers PDF Processing Debug Tests")
    logger.info("=" * 60)
    
    tests = [
        ("Supabase Connection", test_supabase_connection),
        ("PDF Extraction Libraries", test_pdf_extraction),
        ("Gemini API", test_gemini_api)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        logger.info(f"\n🔍 Testing: {test_name}")
        logger.info("-" * 40)
        results[test_name] = test_func()
    
    # Summary
    logger.info("\n📊 TEST SUMMARY")
    logger.info("=" * 60)
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    if all_passed:
        logger.info("\n🎉 All tests passed! PDF processing should work correctly.")
    else:
        logger.info("\n⚠️  Some tests failed. Check the errors above to fix the issues.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
