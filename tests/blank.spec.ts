import { test, expect } from '@playwright/test'

test('renders the Inertia Solid home page', async ({ page }) => {
  const consoleMessages: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push(`${message.type()}: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => {
    pageErrors.push(error.stack || error.message)
  })

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })

  const bodyText = await page.locator('body').innerText()
  console.log(JSON.stringify({ bodyText, consoleMessages, pageErrors }, null, 2))

  await expect(page.getByText('Axum + Inertia + SolidJS')).toBeVisible()
  await expect(page.getByText('layout: app')).toBeVisible()
  await page.getByRole('link', { name: 'About' }).click()
  await expect(page.getByText('POC em Rust')).toBeVisible()
  await expect(page.getByText('layout: plain')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Home' })).toHaveCount(0)
})
