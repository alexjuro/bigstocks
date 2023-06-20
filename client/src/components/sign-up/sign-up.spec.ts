import { expect } from 'chai';
import { fixture } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './sign-up';

describe('SignUpComponent', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should display error message for invalid username input', async () => {
    const element = await fixture('<sign-up></sign-up>');
    const usernameInput = element.shadowRoot!.querySelector('#username') as HTMLInputElement;
    usernameInput.value = 'abc'; // Set an invalid username
    usernameInput.dispatchEvent(new Event('input'));
    const invalidFeedback = element.shadowRoot!.querySelector('.invalid-feedback') as HTMLElement;
    expect(invalidFeedback.innerText).to.equal('Username must be valid');
  });

  it('should display error message for invalid email input', async () => {
    const element = await fixture('<sign-up></sign-up>');
    const emailInput = element.shadowRoot!.querySelector('#email') as HTMLInputElement;
    emailInput.value = 'invaliduser'; // Set an invalid email
    emailInput.dispatchEvent(new Event('input'));
    const invalidFeedback = element.shadowRoot!.querySelector('.emailContainer .invalid-feedback') as HTMLElement;
    expect(invalidFeedback.innerText).to.equal('Email is required and must be valid');
  });

  it('should display constraints when "?" button is clicked', async () => {
    const element = await fixture(`<sign-up></sign-up>`);
    const constraintButton = element.shadowRoot!.querySelector('#constraintButton') as HTMLButtonElement;
    await constraintButton.click();

    const constraints = element.shadowRoot!.querySelector('.constraints');
    expect(constraints).to.not.be.null;
  });
});
