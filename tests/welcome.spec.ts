import { test, expect } from '@playwright/test';

test('first visit explains both modes and mouse entry persists for the tab', async ({ page }) => {
  await page.goto('/');
  const welcome = page.getByRole('dialog');
  await expect(welcome.getByRole('heading', { name: /NO ES UN/ })).toBeVisible();
  await expect(page.locator('[data-entry-mode="immersive"]')).toBeFocused();
  await expect(welcome).toContainText('W/S o ↑/↓ para elegir');
  await page.locator('[data-entry-mode="pointer"]').click();
  await expect(welcome).toHaveCount(0);
  await expect(page.locator('main h1')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Activar sonido' })).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('main h1')).toBeVisible();
});

test('welcome is keyboard operable and immersive entry enables sound explicitly', async ({ page }) => {
  await page.goto('/#proyectos');
  await expect(page.locator('[data-entry-mode="immersive"]')).toBeFocused();
  await page.keyboard.press('d');
  await expect(page.locator('[data-entry-mode="pointer"]')).toBeFocused();
  await page.keyboard.press('a');
  await expect(page.locator('[data-entry-mode="immersive"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/#proyectos$/);
  await expect(page.locator('nav a[href="#proyectos"]')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Desactivar sonido' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('w');
  await expect(page.locator('nav a[href="#perfil"]')).toBeFocused();
});

test('skip, reduced motion, touch layout and replay stay accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#contacto');
  await expect(page.locator('.welcome-copy h1')).toHaveCSS('animation-name', 'none');
  const controls = page.locator('[data-entry-mode]');
  for (const control of await controls.all()) {
    const bounds = await control.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  await page.getByRole('button', { name: 'Saltar bienvenida' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/#contacto$/);
  await page.getByRole('button', { name: 'Ayuda de navegación' }).click();
  await page.getByRole('button', { name: /Volver a ver la bienvenida/ }).click();
  await expect(page.locator('.welcome-screen')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('main h1')).toBeFocused();
  await expect(page).toHaveURL(/#contacto$/);
});

test('entry works without session storage and keeps background controls inert', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage unavailable'); } });
  });
  await page.goto('/');
  await page.locator('[data-entry-mode="pointer"]').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Saltar bienvenida' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('[data-entry-mode="pointer"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.locator('nav a[href="#proyectos"]').click();
  await expect(page.locator('main h1')).toContainText('Ideas en acción');
});
