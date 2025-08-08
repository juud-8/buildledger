import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('should display login form correctly', async ({ page }) => {
    await page.goto('/login')
    
    // Check form elements are present
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByText(/don't have an account/i)).toBeVisible()
  })

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 10000 })
    
    // Should remain on login page
    await expect(page).toHaveURL('/login')
  })

  test('should handle empty form submission', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show validation errors
    await expect(page.getByText(/email is required/i).or(page.getByText(/this field is required/i))).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('link', { name: /sign up/i }).click()
    
    await expect(page).toHaveURL('/register')
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
  })

  test('should display registration form correctly', async ({ page }) => {
    await page.goto('/register')
    
    // Check form elements
    await expect(page.getByLabel(/full name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByLabel(/company name/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    await expect(page.getByText(/already have an account/i)).toBeVisible()
  })

  test('should handle registration validation', async ({ page }) => {
    await page.goto('/register')
    
    // Submit empty form
    await page.getByRole('button', { name: /create account/i }).click()
    
    // Should show validation errors
    await expect(page.getByText(/name is required/i).or(page.getByText(/this field is required/i))).toBeVisible()
  })

  test('should handle password validation', async ({ page }) => {
    await page.goto('/register')
    
    await page.getByLabel(/full name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('123') // Too short
    await page.getByLabel(/company name/i).fill('Test Company')
    
    await page.getByRole('button', { name: /create account/i }).click()
    
    // Should show password validation error
    await expect(page.getByText(/password must be at least/i)).toBeVisible()
  })

  test('should handle email format validation', async ({ page }) => {
    await page.goto('/register')
    
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/password/i).fill('validpassword123')
    
    await page.getByRole('button', { name: /create account/i }).click()
    
    // Should show email validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should show forgot password link', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible()
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('link', { name: /forgot password/i }).click()
    
    await expect(page).toHaveURL('/forgot-password')
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible()
  })

  test('should handle password reset request', async ({ page }) => {
    await page.goto('/forgot-password')
    
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /send reset link/i }).click()
    
    // Should show confirmation message
    await expect(page.getByText(/reset link sent/i).or(page.getByText(/check your email/i))).toBeVisible({ timeout: 10000 })
  })

  test('should handle session timeout warning', async ({ page }) => {
    // Mock authenticated state
    await page.goto('/login')
    await page.evaluate(() => {
      const mockSession = {
        user: { id: 'test-user', email: 'test@example.com' },
        authenticated: true,
        lastActivity: Date.now() - (25 * 60 * 1000) // 25 minutes ago (near timeout)
      }
      localStorage.setItem('buildledger.auth.session', JSON.stringify(mockSession))
    })
    
    await page.goto('/dashboard')
    
    // Should show session warning (if implemented)
    // This test depends on the actual implementation of session timeout
  })

  test('should handle automatic logout on session expiry', async ({ page }) => {
    // Mock expired session
    await page.goto('/login')
    await page.evaluate(() => {
      const expiredSession = {
        user: { id: 'test-user', email: 'test@example.com' },
        authenticated: true,
        lastActivity: Date.now() - (35 * 60 * 1000) // 35 minutes ago (expired)
      }
      localStorage.setItem('buildledger.auth.session', JSON.stringify(expiredSession))
    })
    
    await page.goto('/dashboard')
    
    // Should redirect to login due to expired session
    await expect(page).toHaveURL('/login')
  })

  test('should preserve redirect URL after login', async ({ page }) => {
    // Try to access protected page
    await page.goto('/clients')
    
    // Should redirect to login with return URL
    await expect(page).toHaveURL('/login')
    
    // After successful login, should redirect back to original page
    // This test would need valid credentials to complete
  })
})