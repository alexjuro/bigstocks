//Autor: Lakzan Natnan
import { expect } from 'chai';
import { fixture, html, nextFrame } from '@open-wc/testing-helpers';
import './resetPassword.js';

describe('AppResetPassword', () => {
  let element: Element;

  beforeEach(async () => {
    element = await fixture(html`<app-resetpassword></app-resetpassword>`);
  });

  it('updates the password strength and color based on the entered password', async () => {
    const passwordInput = element.shadowRoot!.querySelector('#password') as HTMLInputElement;
    const pwStrengthText = element.shadowRoot!.querySelector('#pwstrength') as HTMLSpanElement;

    const event = new Event('input', { bubbles: true });

    // Schwaches Passwort eingeben
    passwordInput.value = 'wee';
    passwordInput.dispatchEvent(event);

    await nextFrame(); // Warte auf den nächsten Frame

    const computedStyle = window.getComputedStyle(passwordInput);
    const color = computedStyle.getPropertyValue('color');
    console.log(color);
    expect(color).to.equal('rgb(255, 13, 13)');
    expect(pwStrengthText.textContent).to.equal(' Weak!');

    // Starkes Passwort eingeben
    passwordInput.value = 'StrongPassword12324564321!4653as!aSDFasd27';
    passwordInput.dispatchEvent(event);

    await nextFrame(); // Warte auf den nächsten Frame

    const updatedColor = computedStyle.getPropertyValue('color');

    expect(updatedColor).to.equal('rgb(80, 200, 120)');
    expect(pwStrengthText.textContent).to.equal(' Secure!');
  });
});
