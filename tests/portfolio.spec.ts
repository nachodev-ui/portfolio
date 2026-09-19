import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Returning visitor: onboarding itself is covered in welcome.spec.ts.
  await page.addInitScript(() => sessionStorage.setItem('portfolio-welcome-seen-v1', 'true'));
});

test('all sections render without runtime errors or horizontal overflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  for (const section of ['inicio', 'perfil', 'proyectos', 'habilidades', 'trayectoria', 'contacto']) {
    await page.locator(`nav a[href="#${section}"]`).click();
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator(`nav a[href="#${section}"]`)).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('project filters, detail dialog, keyboard dismissal and focus restoration', async ({ page }) => {
  await page.goto('/#proyectos');
  await page.getByRole('button', { name: 'Backend', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('1 proyecto');
  await expect(page.locator('.project-card')).toHaveCount(1);
  const project = page.getByRole('button', { name: 'Ver proyecto Albion Market API', exact: true });
  await project.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Albion Market API' })).toBeVisible();
  await expect(dialog.getByRole('link', { name: /Ver código/ })).toHaveAttribute('href', 'https://github.com/nachodev-ui/albion-market-api');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(project).toBeFocused();
  await expect(page).toHaveURL(/#proyectos$/);
  await page.getByRole('button', { name: /Todos/ }).click();
  await expect(page.locator('.project-card')).toHaveCount(3);
});

test('menu arrows, Enter, Escape and browser history work together', async ({ page }) => {
  await page.goto('/');
  await page.locator('nav a[href="#inicio"]').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('nav a[href="#perfil"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#perfil$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mucho más que código');
  await page.locator('nav a[href="#habilidades"]').click();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mucho más que código');
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/#inicio$/);
});

test('sound is opt-in, preferences persist and help traps keyboard focus', async ({ page }) => {
  await page.goto('/');
  const sound = page.getByRole('button', { name: 'Activar sonido' });
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await sound.click();
  await page.getByRole('button', { name: 'Reducir animaciones' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Desactivar sonido' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.getByRole('button', { name: 'Ayuda de navegación' }).click();
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog')))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Ayuda de navegación' })).toBeFocused();
});

test('respects reduced motion and handles clipboard denial honestly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#contacto');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { value: () => Promise.reject(new Error('Denied')) }));
  await page.getByRole('button', { name: 'Copiar contacto' }).click();
  await expect(page.getByRole('status')).toContainText('Puedes copiar el contacto manualmente: https://github.com/nachodev-ui');
  await expect(page.getByRole('link', { name: /Conectemos en GitHub/ })).toHaveAttribute('href', 'https://github.com/nachodev-ui');
});

test('all bundled assets resolve when hosted under a repository subpath', async ({ page }) => {
  const failed: string[] = [];
  page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
  await page.goto('/portfolio/#proyectos');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ideas en acción');
  expect(failed).toEqual([]);
});

test('arrows resume from content headings after mouse navigation', async ({ page }) => {
  await page.goto('/');
  await page.locator('nav a[href="#perfil"]').click();
  await expect(page.locator('main h1')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('nav a[href="#proyectos"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#proyectos$/);
  await expect(page.getByRole('button', { name: /Todos/ })).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('nav a[href="#proyectos"]')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('nav a[href="#perfil"]')).toBeFocused();
});

test('WASD explores a project and returns without a mouse or Tab', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main h1')).toBeVisible();
  await page.keyboard.press('s');
  await expect(page.locator('nav a[href="#perfil"]')).toBeFocused();
  await page.keyboard.press('S');
  await expect(page.locator('nav a[href="#proyectos"]')).toBeFocused();
  await page.keyboard.press('d');
  await expect(page.getByRole('button', { name: /Todos/ })).toBeFocused();
  for (let i = 0; i < 4; i++) await page.keyboard.press('s');
  await expect(page.getByRole('button', { name: 'Ver proyecto Albion Calculator' })).toBeFocused();
  await page.keyboard.press('D');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('s');
  await expect(page.getByRole('dialog').getByRole('link', { name: /Abrir aplicación/ })).toBeFocused();
  await expect(page).toHaveURL(/#proyectos$/);
  await page.keyboard.press('a');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ver proyecto Albion Calculator' })).toBeFocused();
  await page.keyboard.press('a');
  await expect(page.locator('nav a[href="#proyectos"]')).toBeFocused();
  await page.keyboard.press('w');
  await expect(page.locator('nav a[href="#perfil"]')).toBeFocused();
});

test('game shortcuts preserve editing, modified keys and native controls', async ({ page }) => {
  await page.goto('/#contacto');
  // A future contact field or editable region must not lose input to shortcuts.
  await page.evaluate(() => {
    const input = document.createElement('input');
    input.setAttribute('aria-label', 'Test field');
    document.querySelector('main')!.append(input);
  });
  const input = page.getByRole('textbox', { name: 'Test field' });
  await input.focus();
  await page.keyboard.type('wasdWASD?');
  await expect(input).toHaveValue('wasdWASD?');
  await page.keyboard.press('ArrowLeft');
  await expect(input).toBeFocused();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.locator('main h1').focus();
  await page.keyboard.press('Control+s');
  await expect(page.locator('main h1')).toBeFocused();
  await page.keyboard.press('s');
  await expect(page.locator('nav a[href="#inicio"]')).toBeFocused();
});
