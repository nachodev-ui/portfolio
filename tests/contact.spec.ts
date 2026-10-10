import { test, expect, type Page } from '@playwright/test';

const endpoint = '**/formsubmit.co/ajax/**';
const message = 'Hola Ignacio, nos gustaría conversar sobre una oportunidad de desarrollo web.';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('portfolio-welcome-seen-v1', 'true'));
  // No test sends real email or triggers activation for the owner's address.
  await page.route(endpoint, route => route.abort());
});

async function fillMessage(page: Page) {
  await page.getByRole('textbox', { name: 'Tu nombre' }).fill('Equipo de selección');
  await page.getByRole('textbox', { name: 'Tu correo' }).fill('recruiter@example.com');
  await page.getByRole('textbox', { name: 'Tu mensaje' }).fill(message);
}

test('Gimae appears in Frontend with its development status, demo and accurate payment scope', async ({ page }) => {
  await page.goto('/#proyectos');
  await expect(page.getByRole('status')).toHaveText('4 proyectos');
  await page.getByRole('button', { name: 'Frontend', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Ver proyecto Gimae! — Idol Club' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Desarrollo avanzado');
  await expect(dialog).toContainText('pagos Live aún pendientes');
  await expect(dialog.getByRole('link', { name: /Explorar sitio/ })).toHaveAttribute('href', 'https://nachodev-ui.github.io/gimae-web/');
  await expect(dialog.getByRole('link', { name: /Ver código/ })).toHaveAttribute('href', 'https://github.com/nachodev-ui/gimae-web');
});

test('recruiter contact links and native writing controls work without game shortcuts', async ({ page }) => {
  await page.goto('/#contacto');
  await expect(page.getByRole('link', { name: /Conectemos en LinkedIn/ })).toHaveAttribute('href', 'https://cl.linkedin.com/in/ignacio-cisternas-orellana');
  await expect(page.getByRole('link', { name: 'ig.cisternas.dev@gmail.com' })).toHaveAttribute('href', 'mailto:ig.cisternas.dev@gmail.com');
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  const field = page.getByRole('textbox', { name: 'Tu mensaje' });
  await field.focus();
  await page.keyboard.type('wasdWASD?');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Mi nueva propuesta.');
  await page.keyboard.press('ArrowLeft');
  await expect(field).toHaveValue('wasdWASD?\nMi nueva propuesta.');
  await expect(field).toBeFocused();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/#contacto$/);
  await page.getByLabel('¿Qué tienes en mente?').selectOption('Propuesta de proyecto');
  await expect(page.getByLabel('¿Qué tienes en mente?')).toHaveValue('Propuesta de proyecto');
});

test('submission blocks duplicates, sends reply details and shows acceptance without leaving the page', async ({ page }) => {
  let calls = 0;
  let release: (() => void) | undefined;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  await page.route(endpoint, async route => {
    calls++;
    expect(route.request().postDataJSON()).toMatchObject({
      name: 'Equipo de selección', email: 'recruiter@example.com',
      _replyto: 'recruiter@example.com', _subject: 'Portfolio · Oportunidad laboral', message,
    });
    await waiting;
    await route.fulfill({ json: { success: 'true', message: 'Form submitted successfully' } });
  });
  await page.goto('/#contacto');
  await fillMessage(page);
  await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Enviando mensaje…' })).toBeDisabled();
  await page.locator('form').evaluate(form => (form as HTMLFormElement).requestSubmit());
  await expect.poll(() => calls).toBe(1);
  release!();
  await expect(page.locator('.contact-feedback')).toContainText('Tu mensaje fue aceptado para envío');
  await expect(page).toHaveURL(/#contacto$/);
  await page.getByRole('button', { name: /Escribir otro mensaje/ }).click();
  await expect(page.getByRole('textbox', { name: 'Tu nombre' })).toBeFocused();
  await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toHaveValue('');
});

test('pending activation never claims acceptance and preserves the full draft', async ({ page }) => {
  await page.route(endpoint, route => route.fulfill({ json: { success: 'true', message: 'This form needs Activation. Please activate your form.' } }));
  await page.goto('/#contacto');
  await fillMessage(page);
  await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).click();
  await expect(page.locator('.contact-feedback')).toContainText('pendiente de activación');
  await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toHaveValue(message);
  await expect(page.getByRole('button', { name: /Escribir otro mensaje/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Enviar mensaje', exact: true })).toBeEnabled();
});

test('provider rejection keeps the draft and allows an explicit retry', async ({ page }) => {
  await page.route(endpoint, route => route.fulfill({ status: 429, json: { success: false, message: 'Too many requests' } }));
  await page.goto('/#contacto');
  await fillMessage(page);
  await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).click();
  await expect(page.locator('.contact-feedback')).toContainText('no aceptó el envío');
  await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toHaveValue(message);
  await expect(page.getByRole('textbox', { name: 'Tu correo' })).toHaveValue('recruiter@example.com');
  await expect(page.getByRole('button', { name: 'Enviar mensaje', exact: true })).toBeEnabled();
});

test('a network failure never pretends delivery and preserves the message', async ({ page }) => {
  await page.goto('/#contacto');
  await fillMessage(page);
  await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).click();
  await expect(page.locator('.contact-feedback')).toContainText('No pudimos confirmar el envío');
  await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toHaveValue(message);
  await expect(page.getByRole('button', { name: 'Enviar mensaje', exact: true })).toBeEnabled();
});

test('empty and whitespace-only submissions do not call the email service', async ({ page }) => {
  let calls = 0;
  await page.route(endpoint, route => { calls++; return route.abort(); });
  await page.goto('/#contacto');
  await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Tu nombre' })).toBeFocused();
  await fillMessage(page);
  await page.getByRole('textbox', { name: 'Tu mensaje' }).fill(' '.repeat(25));
  await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).click();
  await expect(page.locator('.contact-feedback')).toContainText('al menos 20 caracteres');
  expect(calls).toBe(0);
});
