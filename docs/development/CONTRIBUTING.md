# Contributing Guide

## 🚀 Getting Started

### Setting Up Development Environment

1. **Fork & Clone**
```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/JupiterEmerge.git
cd JupiterEmerge
```

2. **Create Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

## 📝 Contribution Guidelines

### 1. Code Style

#### Python (Backend)
```python
# Use type hints
def process_data(input_data: dict) -> dict:
    """
    Process the input data and return transformed data.
    
    Args:
        input_data (dict): Raw input data
        
    Returns:
        dict: Processed data
    """
    result = transform_data(input_data)
    return result

# Use meaningful variable names
bad_name = 'x'  # ❌
user_response = await get_user_data()  # ✅
```

#### JavaScript/TypeScript (Frontend)
```typescript
// Use interfaces for type definitions
interface UserData {
  id: string;
  email: string;
  role: UserRole;
  preferences?: UserPreferences;
}

// Use functional components
const DashboardWidget: React.FC<WidgetProps> = ({ data, onUpdate }) => {
  return (
    <div className="widget">
      {/* Component content */}
    </div>
  );
};
```

### 2. Git Commit Messages

```bash
# Format
<type>(<scope>): <description>

# Examples
feat(dashboard): add new security metrics widget
fix(auth): resolve JWT token refresh issue
docs(api): update authentication documentation
style(ui): improve button consistency
refactor(backend): optimize database queries
test(integration): add RBAC test cases
```

### 3. Pull Request Process

1. **Before Creating PR**
```bash
# Update your fork
git remote add upstream https://github.com/Soldier0x0/JupiterEmerge.git
git fetch upstream
git rebase upstream/main

# Run tests
pytest  # Backend tests
npm test  # Frontend tests
```

2. **PR Template**
```markdown
## Description
[Describe your changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactor

## Testing
[Describe how you tested your changes]

## Screenshots
[If applicable]
```

### 4. Code Review Process

#### Reviewer Guidelines
- Check code style compliance
- Verify test coverage
- Ensure documentation is updated
- Test functionality locally

#### Author Guidelines
- Respond to reviews promptly
- Address all comments
- Update PR based on feedback
- Keep PR focused and small

## 🧪 Testing Guidelines

### Backend Tests
```python
# Use descriptive test names
def test_user_creation_with_valid_data():
    user_data = {
        "email": "test@example.com",
        "role": "analyst"
    }
    response = client.post("/api/users", json=user_data)
    assert response.status_code == 201

# Group related tests
class TestAuthenticationFlow:
    def test_login_success(self):
        pass
        
    def test_login_invalid_credentials(self):
        pass
```

### Frontend Tests
```javascript
describe('DashboardWidget', () => {
  // Setup test data
  const mockData = {
    title: 'Security Metrics',
    value: 42
  };

  // Test rendering
  it('renders correctly', () => {
    const { getByText } = render(<DashboardWidget data={mockData} />);
    expect(getByText('Security Metrics')).toBeInTheDocument();
  });

  // Test interactions
  it('handles user interaction', async () => {
    const onUpdate = jest.fn();
    const { getByRole } = render(
      <DashboardWidget data={mockData} onUpdate={onUpdate} />
    );
    await userEvent.click(getByRole('button'));
    expect(onUpdate).toHaveBeenCalled();
  });
});
```

## 📚 Documentation Guidelines

### Code Documentation
```python
class SecurityMetric:
    """
    Represents a security metric in the system.
    
    Attributes:
        name (str): The name of the metric
        value (float): The current value
        threshold (float): Alert threshold
        
    Methods:
        check_threshold(): Checks if metric exceeds threshold
        update(new_value): Updates the metric value
    """
    
    def __init__(self, name: str, value: float, threshold: float):
        self.name = name
        self.value = value
        self.threshold = threshold
```

### API Documentation
```yaml
paths:
  /api/metrics:
    get:
      summary: Retrieve security metrics
      parameters:
        - name: timeframe
          in: query
          required: false
          schema:
            type: string
      responses:
        '200':
          description: List of security metrics
```

## 🔧 Development Workflow

1. **Feature Development**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat(scope): description"

# Push changes
git push origin feature/new-feature
```

2. **Bug Fixes**
```bash
# Create bug fix branch
git checkout -b fix/bug-description

# Fix and commit
git add .
git commit -m "fix(scope): description"

# Push changes
git push origin fix/bug-description
```

## 🚀 Release Process

### Version Numbering
```
MAJOR.MINOR.PATCH
  │     │     └─── Bug fixes
  │     └───────── New features
  └─────────────── Breaking changes
```

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Release notes prepared

## 🤝 Community Guidelines

### Communication
- Be respectful and inclusive
- Provide constructive feedback
- Stay focused on the project goals
- Help others learn and grow

### Support
- Use GitHub Issues for bugs
- Use Discussions for questions
- Use Pull Requests for contributions
- Follow the code of conduct
