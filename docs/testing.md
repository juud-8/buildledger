# Testing Strategy & Guidelines

This document outlines our comprehensive testing approach for BuildLedger, covering unit tests, integration tests, and end-to-end testing.

## Overview

Our testing stack includes:
- **Frontend**: Vitest + React Testing Library for component and utility testing
- **Backend**: Vitest + Node.js test environment for API, middleware, and service testing  
- **E2E**: Playwright for cross-browser end-to-end testing
- **CI/CD**: GitHub Actions for automated testing and deployment

## Test Structure

```
src/
├── test/
│   ├── setup.js              # Test configuration and mocks
│   └── utils.jsx              # Testing utilities and helpers
├── components/
│   └── **/*.test.jsx          # Component tests
├── utils/
│   └── **/*.test.js           # Utility function tests
└── **/*.test.{js,jsx}         # Individual test files

server/
├── test/
│   └── setup.js               # Server test configuration
├── middleware/
│   └── **/*.test.js           # Middleware tests
└── **/*.test.js               # Server-side test files
```

## Frontend Testing (Vitest + React Testing Library)

### Configuration

Our frontend tests use Vitest with React Testing Library for component testing:

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js']
  }
})
```

### Testing Utilities

We provide custom testing utilities in `src/test/utils.jsx`:

```javascript
import { renderWithProviders } from './src/test/utils'

// Renders components with auth context, router, and other providers
renderWithProviders(
  <MyComponent />,
  { 
    mockUser: mockUser,
    mockUserProfile: { subscription_plan: 'Pro' },
    initialEntries: ['/dashboard'] 
  }
)
```

### Component Testing Best Practices

1. **Test user behavior, not implementation details**
2. **Use semantic queries** (getByRole, getByText, getByLabelText)
3. **Test accessibility** by using proper ARIA attributes
4. **Mock external dependencies** (Supabase, API calls)

Example component test:

```javascript
import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../test/utils'
import ClientForm from './ClientForm'

describe('ClientForm', () => {
  it('creates new client on form submission', async () => {
    renderWithProviders(<ClientForm />)
    
    fireEvent.change(screen.getByLabelText(/client name/i), {
      target: { value: 'Test Client' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /save client/i }))
    
    await expect(screen.getByText(/client created successfully/i))
      .toBeInTheDocument()
  })
})
```

### RBAC Testing

Test role-based access control with different subscription plans:

```javascript
it('shows upgrade prompt for restricted features', () => {
  renderWithProviders(
    <FeatureGuard feature={FEATURES.ADVANCED_ANALYTICS}>
      <AdvancedAnalytics />
    </FeatureGuard>,
    { 
      mockUser,
      mockUserProfile: { subscription_plan: 'Starter' }
    }
  )
  
  expect(screen.getByText(/upgrade required/i)).toBeInTheDocument()
})
```

## Backend Testing (Vitest + Node.js)

### Configuration

Server-side tests use Vitest with Node.js environment:

```javascript
// server/vitest.config.js
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.js']
  }
})
```

### Security Testing

Our middleware tests focus heavily on security validation:

```javascript
describe('Webhook Security', () => {
  it('rejects requests without proper signature', () => {
    const mockReq = { headers: {} }
    stripeWebhook(mockReq, mockRes, mockNext)
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockNext).not.toHaveBeenCalled()
  })
})
```

### AI Proxy Testing

Test authentication, rate limiting, and provider routing:

```javascript
describe('AI Proxy', () => {
  it('enforces subscription-based token limits', async () => {
    const starterUser = { subscription_plan: 'Starter' }
    const request = { max_tokens: 10000 } // Exceeds Starter limit
    
    await aiProxy.validateRequest(request, mockRes, mockNext)
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
  })
})
```

## End-to-End Testing (Playwright)

### Configuration

Playwright tests simulate real user interactions across browsers:

```javascript
// playwright.config.js
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
})
```

### Critical User Flows

Test key business workflows:

1. **Authentication Flow**
   - User registration and email verification
   - Login with valid/invalid credentials
   - Password reset flow
   - Session management and timeout

2. **Client Management**
   - Create, edit, and delete clients
   - Client type assignment (residential, commercial)
   - Bulk client import
   - Client search and filtering

3. **Quote & Invoice Workflow**
   - Create quote from client page
   - Convert quote to invoice
   - PDF generation and download
   - Email delivery
   - Payment processing (Stripe integration)

4. **RBAC & Subscription Management**
   - Feature access based on subscription tier
   - Usage limits enforcement
   - Upgrade/downgrade flows
   - Billing integration

Example E2E test:

```javascript
test('complete quote-to-invoice workflow', async ({ page }) => {
  await page.goto('/clients')
  await page.click('[data-testid="create-quote-btn"]')
  
  // Fill quote form
  await page.fill('[name="description"]', 'Website redesign')
  await page.fill('[name="amount"]', '5000')
  await page.click('button:has-text("Save Quote")')
  
  // Convert to invoice
  await page.click('button:has-text("Convert to Invoice")')
  await page.click('button:has-text("Generate PDF")')
  
  // Verify PDF download
  const download = await page.waitForEvent('download')
  expect(download.suggestedFilename()).toMatch(/invoice.*\.pdf/)
})
```

## Test Coverage Requirements

### Minimum Coverage Thresholds

- **Frontend Components**: 85% line coverage
- **Utility Functions**: 90% line coverage
- **Backend Middleware**: 80% line coverage
- **API Routes**: 75% line coverage
- **RBAC Functions**: 95% line coverage (critical security)

### Coverage Commands

```bash
# Frontend coverage
npm run test:coverage

# Backend coverage  
npm run test:server:coverage

# Combined coverage report
npm run test:coverage:all
```

## Running Tests

### Local Development

```bash
# Frontend unit tests
npm run test
npm run test:watch  # Watch mode for development

# Backend tests
npm run test:server
npm run test:server:watch

# E2E tests
npm run test:e2e
npm run test:e2e:headed  # Run with browser UI
```

### CI Pipeline

Tests run automatically on:
- Pull request creation/updates
- Push to main branch
- Nightly builds for E2E regression testing

```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: |
    npm run test:coverage
    npm run test:server:coverage

- name: Run E2E tests
  run: npm run test:e2e
```

## Mocking Strategy

### External Services

- **Supabase**: Mocked client with in-memory data
- **Stripe**: Mock webhook events and API responses  
- **Twilio**: Mock SMS delivery and webhook validation
- **AI Providers**: Mock OpenAI, Gemini, and Anthropic APIs

### Database Mocking

For integration tests, we use an in-memory SQLite database with the same schema as production PostgreSQL.

## Security Testing Focus

Given our security-first approach, tests emphasize:

1. **Authentication bypass attempts**
2. **Authorization escalation scenarios**  
3. **Input validation and sanitization**
4. **Rate limiting effectiveness**
5. **Webhook signature verification**
6. **SQL injection prevention**
7. **XSS protection**
8. **CSRF token validation**

## Performance Testing

Include performance benchmarks for:
- API response times
- Database query optimization
- Frontend rendering performance
- Large dataset handling

## Debugging Test Failures

### Common Issues

1. **Flaky tests**: Use `test.retry()` for network-dependent tests
2. **Timing issues**: Use proper `waitFor` and `findBy` queries
3. **Mock cleanup**: Ensure mocks are reset between tests
4. **Environment variables**: Verify test env configuration

### Debug Tools

```bash
# Run specific test with verbose output
npx vitest run src/components/auth/PrivateRoute.test.jsx --reporter=verbose

# Debug E2E with browser
npx playwright test --debug

# Generate coverage report
npx vitest run --coverage
```

## Continuous Improvement

- Review test failures weekly
- Update test cases for new features
- Refactor flaky tests promptly
- Monitor coverage trends
- Regular dependency updates

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

*Last updated: Phase B1 - Testing Foundation Implementation*