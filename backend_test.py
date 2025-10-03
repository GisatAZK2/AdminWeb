#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Admin Dashboard
Tests authentication, CRUD operations, and data management APIs
"""

import requests
import json
import sys
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://data-command-4.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class AdminDashboardTester:
    def __init__(self):
        self.token = None
        self.test_results = []
        self.created_records = {
            'sellers': [],
            'categories': [],
            'events': [],
            'admins': []
        }
    
    def log_result(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_setup_endpoint(self):
        """Test the setup endpoint for configuration instructions"""
        try:
            response = requests.get(f"{API_BASE}/setup", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'instructions' in data and 'message' in data:
                    self.log_result("Setup Endpoint", True, "Setup instructions retrieved successfully")
                    return True
                else:
                    self.log_result("Setup Endpoint", False, "Invalid response format", data)
                    return False
            else:
                self.log_result("Setup Endpoint", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Setup Endpoint", False, "Request failed", str(e))
            return False
    
    def test_login(self):
        """Test authentication login endpoint"""
        try:
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            
            response = requests.post(f"{API_BASE}/auth/login", 
                                   json=login_data, 
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.token = data['token']
                    self.log_result("Authentication Login", True, "Login successful")
                    return True
                else:
                    self.log_result("Authentication Login", False, "Invalid response format", data)
                    return False
            elif response.status_code == 401:
                self.log_result("Authentication Login", False, "Invalid credentials - superadmin table may not exist", response.json())
                return False
            else:
                self.log_result("Authentication Login", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Authentication Login", False, "Request failed", str(e))
            return False
    
    def test_auth_me(self):
        """Test the auth/me endpoint with token"""
        if not self.token:
            self.log_result("Auth Me Endpoint", False, "No token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{API_BASE}/auth/me", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data:
                    self.log_result("Auth Me Endpoint", True, "User info retrieved successfully")
                    return True
                else:
                    self.log_result("Auth Me Endpoint", False, "Invalid response format", data)
                    return False
            else:
                self.log_result("Auth Me Endpoint", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Auth Me Endpoint", False, "Request failed", str(e))
            return False
    
    def test_protected_route_without_token(self):
        """Test protected route without authentication token"""
        try:
            response = requests.get(f"{API_BASE}/stats", timeout=10)
            
            if response.status_code == 401:
                self.log_result("Protected Route Security", True, "Correctly rejected request without token")
                return True
            else:
                self.log_result("Protected Route Security", False, f"Should return 401, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Protected Route Security", False, "Request failed", str(e))
            return False
    
    def test_get_sellers(self):
        """Test GET /api/sellers endpoint"""
        try:
            response = requests.get(f"{API_BASE}/sellers", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET Sellers", True, f"Retrieved {len(data)} sellers")
                    return True
                else:
                    self.log_result("GET Sellers", False, "Response is not a list", data)
                    return False
            else:
                self.log_result("GET Sellers", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("GET Sellers", False, "Request failed", str(e))
            return False
    
    def test_get_categories(self):
        """Test GET /api/categories endpoint"""
        try:
            response = requests.get(f"{API_BASE}/categories", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET Categories", True, f"Retrieved {len(data)} categories")
                    return True
                else:
                    self.log_result("GET Categories", False, "Response is not a list", data)
                    return False
            else:
                self.log_result("GET Categories", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("GET Categories", False, "Request failed", str(e))
            return False
    
    def test_get_events(self):
        """Test GET /api/events endpoint"""
        try:
            response = requests.get(f"{API_BASE}/events", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET Events", True, f"Retrieved {len(data)} events")
                    return True
                else:
                    self.log_result("GET Events", False, "Response is not a list", data)
                    return False
            else:
                self.log_result("GET Events", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("GET Events", False, "Request failed", str(e))
            return False
    
    def test_get_stats(self):
        """Test GET /api/stats endpoint (protected)"""
        if not self.token:
            self.log_result("GET Stats", False, "No token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{API_BASE}/stats", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                expected_keys = ['sellers', 'categories', 'events']
                if all(key in data for key in expected_keys):
                    self.log_result("GET Stats", True, f"Stats retrieved: {data}")
                    return True
                else:
                    self.log_result("GET Stats", False, "Missing expected keys in response", data)
                    return False
            else:
                self.log_result("GET Stats", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("GET Stats", False, "Request failed", str(e))
            return False
    
    def test_create_seller(self):
        """Test POST /api/sellers endpoint"""
        if not self.token:
            self.log_result("CREATE Seller", False, "No token available")
            return False
            
        try:
            seller_data = {
                "name": "Test Seller Company",
                "email": "testseller@example.com",
                "phone": "+1234567890",
                "address": "123 Test Street, Test City",
                "status": "active"
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(f"{API_BASE}/sellers", 
                                   json=seller_data, 
                                   headers=headers, 
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data:
                    self.created_records['sellers'].append(data['id'])
                    self.log_result("CREATE Seller", True, f"Seller created with ID: {data['id']}")
                    return True
                else:
                    self.log_result("CREATE Seller", False, "No ID in response", data)
                    return False
            else:
                self.log_result("CREATE Seller", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("CREATE Seller", False, "Request failed", str(e))
            return False
    
    def test_create_category(self):
        """Test POST /api/categories endpoint"""
        if not self.token:
            self.log_result("CREATE Category", False, "No token available")
            return False
            
        try:
            category_data = {
                "name": "Test Category",
                "description": "A test category for API testing",
                "status": "active"
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(f"{API_BASE}/categories", 
                                   json=category_data, 
                                   headers=headers, 
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data:
                    self.created_records['categories'].append(data['id'])
                    self.log_result("CREATE Category", True, f"Category created with ID: {data['id']}")
                    return True
                else:
                    self.log_result("CREATE Category", False, "No ID in response", data)
                    return False
            else:
                self.log_result("CREATE Category", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("CREATE Category", False, "Request failed", str(e))
            return False
    
    def test_create_event(self):
        """Test POST /api/events endpoint"""
        if not self.token:
            self.log_result("CREATE Event", False, "No token available")
            return False
            
        try:
            event_data = {
                "title": "Test Event",
                "description": "A test event for API testing",
                "date": "2024-12-31T10:00:00Z",
                "location": "Test Venue",
                "status": "active"
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(f"{API_BASE}/events", 
                                   json=event_data, 
                                   headers=headers, 
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data:
                    self.created_records['events'].append(data['id'])
                    self.log_result("CREATE Event", True, f"Event created with ID: {data['id']}")
                    return True
                else:
                    self.log_result("CREATE Event", False, "No ID in response", data)
                    return False
            else:
                self.log_result("CREATE Event", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("CREATE Event", False, "Request failed", str(e))
            return False
    
    def test_get_individual_records(self):
        """Test GET individual records by ID"""
        success_count = 0
        total_tests = 0
        
        # Test individual seller
        if self.created_records['sellers']:
            seller_id = self.created_records['sellers'][0]
            try:
                response = requests.get(f"{API_BASE}/sellers/{seller_id}", timeout=10)
                total_tests += 1
                if response.status_code == 200:
                    success_count += 1
                    self.log_result("GET Individual Seller", True, f"Retrieved seller {seller_id}")
                else:
                    self.log_result("GET Individual Seller", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_result("GET Individual Seller", False, "Request failed", str(e))
        
        # Test individual category
        if self.created_records['categories']:
            category_id = self.created_records['categories'][0]
            try:
                response = requests.get(f"{API_BASE}/categories/{category_id}", timeout=10)
                total_tests += 1
                if response.status_code == 200:
                    success_count += 1
                    self.log_result("GET Individual Category", True, f"Retrieved category {category_id}")
                else:
                    self.log_result("GET Individual Category", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_result("GET Individual Category", False, "Request failed", str(e))
        
        # Test individual event
        if self.created_records['events']:
            event_id = self.created_records['events'][0]
            try:
                response = requests.get(f"{API_BASE}/events/{event_id}", timeout=10)
                total_tests += 1
                if response.status_code == 200:
                    success_count += 1
                    self.log_result("GET Individual Event", True, f"Retrieved event {event_id}")
                else:
                    self.log_result("GET Individual Event", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_result("GET Individual Event", False, "Request failed", str(e))
        
        return success_count == total_tests and total_tests > 0
    
    def test_update_operations(self):
        """Test PUT operations for updating records"""
        if not self.token:
            self.log_result("UPDATE Operations", False, "No token available")
            return False
            
        success_count = 0
        total_tests = 0
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Update seller
        if self.created_records['sellers']:
            seller_id = self.created_records['sellers'][0]
            update_data = {"name": "Updated Test Seller Company"}
            try:
                response = requests.put(f"{API_BASE}/sellers/{seller_id}", 
                                      json=update_data, 
                                      headers=headers, 
                                      timeout=10)
                total_tests += 1
                if response.status_code == 200:
                    success_count += 1
                    self.log_result("UPDATE Seller", True, f"Updated seller {seller_id}")
                else:
                    self.log_result("UPDATE Seller", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_result("UPDATE Seller", False, "Request failed", str(e))
        
        # Update category
        if self.created_records['categories']:
            category_id = self.created_records['categories'][0]
            update_data = {"name": "Updated Test Category"}
            try:
                response = requests.put(f"{API_BASE}/categories/{category_id}", 
                                      json=update_data, 
                                      headers=headers, 
                                      timeout=10)
                total_tests += 1
                if response.status_code == 200:
                    success_count += 1
                    self.log_result("UPDATE Category", True, f"Updated category {category_id}")
                else:
                    self.log_result("UPDATE Category", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_result("UPDATE Category", False, "Request failed", str(e))
        
        # Update event
        if self.created_records['events']:
            event_id = self.created_records['events'][0]
            update_data = {"title": "Updated Test Event"}
            try:
                response = requests.put(f"{API_BASE}/events/{event_id}", 
                                      json=update_data, 
                                      headers=headers, 
                                      timeout=10)
                total_tests += 1
                if response.status_code == 200:
                    success_count += 1
                    self.log_result("UPDATE Event", True, f"Updated event {event_id}")
                else:
                    self.log_result("UPDATE Event", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_result("UPDATE Event", False, "Request failed", str(e))
        
        return success_count == total_tests and total_tests > 0
    
    def test_delete_operations(self):
        """Test DELETE operations for removing records"""
        if not self.token:
            self.log_result("DELETE Operations", False, "No token available")
            return False
            
        success_count = 0
        total_tests = 0
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Delete seller
        if self.created_records['sellers']:
            seller_id = self.created_records['sellers'][0]
            try:
                response = requests.delete(f"{API_BASE}/sellers/{seller_id}", 
                                         headers=headers, 
                                         timeout=10)
                total_tests += 1
                if response.status_code == 200:
                    success_count += 1
                    self.log_result("DELETE Seller", True, f"Deleted seller {seller_id}")
                else:
                    self.log_result("DELETE Seller", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_result("DELETE Seller", False, "Request failed", str(e))
        
        # Delete category
        if self.created_records['categories']:
            category_id = self.created_records['categories'][0]
            try:
                response = requests.delete(f"{API_BASE}/categories/{category_id}", 
                                         headers=headers, 
                                         timeout=10)
                total_tests += 1
                if response.status_code == 200:
                    success_count += 1
                    self.log_result("DELETE Category", True, f"Deleted category {category_id}")
                else:
                    self.log_result("DELETE Category", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_result("DELETE Category", False, "Request failed", str(e))
        
        # Delete event
        if self.created_records['events']:
            event_id = self.created_records['events'][0]
            try:
                response = requests.delete(f"{API_BASE}/events/{event_id}", 
                                         headers=headers, 
                                         timeout=10)
                total_tests += 1
                if response.status_code == 200:
                    success_count += 1
                    self.log_result("DELETE Event", True, f"Deleted event {event_id}")
                else:
                    self.log_result("DELETE Event", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_result("DELETE Event", False, "Request failed", str(e))
        
        return success_count == total_tests and total_tests > 0
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("ADMIN DASHBOARD BACKEND API TESTING")
        print("=" * 60)
        print(f"Base URL: {BASE_URL}")
        print(f"API Base: {API_BASE}")
        print()
        
        # Test sequence
        tests = [
            ("Setup Endpoint", self.test_setup_endpoint),
            ("Authentication Login", self.test_login),
            ("Auth Me Endpoint", self.test_auth_me),
            ("Protected Route Security", self.test_protected_route_without_token),
            ("GET Sellers", self.test_get_sellers),
            ("GET Categories", self.test_get_categories),
            ("GET Events", self.test_get_events),
            ("GET Stats", self.test_get_stats),
            ("CREATE Seller", self.test_create_seller),
            ("CREATE Category", self.test_create_category),
            ("CREATE Event", self.test_create_event),
            ("GET Individual Records", self.test_get_individual_records),
            ("UPDATE Operations", self.test_update_operations),
            ("DELETE Operations", self.test_delete_operations)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                if result:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_result(test_name, False, "Test execution failed", str(e))
                failed += 1
            print()  # Add spacing between tests
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%" if (passed + failed) > 0 else "0%")
        
        # Critical issues
        critical_failures = [r for r in self.test_results if not r['success'] and 
                           any(keyword in r['test'].lower() for keyword in ['login', 'auth', 'setup'])]
        
        if critical_failures:
            print("\n🚨 CRITICAL ISSUES:")
            for failure in critical_failures:
                print(f"   - {failure['test']}: {failure['message']}")
        
        # Authentication status
        if self.token:
            print(f"\n🔐 Authentication: Working (Token obtained)")
        else:
            print(f"\n🔐 Authentication: Failed (No token)")
        
        # Data operations status
        crud_tests = [r for r in self.test_results if any(op in r['test'].upper() for op in ['CREATE', 'UPDATE', 'DELETE', 'GET'])]
        crud_passed = len([r for r in crud_tests if r['success']])
        crud_total = len(crud_tests)
        
        if crud_total > 0:
            print(f"📊 CRUD Operations: {crud_passed}/{crud_total} working ({(crud_passed/crud_total*100):.1f}%)")
        
        return passed, failed

def main():
    """Main test execution"""
    tester = AdminDashboardTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()