# Testing Guide

## Testing Overview

### Test Categories
1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test component interactions
3. **End-to-End Tests**: Test complete user workflows
4. **Security Tests**: Test for vulnerabilities
5. **Performance Tests**: Test system performance and load handling
6. **API Tests**: Test REST and WebSocket endpoints

## Test Setup

### Frontend Testing (React)

1. **Unit Tests with Jest**
```javascript
// components/__tests__/Alert.test.jsx
import { render, screen } from '@testing-library/react';
import Alert from '../Alert';

describe('Alert Component', () => {
  test('renders alert with correct severity', () => {
    render(<Alert severity="high" message="Security breach detected" />);
    expect(screen.getByText('Security breach detected')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('severity-high');
  });
});
```

2. **Integration Tests**
```javascript
// integration/__tests__/Dashboard.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard';

describe('Dashboard Integration', () => {
  test('loads and displays alerts', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Recent Alerts')).toBeInTheDocument();
    });
    expect(screen.getAllByRole('alert')).toHaveLength(5);
  });
});
```

### Backend Testing (Python)

1. **Unit Tests with pytest**
```python
# tests/test_auth.py
import pytest
from services.auth import verify_password, create_jwt_token

def test_password_verification():
    # Test valid password
    assert verify_password("correct_password", hash_of_correct_password) is True
    
    # Test invalid password
    assert verify_password("wrong_password", hash_of_correct_password) is False

def test_jwt_token_creation():
    token = create_jwt_token({"user_id": "123"})
    assert token is not None
    assert isinstance(token, str)
```

2. **API Tests with pytest**
```python
# tests/test_api.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_alert():
    response = client.post(
        "/api/alerts",
        json={
            "title": "Test Alert",
            "severity": "high",
            "description": "Test description"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Alert"
```

## End-to-End Testing

### Cypress Setup
```javascript
// cypress/integration/login.spec.js
describe('Login Flow', () => {
  it('successfully logs in with valid credentials', () => {
    cy.visit('/login');
    cy.get('[data-testid=email]').type('user@example.com');
    cy.get('[data-testid=password]').type('password123');
    cy.get('[data-testid=login-button]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Security Testing

### 1. Static Analysis
```bash
# Frontend
npm run lint
npm audit

# Backend
bandit -r .
safety check
```

### 2. API Security Tests
```python
# tests/security/test_api_security.py
def test_sql_injection_prevention():
    malicious_input = "'; DROP TABLE users; --"
    response = client.get(f"/api/users?search={malicious_input}")
    assert response.status_code == 400

def test_xss_prevention():
    malicious_input = "<script>alert('xss')</script>"
    response = client.post("/api/comments", json={"content": malicious_input})
    assert response.status_code == 400
```

## Performance Testing

### 1. Load Testing with k6
```javascript
// tests/performance/load_test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:8000/api/health');
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
```

### 2. API Performance Tests
```python
# tests/performance/test_api_performance.py
import time
import pytest

def test_api_response_time():
    start_time = time.time()
    response = client.get("/api/dashboard/summary")
    end_time = time.time()
    
    assert response.status_code == 200
    assert end_time - start_time < 0.5  # Response under 500ms
```

## Mock Data for Testing

### 1. Frontend Mocks
```javascript
// mocks/alertData.js
export const mockAlerts = [
  {
    id: "alert1",
    title: "Suspicious Login Attempt",
    severity: "high",
    timestamp: "2025-08-20T10:00:00Z"
  },
  // ... more mock alerts
];
```

### 2. Backend Mocks
```python
# tests/mocks/data.py
mock_users = [
    {
        "id": "user1",
        "email": "test@example.com",
        "role": "admin"
    }
]

mock_cases = [
    {
        "id": "case1",
        "title": "Security Incident",
        "severity": "high"
    }
]
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.10'
          
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
          
      - name: Run tests
        run: |
          pytest --cov=.
          coverage report

## Unit Testing

### Backend Tests
```python
# Example test case
def test_user_creation():
    user_data = {
        "email": "test@example.com",
        "tenant_id": "test-tenant",
        "role": "analyst"
    }
    response = client.post("/api/users", json=user_data)
    assert response.status_code == 201
    assert response.json()["email"] == user_data["email"]
```

### Frontend Tests
```javascript
// Example component test
describe('DashboardWidget', () => {
  it('renders widget with correct data', () => {
    const testData = {
      title: 'Test Widget',
      value: 42
    };
    render(<DashboardWidget data={testData} />);
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
```

## Integration Testing

### API Integration Tests
```python
def test_authentication_flow():
    # Register user
    register_response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "tenant_name": "Test Org"
    })
    assert register_response.status_code == 201

    # Request OTP
    otp_response = client.post("/api/auth/request-otp", json={
        "email": "test@example.com"
    })
    assert otp_response.status_code == 200

    # Verify OTP and get token
    login_response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "otp": "123456"  # Test OTP
    })
    assert login_response.status_code == 200
    assert "token" in login_response.json()
```

## End-to-End Testing

### Cypress Tests
```javascript
describe('Login Flow', () => {
  it('successfully logs in', () => {
    cy.visit('/login');
    cy.get('[data-test="email-input"]').type('test@example.com');
    cy.get('[data-test="tenant-input"]').type('Test Org');
    cy.get('[data-test="submit-button"]').click();
    cy.get('[data-test="otp-input"]').type('123456');
    cy.get('[data-test="verify-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Security Testing

### RBAC Tests
```python
def test_role_permissions():
    roles = ["super_admin", "tenant_owner", "admin", "analyst", "viewer"]
    for role in roles:
        permissions = get_role_permissions(role)
        assert isinstance(permissions, list)
        assert len(permissions) > 0
```

### Authentication Tests
```python
def test_invalid_token():
    response = client.get(
        "/api/users",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401
```

## Performance Testing

### Load Testing
```python
def test_api_performance():
    # Using locust for load testing
    class UserBehavior(TaskSet):
        @task
        def get_dashboard(self):
            self.client.get("/api/dashboard/overview")

    class WebsiteUser(HttpLocust):
        task_set = UserBehavior
        min_wait = 5000
        max_wait = 9000
```

### Response Time Tests
```python
def test_endpoint_response_time():
    start_time = time.time()
    response = client.get("/api/health")
    end_time = time.time()
    
    assert response.status_code == 200
    assert end_time - start_time < 0.5  # 500ms threshold
```

## Test Configuration

### pytest Configuration
```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --cov=app --cov-report=term-missing
```

### Jest Configuration
```json
// jest.config.js
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"],
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
          
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          
      - name: Run tests
        run: |
          pytest
```

## Test Reports

### Coverage Report
```bash
# Generate coverage report
pytest --cov=app --cov-report=html

# Generate frontend coverage
npm test -- --coverage
```

### Test Documentation
```python
def test_api_endpoint():
    """
    Test API endpoint functionality
    
    Steps:
    1. Make API request
    2. Verify response status
    3. Validate response data
    
    Expected:
    - Status code 200
    - Valid JSON response
    """
    response = client.get("/api/endpoint")
    assert response.status_code == 200
    assert response.json()
```
