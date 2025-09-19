#!/usr/bin/env python3
"""
Critical Tests Runner for Jupiter SIEM
Runs essential tests that must pass before deployment
"""
import subprocess
import sys
import os
import time
from datetime import datetime

class CriticalTestRunner:
    def __init__(self):
        self.test_results = {}
        self.start_time = time.time()
        self.critical_tests = [
            "tests/unit/test_auth.py",
            "tests/unit/test_api_endpoints.py", 
            "tests/unit/test_security.py",
            "tests/integration/test_database.py"
        ]
    
    def run_test_suite(self, test_file):
        """Run a specific test suite"""
        print(f"\n🧪 Running {test_file}...")
        print("=" * 60)
        
        try:
            # Run pytest with specific test file
            result = subprocess.run([
                sys.executable, "-m", "pytest", 
                test_file,
                "-v",
                "--tb=short",
                "--disable-warnings",
                "--no-header"
            ], capture_output=True, text=True, timeout=300)
            
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "stdout": "",
                "stderr": "Test timed out after 5 minutes",
                "returncode": -1
            }
        except Exception as e:
            return {
                "success": False,
                "stdout": "",
                "stderr": str(e),
                "returncode": -1
            }
    
    def check_dependencies(self):
        """Check if required dependencies are available"""
        print("🔍 Checking dependencies...")
        
        required_packages = [
            "pytest",
            "fastapi",
            "pymongo", 
            "redis",
            "passlib",
            "python-jose",
            "cryptography",
            "pyotp"
        ]
        
        missing_packages = []
        
        for package in required_packages:
            try:
                if package == "python-jose":
                    __import__("jose")
                else:
                    __import__(package.replace("-", "_"))
                print(f"  ✅ {package}")
            except ImportError:
                print(f"  ❌ {package} - MISSING")
                missing_packages.append(package)
        
        if missing_packages:
            print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
            print("Install with: pip install " + " ".join(missing_packages))
            return False
        
        return True
    
    def check_backend_availability(self):
        """Check if backend is available for testing"""
        print("\n🔍 Checking backend availability...")
        
        try:
            # Try to import backend modules
            sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
            
            # Check if main modules exist
            backend_files = [
                "main.py",
                "auth_middleware.py",
                "models/user_management.py"
            ]
            
            for file_path in backend_files:
                full_path = os.path.join("backend", file_path)
                if os.path.exists(full_path):
                    print(f"  ✅ {file_path}")
                else:
                    print(f"  ❌ {file_path} - MISSING")
                    return False
            
            return True
            
        except Exception as e:
            print(f"  ❌ Backend check failed: {e}")
            return False
    
    def run_all_critical_tests(self):
        """Run all critical tests"""
        print("🚀 JUPITER SIEM - CRITICAL TESTS RUNNER")
        print("=" * 60)
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Check dependencies
        if not self.check_dependencies():
            print("\n❌ DEPENDENCY CHECK FAILED")
            return False
        
        # Check backend availability
        if not self.check_backend_availability():
            print("\n❌ BACKEND AVAILABILITY CHECK FAILED")
            return False
        
        print("\n🧪 Running Critical Tests...")
        print("=" * 60)
        
        total_tests = len(self.critical_tests)
        passed_tests = 0
        failed_tests = 0
        
        for test_file in self.critical_tests:
            if not os.path.exists(test_file):
                print(f"❌ {test_file} - FILE NOT FOUND")
                failed_tests += 1
                continue
            
            result = self.run_test_suite(test_file)
            self.test_results[test_file] = result
            
            if result["success"]:
                print(f"✅ {test_file} - PASSED")
                passed_tests += 1
            else:
                print(f"❌ {test_file} - FAILED")
                print(f"   Return code: {result['returncode']}")
                if result["stderr"]:
                    print(f"   Error: {result['stderr'][:200]}...")
                failed_tests += 1
        
        # Generate summary
        self.generate_summary(passed_tests, failed_tests, total_tests)
        
        return failed_tests == 0
    
    def generate_summary(self, passed, failed, total):
        """Generate test summary"""
        end_time = time.time()
        duration = end_time - self.start_time
        
        print("\n" + "=" * 60)
        print("📊 CRITICAL TESTS SUMMARY")
        print("=" * 60)
        print(f"⏰ Duration: {duration:.2f} seconds")
        print(f"📈 Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Success Rate: {(passed/total)*100:.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL CRITICAL TESTS PASSED!")
            print("✅ System is ready for deployment")
        else:
            print(f"\n⚠️  {failed} CRITICAL TESTS FAILED!")
            print("❌ System is NOT ready for deployment")
            print("\n🔧 Required Actions:")
            print("   1. Fix failing tests")
            print("   2. Ensure all dependencies are installed")
            print("   3. Verify backend is properly configured")
            print("   4. Re-run tests before deployment")
        
        # Save detailed results
        self.save_test_report(passed, failed, total, duration)
    
    def save_test_report(self, passed, failed, total, duration):
        """Save detailed test report"""
        report_file = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        with open(report_file, 'w') as f:
            f.write("JUPITER SIEM - CRITICAL TESTS REPORT\n")
            f.write("=" * 50 + "\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Duration: {duration:.2f} seconds\n")
            f.write(f"Total Tests: {total}\n")
            f.write(f"Passed: {passed}\n")
            f.write(f"Failed: {failed}\n")
            f.write(f"Success Rate: {(passed/total)*100:.1f}%\n\n")
            
            f.write("DETAILED RESULTS:\n")
            f.write("-" * 30 + "\n")
            
            for test_file, result in self.test_results.items():
                f.write(f"\n{test_file}:\n")
                f.write(f"  Status: {'PASSED' if result['success'] else 'FAILED'}\n")
                f.write(f"  Return Code: {result['returncode']}\n")
                
                if result['stdout']:
                    f.write(f"  Output:\n{result['stdout']}\n")
                
                if result['stderr']:
                    f.write(f"  Errors:\n{result['stderr']}\n")
        
        print(f"\n📄 Detailed report saved to: {report_file}")

def main():
    """Main function"""
    runner = CriticalTestRunner()
    
    try:
        success = runner.run_all_critical_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test runner failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
