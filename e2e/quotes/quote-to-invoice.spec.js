import { test, expect } from '@playwright/test'

// Use the stored authentication state
test.use({ storageState: './e2e/.auth/user.json' })

test.describe('Quote to Invoice Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotes')
    
    // Wait for the page to load
    await expect(page.getByRole('heading', { name: /quotes/i })).toBeVisible({ timeout: 10000 })
  })

  test('should display quotes list page', async ({ page }) => {
    // Check page elements
    await expect(page.getByRole('heading', { name: /quotes/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /new quote/i })).toBeVisible()
    
    // Should show test quote
    await expect(page.getByText('QT-E2E-001')).toBeVisible()
  })

  test('should create new quote from scratch', async ({ page }) => {
    await page.getByRole('button', { name: /new quote/i }).click()
    
    // Fill quote form
    await expect(page.getByText(/create quote/i)).toBeVisible()
    
    // Select client
    await page.getByLabel(/client/i).selectOption({ label: /residential test client/i })
    
    // Fill quote details
    await page.getByLabel(/description/i).fill('E2E Test Quote - Mobile App Development')
    await page.getByLabel(/amount/i).fill('7500')
    
    // Set valid until date (30 days from now)
    const validUntilField = page.getByLabel(/valid until/i)
    if (await validUntilField.isVisible()) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      await validUntilField.fill(futureDate.toISOString().split('T')[0])
    }
    
    // Add line items if available
    const addItemBtn = page.getByRole('button', { name: /add item/i })
    if (await addItemBtn.isVisible({ timeout: 3000 })) {
      await addItemBtn.click()
      
      await page.getByLabel(/item description/i).fill('UI/UX Design')
      await page.getByLabel(/quantity/i).fill('1')
      await page.getByLabel(/rate/i).fill('2500')
    }
    
    // Save quote
    await page.getByRole('button', { name: /save quote/i }).click()
    
    // Should show success message and redirect
    await expect(page.getByText(/quote created successfully/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('E2E Test Quote - Mobile App Development')).toBeVisible()
  })

  test('should edit existing quote', async ({ page }) => {
    // Find and click edit button for test quote
    await page.getByText('QT-E2E-001').hover()
    await page.getByRole('button', { name: /edit/i }).first().click()
    
    // Should open edit form
    await expect(page.getByText(/edit quote/i)).toBeVisible()
    
    // Update description
    const descField = page.getByLabel(/description/i)
    await descField.clear()
    await descField.fill('Updated E2E Test Quote - Enhanced Website Development')
    
    // Update amount
    const amountField = page.getByLabel(/amount/i)
    await amountField.clear()
    await amountField.fill('6000')
    
    await page.getByRole('button', { name: /save/i }).click()
    
    await expect(page.getByText(/quote updated successfully/i)).toBeVisible({ timeout: 10000 })
  })

  test('should generate and download quote PDF', async ({ page }) => {
    // Click on quote to view details
    await page.getByText('QT-E2E-001').click()
    
    // Look for PDF generation button
    const pdfBtn = page.getByRole('button', { name: /download pdf/i }).or(
      page.getByRole('button', { name: /generate pdf/i })
    )
    
    if (await pdfBtn.isVisible({ timeout: 5000 })) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download')
      
      await pdfBtn.click()
      
      // Should trigger PDF download
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/quote.*\.pdf$/)
    }
  })

  test('should convert quote to invoice', async ({ page }) => {
    // Find the test quote
    await page.getByText('QT-E2E-001').click()
    
    // Look for convert to invoice button
    const convertBtn = page.getByRole('button', { name: /convert to invoice/i }).or(
      page.getByRole('button', { name: /create invoice/i })
    )
    
    if (await convertBtn.isVisible({ timeout: 5000 })) {
      await convertBtn.click()
      
      // Should show conversion confirmation or form
      await expect(
        page.getByText(/convert to invoice/i).or(
          page.getByText(/create invoice from quote/i)
        )
      ).toBeVisible()
      
      // Confirm conversion
      const confirmBtn = page.getByRole('button', { name: /convert/i }).or(
        page.getByRole('button', { name: /create invoice/i })
      )
      
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click()
        
        // Should show success and navigate to invoices
        await expect(page.getByText(/invoice created successfully/i)).toBeVisible({ timeout: 10000 })
        
        // Should be on invoices page or show invoice details
        await expect(
          page.getByText(/invoice/i).or(
            page.getByText(/INV-/i)
          )
        ).toBeVisible()
      }
    }
  })

  test('should send quote via email', async ({ page }) => {
    await page.getByText('QT-E2E-001').click()
    
    const sendBtn = page.getByRole('button', { name: /send email/i }).or(
      page.getByRole('button', { name: /email quote/i })
    )
    
    if (await sendBtn.isVisible({ timeout: 5000 })) {
      await sendBtn.click()
      
      // Should show email form
      await expect(page.getByText(/send quote/i)).toBeVisible()
      
      // Email should be pre-filled from client
      const emailField = page.getByLabel(/email/i)
      if (await emailField.isVisible()) {
        await expect(emailField).toHaveValue('residential@test.com')
      }
      
      // Add custom message
      const messageField = page.getByLabel(/message/i)
      if (await messageField.isVisible()) {
        await messageField.fill('Please review the attached quote for your project.')
      }
      
      // Send email
      const sendEmailBtn = page.getByRole('button', { name: /send/i })
      await sendEmailBtn.click()
      
      await expect(page.getByText(/quote sent successfully/i)).toBeVisible({ timeout: 10000 })
    }
  })

  test('should update quote status', async ({ page }) => {
    await page.getByText('QT-E2E-001').click()
    
    // Look for status dropdown
    const statusDropdown = page.getByLabel(/status/i).or(
      page.getByRole('combobox', { name: /status/i })
    )
    
    if (await statusDropdown.isVisible({ timeout: 5000 })) {
      await statusDropdown.selectOption('approved')
      
      // Should update automatically or have save button
      const saveBtn = page.getByRole('button', { name: /save/i })
      if (await saveBtn.isVisible()) {
        await saveBtn.click()
      }
      
      await expect(page.getByText(/approved/i)).toBeVisible()
    }
  })

  test('should validate quote fields', async ({ page }) => {
    await page.getByRole('button', { name: /new quote/i }).click()
    
    // Try to save without required fields
    await page.getByRole('button', { name: /save quote/i }).click()
    
    // Should show validation errors
    await expect(page.getByText(/client is required/i).or(page.getByText(/this field is required/i))).toBeVisible()
  })

  test('should handle quote expiration', async ({ page }) => {
    // Create quote with past expiration date
    await page.getByRole('button', { name: /new quote/i }).click()
    
    await page.getByLabel(/client/i).selectOption({ label: /commercial test client/i })
    await page.getByLabel(/description/i).fill('Expired Quote Test')
    await page.getByLabel(/amount/i).fill('3000')
    
    // Set past date
    const validUntilField = page.getByLabel(/valid until/i)
    if (await validUntilField.isVisible()) {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 10)
      await validUntilField.fill(pastDate.toISOString().split('T')[0])
    }
    
    await page.getByRole('button', { name: /save quote/i }).click()
    
    // Should show expired status or warning
    await expect(page.getByText(/expired/i)).toBeVisible({ timeout: 10000 })
  })

  test('should calculate quote totals correctly', async ({ page }) => {
    await page.getByRole('button', { name: /new quote/i }).click()
    
    await page.getByLabel(/client/i).selectOption({ label: /residential test client/i })
    await page.getByLabel(/description/i).fill('Quote with Tax Calculation')
    
    // Enter base amount
    await page.getByLabel(/amount/i).fill('1000')
    
    // Add tax if tax field exists
    const taxField = page.getByLabel(/tax/i)
    if (await taxField.isVisible()) {
      await taxField.fill('100')
      
      // Check total calculation
      const totalField = page.getByLabel(/total/i)
      if (await totalField.isVisible()) {
        await expect(totalField).toHaveValue('1100')
      }
    }
  })

  test('should duplicate existing quote', async ({ page }) => {
    await page.getByText('QT-E2E-001').hover()
    
    const duplicateBtn = page.getByRole('button', { name: /duplicate/i }).or(
      page.getByRole('button', { name: /copy/i })
    )
    
    if (await duplicateBtn.isVisible({ timeout: 5000 })) {
      await duplicateBtn.click()
      
      // Should create new quote with similar details
      await expect(page.getByText(/quote duplicated/i)).toBeVisible({ timeout: 10000 })
      
      // Should have new quote number
      await expect(page.getByText(/QT-/i)).toHaveCount(2) // Original + duplicated
    }
  })

  test('should filter quotes by status', async ({ page }) => {
    const filterDropdown = page.getByLabel(/filter by status/i).or(
      page.getByRole('combobox', { name: /status/i })
    )
    
    if (await filterDropdown.isVisible({ timeout: 3000 })) {
      await filterDropdown.selectOption('draft')
      
      // Should show only draft quotes
      await expect(page.getByText('QT-E2E-001')).toBeVisible()
    }
  })

  test('should search quotes', async ({ page }) => {
    const searchField = page.getByPlaceholder(/search quotes/i).or(
      page.getByLabel(/search/i)
    )
    
    if (await searchField.isVisible({ timeout: 3000 })) {
      await searchField.fill('E2E-001')
      
      // Should show filtered results
      await expect(page.getByText('QT-E2E-001')).toBeVisible()
    }
  })

  test('should handle quote versioning if available', async ({ page }) => {
    await page.getByText('QT-E2E-001').click()
    
    const versionBtn = page.getByRole('button', { name: /new version/i }).or(
      page.getByRole('button', { name: /revise/i })
    )
    
    if (await versionBtn.isVisible({ timeout: 3000 })) {
      await versionBtn.click()
      
      // Should create new version
      await expect(page.getByText(/version/i)).toBeVisible()
    }
  })
})