#!/usr/bin/env python3
"""
Quick test script to verify PDF processor deployment
"""
import requests
import sys
import os

def test_health_endpoint(url):
    """Test if the health endpoint is working"""
    try:
        response = requests.get(f"{url}/health", timeout=10)
        if response.status_code == 200:
            print(f"✅ Health check passed: {url}")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check error: {e}")
        return False

def test_cors(url, origin):
    """Test CORS configuration"""
    try:
        headers = {
            'Origin': origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{url}/webhook/process-pdf", headers=headers, timeout=10)
        
        if 'Access-Control-Allow-Origin' in response.headers:
            print(f"✅ CORS configured correctly for {origin}")
            return True
        else:
            print(f"❌ CORS not configured for {origin}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ CORS test error: {e}")
        return False

def main():
    if len(sys.argv) != 2:
        print("Usage: python test_deployment.py <PDF_PROCESSOR_URL>")
        print("Example: python test_deployment.py https://your-app.railway.app")
        sys.exit(1)
    
    pdf_processor_url = sys.argv[1].rstrip('/')
    vercel_url = "https://edupapers-12ixy0e89-mannas006s-projects.vercel.app"
    
    print("🧪 Testing PDF Processor Deployment")
    print("=" * 50)
    
    # Test health endpoint
    health_ok = test_health_endpoint(pdf_processor_url)
    
    # Test CORS
    cors_ok = test_cors(pdf_processor_url, vercel_url)
    
    print("\n📊 Test Results:")
    print(f"Health Check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"CORS Setup: {'✅ PASS' if cors_ok else '❌ FAIL'}")
    
    if health_ok and cors_ok:
        print("\n🎉 All tests passed! Your PDF processor is ready.")
        print(f"\n📋 Next steps:")
        print(f"1. Add this to Vercel environment variables:")
        print(f"   VITE_WEBHOOK_URL={pdf_processor_url}/webhook/process-pdf")
        print(f"2. Redeploy your Vercel app")
        print(f"3. Test PDF upload functionality")
    else:
        print("\n⚠️  Some tests failed. Check your deployment configuration.")
        
        if not health_ok:
            print("- Health check failed: Check if your app is running and accessible")
        if not cors_ok:
            print(f"- CORS failed: Add '{vercel_url}' to ALLOWED_ORIGINS environment variable")

if __name__ == "__main__":
    main()
