import { fixture, oneEvent } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';
import sinon from 'sinon';
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
    // const passwordInput = element.shadowRoot!.querySelector('#password') as HTMLInputElement;
    const nextButton = element.shadowRoot!.querySelector('#nextButton');
    // const backButton = element.shadowRoot!.querySelector('#backButton');
    // const submitButton = element.shadowRoot!.querySelector('#submitButton');

    expect(form).to.exist;
    expect(usernameInput).to.exist;
    // expect(passwordInput).to.not.exist;
    expect(nextButton).to.exist;
    // expect(backButton).to.not.exist;
    // expect(submitButton).to.not.exist;
  });

  it('renders the password step after clicking "Next" with valid username', async () => {
    const usernameInput = element.shadowRoot!.querySelector('#username') as HTMLInputElement;
    const nextButton = element.shadowRoot!.querySelector('#nextButton') as HTMLButtonElement;

    usernameInput.value = 'testuser';
    nextButton.click();

    await element.updateComplete;

    const passwordInput = element.shadowRoot!.querySelector('#password') as HTMLInputElement;
    const backButton = element.shadowRoot!.querySelector('#backButton');
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

    usernameInput.value = 'testuser';
    nextButton.click();

    await element.updateComplete;

    const backButton = element.shadowRoot!.querySelector('#backButton') as HTMLButtonElement;
    expect(backButton).to.exist;
    backButton.click();
    await element.updateComplete;

    expect(usernameInput.value).to.equal('testuser');
  });

  it('submits the form and navigates to "/news" on successful sign-in', async () => {
    const signInData = {
      username: 'Testuser',
      password: 'Password123FASDF'
    };

    const postStub = sinon.stub(httpClient, 'post').resolves();
    const navigateStub = sinon.stub(router, 'navigate').resolves();

    const usernameInput = element.shadowRoot!.querySelector('#username') as HTMLInputElement;
    const nextButton = element.shadowRoot!.querySelector('#nextButton') as HTMLButtonElement;

    usernameInput.value = signInData.username;
    nextButton.click();

    await element.updateComplete;

    await element.updateComplete;
    const passwordInput = element.shadowRoot!.querySelector('#password') as HTMLInputElement;
    const submitButton = element.shadowRoot!.querySelector('#submitButton') as HTMLButtonElement;

    passwordInput.value = signInData.password;
    submitButton.click();

    await element.updateComplete;
    console.log(navigateStub.args);

    expect(navigateStub.calledWith('/news')).to.be.true;
  });

  //   it('displays an error notification on sign-in failure', async () => {
  //     const errorMessage = 'Invalid credentials';

  //     const postStub = sinon.stub(httpClient, 'post').rejects(new Error(errorMessage));
  //     const showNotificationSpy = sinon.spy(element, 'showNotification');

  //     const usernameInput = element.shadowRoot.querySelector('#username') as HTMLInputElement;
  //     const nextButton = element.shadowRoot.querySelector('button[type="button"][data-action="next"]');
  //     const passwordInput = element.shadowRoot.querySelector('#password') as HTMLInputElement;
  //     const submitButton = element.shadowRoot.querySelector('button[type="button"][data-action="submit"]');

  //     usernameInput.value = 'testuser';
  //     nextButton.click();

  //     await element.updateComplete;

  //     passwordInput.value = 'password123';
  //     submitButton.click();

  //     await oneEvent(element, 'update-pagename');

  //     expect(postStub.calledOnce).to.be.true;
  //     expect(showNotificationSpy.calledOnceWith(errorMessage, 'error')).to.be.true;
  //   });
});
