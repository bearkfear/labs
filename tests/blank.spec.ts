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

  await page.goto('http://localhost:3000/architecture', { waitUntil: 'networkidle' })
  await expect(page.getByText('Fluxo Rust + Inertia + Solid')).toBeVisible()
  await expect(page.locator('.architecture-cinema-canvas')).toHaveAttribute('data-ready', 'true')
  await page.screenshot({ path: 'test-results/architecture-desktop.png', fullPage: true })

  await expectCanvasPixels(page)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://localhost:3000/architecture', { waitUntil: 'networkidle' })
  await expect(page.getByText('Fluxo Rust + Inertia + Solid')).toBeVisible()
  await expect(page.locator('.architecture-cinema-canvas')).toHaveAttribute('data-ready', 'true')
  await page.screenshot({ path: 'test-results/architecture-mobile.png', fullPage: true })
  await expectCanvasPixels(page)
})

async function expectCanvasPixels(page: import('@playwright/test').Page) {
  const pixelStats = await page.locator('.architecture-cinema-canvas').evaluate((canvas) => {
    const gl =
      (canvas as HTMLCanvasElement).getContext('webgl2') ||
      (canvas as HTMLCanvasElement).getContext('webgl')
    if (!gl) return { colored: 0, sampled: 0 }

    const image = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4)
    gl.readPixels(
      0,
      0,
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image,
    )

    let colored = 0
    let sampled = 0

    for (let index = 0; index < image.length; index += 4 * 97) {
      sampled += 1
      if (image[index + 3] > 0) colored += 1
    }

    return { colored, sampled }
  })

  expect(pixelStats.colored).toBeGreaterThan(20)
}
