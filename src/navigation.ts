export const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';

export function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector))
    .filter(element => element.getClientRects().length > 0 && !element.closest('[inert], [hidden]'));
}

export function isEditing(target: HTMLElement) {
  return target.isContentEditable || Boolean(target.closest('input, textarea, select, [role="textbox"], [role="combobox"], [role="slider"], [role="spinbutton"], [role="listbox"], [role="radio"], [role="tab"]'));
}

export function navigationAction(key: string) {
  switch (key.toLowerCase()) {
    case 'w': case 'arrowup': return 'previous';
    case 's': case 'arrowdown': return 'next';
    case 'a': case 'arrowleft': return 'back';
    case 'd': case 'arrowright': return 'open';
    default: return null;
  }
}

export function moveFocus(elements: HTMLElement[], direction: number, fallbackIndex = 0) {
  if (!elements.length) return;
  const focused = elements.indexOf(document.activeElement as HTMLElement);
  const index = focused < 0 ? fallbackIndex : focused;
  elements[(index + direction + elements.length) % elements.length].focus();
}
