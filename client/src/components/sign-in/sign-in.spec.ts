//Autor: Lakzan Nathan
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import './sign-in';
import { LitElement } from 'lit';

describe('SignInComponent', () => {
  let element: LitElement;

  beforeEach(async () => {
    element = await fixture(`<sign-in></sign-in>`);
  });

  it('renders the username step by default', () => {
    const form = element.shadowRoot!.querySelector('form.login-form');
    const usernameInput = element.shadowRoot!.querySelector('#username') as HTMLInputElement;
    const nextButton = element.shadowRoot!.querySelector('#nextButton');

    expect(form).to.exist;
    expect(usernameInput).to.exist;
    expect(nextButton).to.exist;
  });

  it('renders the password step after clicking "Next" with valid username', async () => {
    const usernameInput = element.shadowRoot!.querySelector('#username') as HTMLInputElement;
    const nextButton = element.shadowRoot!.querySelector('#nextButton') as HTMLButtonElement;

    usernameInput.value = 'testuser';
    nextButton.click();

    await element.updateComplete;

    const passwordInput = element.shadowRoot!.querySelector('#password') as HTMLInputElement;
    const backButton = element.shadowRoot!.querySelector('#backButton') as HTMLButtonElement;
    const submitButton = element.shadowRoot!.querySelector('#submitButton');
    const signUpButton = element.shadowRoot!.querySelector('#submitButton');

    expect(passwordInput).to.exist;
    expect(backButton).to.exist;
    expect(submitButton).to.exist;
    expect(signUpButton).to.exist;
  });

  it('renders the username step after clicking "Back"', async () => {
    const usernameInput = element.shadowRoot!.querySelector('#username') as HTMLInputElement;
    const nextButton = element.shadowRoot!.querySelector('#nextButton') as HTMLButtonElement;
    console.log(usernameInput);
    usernameInput.value = 'testuser';
    nextButton.click();
    await element.updateComplete;
    const backButton = element.shadowRoot!.querySelector('#backButton') as HTMLButtonElement;
    expect(backButton).to.exist;
    backButton.click();
    await element.updateComplete;

    expect(usernameInput.value).to.equal('testuser');
  });
});
