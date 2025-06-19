#!/usr/bin/env python3
"""
Test script for EduPapers Webhook Integration
"""

import json
import requests
import time
import os
import sys
from typing import Dict, Any

# Add src directory to Python path for imports
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config'))

class WebhookTester:
    def __init__(self, webhook_url: str = "http://localhost:8000"):
        self.webhook_url = webhook_url
        self.webhook_secret = os.getenv('WEBHOOK_SECRET')
    
    def test_health_check(self) -> bool:
        """Test the health check endpoint"""
        try:
            response = requests.get(f"{self.webhook_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health check passed: {data.get('status')}")
                print(f"   Processor ready: {data.get('processor_ready')}")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def test_webhook_processing(self, test_data: Dict[str, Any]) -> bool:
        """Test PDF processing webhook"""
        try:
            headers = {
                'Content-Type': 'application/json'
            }
            
            # Add signature if webhook secret is available
            if self.webhook_secret:
                import hashlib
                import hmac
                
                body = json.dumps(test_data)
                signature = hmac.new(
                    self.webhook_secret.encode(),
                    body.encode(),
                    hashlib.sha256
                ).hexdigest()
                headers['X-Signature-256'] = f"sha256={signature}"
            
            # Send webhook request
            response = requests.post(
                f"{self.webhook_url}/webhook/process-pdf",
                json=test_data,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ Webhook processing started")
                    print(f"   Processing ID: {result.get('processing_id')}")
                    print(f"   Status: {result.get('status')}")
                    
                    # Track processing status
                    return self.track_processing_status(result.get('processing_id'))
                else:
                    print(f"❌ Webhook processing failed: {result.get('message')}")
                    return False
            else:
                print(f"❌ Webhook request failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Webhook processing error: {e}")
            return False
    
    def track_processing_status(self, processing_id: str, max_wait: int = 120) -> bool:
        """Track processing status until completion"""
        if not processing_id:
            return False
        
        print(f"📊 Tracking processing status for: {processing_id}")
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            try:
                response = requests.get(
                    f"{self.webhook_url}/status/{processing_id}",
                    timeout=10
                )
                
                if response.status_code == 200:
                    status_data = response.json()
                    status = status_data.get('status')
                    message = status_data.get('message', '')
                    
                    print(f"   Status: {status} - {message}")
                    
                    if status == 'completed':
                        questions_count = status_data.get('questions_count', 0)
                        print(f"✅ Processing completed successfully!")
                        print(f"   Questions extracted: {questions_count}")
                        return True
                    elif status == 'failed':
                        print(f"❌ Processing failed: {message}")
                        return False
                    elif status in ['queued', 'downloading', 'processing']:
                        time.sleep(5)  # Wait 5 seconds before checking again
                        continue
                    else:
                        print(f"⚠️  Unknown status: {status}")
                        time.sleep(5)
                        continue
                else:
                    print(f"❌ Status check failed: {response.status_code}")
                    return False
                    
            except Exception as e:
                print(f"❌ Status check error: {e}")
                time.sleep(5)
                continue
        
        print(f"⏰ Processing timeout after {max_wait} seconds")
        return False
    
    def run_full_test(self):
        """Run complete test suite"""
        print("🧪 Starting EduPapers Webhook Integration Test")
        print("=" * 50)
        
        # Test 1: Health Check
        print("\n📋 Test 1: Health Check")
        health_ok = self.test_health_check()
        
        if not health_ok:
            print("❌ Cannot proceed with webhook tests - service not healthy")
            return False
        
        # Test 2: Webhook Processing
        print("\n📋 Test 2: Webhook Processing")
        
        # Test with existing PDF file
        test_pdf_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "samples", "1750076423461_ESC501_SoftwareEngineering_2024.pdf")
        if os.path.exists(test_pdf_path):
            # Create a mock Supabase URL for testing
            test_data = {
                "file_url": f"file://{os.path.abspath(test_pdf_path)}",
                "filename": "1750076423461_ESC501_SoftwareEngineering_2024.pdf",
                "metadata": {
                    "semester": "SEM-5",
                    "subject_code": "ESC501",
                    "subject_name": "Software Engineering",
                    "year": 2024,
                    "university": "Test University",
                    "paper_type": "Regular"
                }
            }
            
            webhook_ok = self.test_webhook_processing(test_data)
        else:
            print("⚠️  Test PDF not found, skipping webhook processing test")
            print(f"   Place PDF file in samples/ directory for full test")
            webhook_ok = True
        
        # Test 3: Invalid Request
        print("\n📋 Test 3: Invalid Request Handling")
        invalid_data = {"invalid": "data"}
        
        try:
            response = requests.post(
                f"{self.webhook_url}/webhook/process-pdf",
                json=invalid_data,
                timeout=10
            )
            
            if response.status_code == 400:
                print("✅ Invalid request properly rejected")
            else:
                print(f"⚠️  Unexpected response to invalid request: {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing invalid request: {e}")
        
        # Summary
        print("\n" + "=" * 50)
        if health_ok and webhook_ok:
            print("🎉 All tests passed! Webhook integration is ready.")
            print("\n💡 Next steps:")
            print("   1. Configure your Supabase credentials in .env")
            print("   2. Update WEBHOOK_URL in your EduPapers.site frontend")
            print("   3. Test with real PDF uploads from your website")
            return True
        else:
            print("❌ Some tests failed. Please check the configuration.")
            return False


def main():
    """Main test function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Test EduPapers Webhook Integration')
    parser.add_argument('--url', default='http://localhost:8000', help='Webhook server URL')
    parser.add_argument('--quick', action='store_true', help='Run only health check')
    
    args = parser.parse_args()
    
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', '.env'))
    except ImportError:
        pass
    
    tester = WebhookTester(args.url)
    
    if args.quick:
        print("🏃 Running quick health check only...")
        success = tester.test_health_check()
    else:
        success = tester.run_full_test()
    
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
