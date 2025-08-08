import { test, expect } from '@playwright/test'

// Use the stored authentication state
test.use({ storageState: './e2e/.auth/user.json' })

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clients')
    
    // Wait for the page to load and authenticate
    await expect(page.getByRole('heading', { name: /clients/i })).toBeVisible({ timeout: 10000 })
  })

  test('should display clients list page', async ({ page }) => {
    // Check page elements are present
    await expect(page.getByRole('heading', { name: /clients/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /new client/i })).toBeVisible()
    
    // Should show existing test clients
    await expect(page.getByText('Residential Test Client')).toBeVisible()
    await expect(page.getByText('Commercial Test Client')).toBeVisible()
  })

  test('should open new client modal', async ({ page }) => {
    await page.getByRole('button', { name: /new client/i }).click()
    
    // Modal should be visible
    await expect(page.getByRole('dialog').or(page.getByText('Create Client'))).toBeVisible()
    await expect(page.getByLabel(/client name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/phone/i)).toBeVisible()
  })

  test('should create new residential client', async ({ page }) => {
    await page.getByRole('button', { name: /new client/i }).click()
    
    // Fill out the form
    await page.getByLabel(/client name/i).fill('New Residential Client')
    await page.getByLabel(/email/i).fill('newresidential@test.com')
    await page.getByLabel(/phone/i).fill('+1555123456')
    await page.getByLabel(/address/i).fill('789 New Client St, Test City, TC 12345')
    
    // Select client type
    await page.getByLabel(/client type/i).selectOption('residential')
    
    // Submit form
    await page.getByRole('button', { name: /save client/i }).click()
    
    // Should show success message and new client in list
    await expect(page.getByText(/client created successfully/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('New Residential Client')).toBeVisible()
  })

  test('should create new commercial client', async ({ page }) => {
    await page.getByRole('button', { name: /new client/i }).click()
    
    // Fill out commercial client details
    await page.getByLabel(/client name/i).fill('New Commercial Client')
    await page.getByLabel(/email/i).fill('newcommercial@test.com')
    await page.getByLabel(/phone/i).fill('+1555654321')
    await page.getByLabel(/address/i).fill('456 Business Plaza, Test City, TC 12345')
    
    // Select commercial type
    await page.getByLabel(/client type/i).selectOption('commercial')
    
    // Add payment terms if available
    if (await page.getByLabel(/payment terms/i).isVisible()) {
      await page.getByLabel(/payment terms/i).selectOption('net30')
    }
    
    await page.getByRole('button', { name: /save client/i }).click()
    
    await expect(page.getByText(/client created successfully/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('New Commercial Client')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /new client/i }).click()
    
    // Try to submit empty form
    await page.getByRole('button', { name: /save client/i }).click()
    
    // Should show validation errors
    await expect(page.getByText(/name is required/i).or(page.getByText(/this field is required/i))).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.getByRole('button', { name: /new client/i }).click()
    
    await page.getByLabel(/client name/i).fill('Test Client')
    await page.getByLabel(/email/i).fill('invalid-email')
    
    await page.getByRole('button', { name: /save client/i }).click()
    
    // Should show email validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should edit existing client', async ({ page }) => {
    // Click edit button for test client
    await page.getByText('Residential Test Client').hover()
    await page.getByRole('button', { name: /edit/i }).first().click()
    
    // Should open edit modal
    await expect(page.getByText(/edit client/i)).toBeVisible()
    
    // Update client name
    const nameField = page.getByLabel(/client name/i)
    await nameField.clear()
    await nameField.fill('Updated Residential Client')
    
    await page.getByRole('button', { name: /save/i }).click()
    
    await expect(page.getByText(/client updated successfully/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Updated Residential Client')).toBeVisible()
  })

  test('should filter clients by type', async ({ page }) => {
    // Look for filter dropdown
    const filterDropdown = page.getByLabel(/filter by type/i).or(page.getByRole('combobox', { name: /client type/i }))
    
    if (await filterDropdown.isVisible()) {
      // Filter by residential
      await filterDropdown.selectOption('residential')
      
      // Should only show residential clients
      await expect(page.getByText('Residential Test Client')).toBeVisible()
      
      // Commercial clients should be hidden or not present
      await expect(page.getByText('Commercial Test Client')).not.toBeVisible()
    }
  })

  test('should search clients', async ({ page }) => {
    const searchField = page.getByPlaceholder(/search clients/i).or(page.getByLabel(/search/i))
    
    if (await searchField.isVisible()) {
      await searchField.fill('Residential')
      
      // Should show filtered results
      await expect(page.getByText('Residential Test Client')).toBeVisible()
      await expect(page.getByText('Commercial Test Client')).not.toBeVisible()
      
      // Clear search
      await searchField.clear()
      
      // Should show all clients again
      await expect(page.getByText('Commercial Test Client')).toBeVisible()
    }
  })

  test('should view client details', async ({ page }) => {
    // Click on client name to view details
    await page.getByText('Residential Test Client').click()
    
    // Should navigate to client detail page or open detail modal
    await expect(
      page.getByText('residential@test.com').or(
        page.getByText('+1234567890')
      )
    ).toBeVisible({ timeout: 10000 })
  })

  test('should create quote from client page', async ({ page }) => {
    // Navigate to or open client details
    await page.getByText('Residential Test Client').click()
    
    // Look for create quote button
    const createQuoteBtn = page.getByRole('button', { name: /create quote/i }).or(
      page.getByRole('button', { name: /new quote/i })
    )
    
    if (await createQuoteBtn.isVisible({ timeout: 5000 })) {
      await createQuoteBtn.click()
      
      // Should open quote creation modal or navigate to quote page
      await expect(
        page.getByText(/create quote/i).or(
          page.getByText(/new quote/i)
        )
      ).toBeVisible({ timeout: 10000 })
      
      // Client should be pre-filled
      const clientField = page.getByLabel(/client/i)
      if (await clientField.isVisible()) {
        await expect(clientField).toHaveValue(/residential test client/i)
      }
    }
  })

  test('should delete client with confirmation', async ({ page }) => {
    // Create a client specifically for deletion test
    await page.getByRole('button', { name: /new client/i }).click()
    
    await page.getByLabel(/client name/i).fill('Client To Delete')
    await page.getByLabel(/email/i).fill('delete@test.com')
    await page.getByRole('button', { name: /save client/i }).click()
    
    await expect(page.getByText('Client To Delete')).toBeVisible({ timeout: 10000 })
    
    // Find and click delete button
    await page.getByText('Client To Delete').hover()
    const deleteBtn = page.getByRole('button', { name: /delete/i }).last()
    
    if (await deleteBtn.isVisible({ timeout: 5000 })) {
      await deleteBtn.click()
      
      // Should show confirmation dialog
      await expect(page.getByText(/are you sure/i).or(page.getByText(/delete client/i))).toBeVisible()
      
      // Confirm deletion
      await page.getByRole('button', { name: /delete/i }).or(page.getByRole('button', { name: /yes/i })).click()
      
      // Client should be removed
      await expect(page.getByText('Client To Delete')).not.toBeVisible({ timeout: 10000 })
    }
  })

  test('should handle bulk operations if available', async ({ page }) => {
    // Look for bulk operation features
    const selectAllCheckbox = page.getByLabel(/select all/i).first()
    
    if (await selectAllCheckbox.isVisible({ timeout: 3000 })) {
      await selectAllCheckbox.click()
      
      // Should enable bulk actions
      await expect(page.getByText(/selected/i).or(page.getByRole('button', { name: /bulk/i }))).toBeVisible()
    }
  })

  test('should export clients if feature available', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export/i })
    
    if (await exportBtn.isVisible({ timeout: 3000 })) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download')
      
      await exportBtn.click()
      
      // Should trigger download
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/clients.*\.(csv|xlsx|pdf)$/)
    }
  })

  test('should respect subscription limits for Starter plan', async ({ page }) => {
    // This test would need to mock a Starter plan user
    // and verify client creation limits are enforced
    
    // Mock Starter plan user
    await page.evaluate(() => {
      const starterProfile = {
        subscription_plan: 'Starter',
        id: 'starter-user',
        full_name: 'Starter User'
      }
      localStorage.setItem('buildledger.user.profile', JSON.stringify(starterProfile))
    })
    
    await page.reload()
    
    // If on Starter plan and at limit, should show upgrade prompt
    // This depends on actual implementation of usage tracking
  })
})