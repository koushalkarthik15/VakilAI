import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Full Pipeline E2E Integration', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('Rental happy path: should analyze a valid Rental PDF', async ({ page }) => {
    // Select EN language if needed
    const langBtn = page.getByRole('button', { name: 'Select language' });
    if (await langBtn.isVisible()) {
      await langBtn.click();
      await page.getByRole('button', { name: 'English English' }).click();
    } else {
      const enGridBtn = page.getByRole('button', { name: 'English English' });
      if (await enGridBtn.isVisible()) {
        await enGridBtn.click();
      }
    }

    // Upload Rental PDF
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Upload document').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'fixtures', 'rental_happy.pdf'));

    // Wait for the analysis to complete and Understand stage to appear
    await expect(page.getByText('Understand before you sign')).not.toBeVisible({ timeout: 10000 });
    
    // Check Understand Stage
    await expect(page.getByText('This is a rental lease agreement', { exact: false })).toBeVisible({ timeout: 10000 });

    // Check Flag Stage (now rendered together with Understand)
    await expect(page.getByText('Potential Risks & Flags')).toBeVisible();
    await expect(page.getByText('No risks identified in this document.')).toBeVisible();

    // Check Compare Stage
    const compareBtn = page.getByRole('button', { name: /Compare/i });
    await compareBtn.click();
    await expect(page.getByText('Compare vs Legal Baseline')).toBeVisible();

    // Check Act Stage
    const actBtn = page.getByRole('button', { name: /Act/i });
    await actBtn.click();
    await expect(page.getByText('Recommended Actions')).toBeVisible();

    // Check Prepare Stage
    const prepareBtn = page.getByRole('button', { name: /Prepare/i });
    await prepareBtn.click();
    
    // Click Generate Briefing Sheet
    await page.getByRole('button', { name: 'Generate Briefing Sheet' }).click();
    
    // Verify Prepare Output
    await expect(page.getByText('Attorney Briefing Sheet')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('I need a briefing sheet to share with my lawyer')).toBeVisible();
  });

  test('Freelancer happy path: should analyze a valid Freelancer PDF', async ({ page }) => {
    const enGridBtn = page.getByRole('button', { name: 'English English' });
    if (await enGridBtn.isVisible()) await enGridBtn.click();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Upload document').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'fixtures', 'freelancer_happy.pdf'));

    // The mock returns a classification that renders substring
    await expect(page.getByText('This is a freelancer service agreement', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('UNKNOWN classification: handles unmatched document safely', async ({ page }) => {
    const enGridBtn = page.getByRole('button', { name: 'English English' });
    if (await enGridBtn.isVisible()) await enGridBtn.click();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Upload document').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'fixtures', 'unknown_recipe.pdf'));

    await expect(page.getByText('Document Not Supported')).toBeVisible({ timeout: 10000 });
  });

  test('UNSUPPORTED classification: handles employment document safely', async ({ page }) => {
    const enGridBtn = page.getByRole('button', { name: 'English English' });
    if (await enGridBtn.isVisible()) await enGridBtn.click();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Upload document').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'fixtures', 'employment_contract.pdf'));

    await expect(page.getByText('Document Not Supported')).toBeVisible({ timeout: 10000 });
  });

  test('Provider failure safely handled', async ({ page }) => {
    const enGridBtn = page.getByRole('button', { name: 'English English' });
    if (await enGridBtn.isVisible()) await enGridBtn.click();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Upload document').click();
    const fileChooser = await fileChooserPromise;
    // We name the fixture FAIL_PROVIDER to trigger the mock failure
    await fileChooser.setFiles(path.join(__dirname, 'fixtures', 'FAIL_PROVIDER.pdf'));

    await expect(page.getByText('Failed to analyze document.')).toBeVisible({ timeout: 10000 });
  });

  test('Session isolation: Uploading a new document clears previous state', async ({ page }) => {
    const enGridBtn = page.getByRole('button', { name: 'English English' });
    if (await enGridBtn.isVisible()) await enGridBtn.click();

    // Upload first doc
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Upload document').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'fixtures', 'rental_happy.pdf'));

    await expect(page.getByText('This is a rental lease agreement', { exact: false })).toBeVisible({ timeout: 10000 });

    // Click back to upload new doc
    await page.getByRole('button', { name: 'Upload different document' }).click();

    // Upload unsupported doc
    const fileChooserPromise2 = page.waitForEvent('filechooser');
    await page.getByText('Upload document').click();
    const fileChooser2 = await fileChooserPromise2;
    await fileChooser2.setFiles(path.join(__dirname, 'fixtures', 'employment_contract.pdf'));

    // Verify state changed
    await expect(page.getByText('This is a rental lease agreement', { exact: false })).not.toBeVisible();
    await expect(page.getByText('Document Not Supported')).toBeVisible({ timeout: 10000 });
  });
});
