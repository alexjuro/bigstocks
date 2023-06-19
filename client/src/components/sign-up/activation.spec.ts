import { expect } from 'chai';
import { fixture, html } from '@open-wc/testing-helpers';
import { LitElement } from 'lit';

import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';

import './activation.js';
import sinon from 'sinon';

let stubGet: sinon.SinonStub<[url: string], Promise<Response>>;
let stubPost: sinon.SinonStub<[url: string, body: unknown], Promise<Response>>;
let stubNavigate: sinon.SinonStub<[relUrl: string], void>;

describe('ActivationComponent', () => {
  beforeEach(() => {
    stubGet = sinon.stub(httpClient, 'get').resolves();
    stubPost = sinon.stub(httpClient, 'post').resolves();
    stubNavigate = sinon.stub(router, 'navigate');
  });

  afterEach(() => {
    stubPost.restore();
    stubGet.restore();
    stubNavigate.restore();
  });

  it('renders the activation form correctly', async () => {
    const element = await fixture(html`<app-activation></app-activation>`);
    const form = element.shadowRoot!.querySelector('form');
    const codeInput = element.shadowRoot!.querySelector('#code');
    const passwordInput = element.shadowRoot!.querySelector('#password');
    const passwordCheckInput = element.shadowRoot!.querySelector('#password-check');
    const safetyAnswerOneInput = element.shadowRoot!.querySelector('#safetyAnswerOne');
    const safetyAnswerTwoInput = element.shadowRoot!.querySelector('#safetyAnswerTwo');
    const submitButton = element.shadowRoot!.querySelector('button[type="button"]');

    expect(form).to.exist;
    expect(codeInput).to.exist;
    expect(passwordInput).to.exist;
    expect(passwordCheckInput).to.exist;
    expect(safetyAnswerOneInput).to.exist;
    expect(safetyAnswerTwoInput).to.exist;
    expect(submitButton).to.exist;
  });

  it('submits the form and navigates to "/news" when valid data is entered', async () => {
    const element = await fixture(html`<app-activation></app-activation>`);
    const codeInput = element.shadowRoot!.querySelector('#code') as HTMLInputElement;
    const passwordInput = element.shadowRoot!.querySelector('#password') as HTMLInputElement;
    const passwordCheckInput = element.shadowRoot!.querySelector('#password-check') as HTMLInputElement;
    const safetyAnswerOneInput = element.shadowRoot!.querySelector('#safetyAnswerOne') as HTMLInputElement;
    const safetyAnswerTwoInput = element.shadowRoot!.querySelector('#safetyAnswerTwo') as HTMLInputElement;
    const submitButton = element.shadowRoot!.querySelector('#submitbutton') as HTMLButtonElement;

    codeInput!.value = '123456';
    passwordInput!.value = 'Password123';
    passwordCheckInput!.value = 'Password123';
    safetyAnswerOneInput!.value = 'Pizza';
    safetyAnswerTwoInput!.value = 'Tiger';

    submitButton!.click();

    expect(
      stubPost.calledWith('users/activation', {
        code: '123456',
        password: 'Password123',
        passwordCheck: 'Password123',
        safetyAnswerOne: 'Pizza',
        safetyAnswerTwo: 'Tiger'
      })
    ).to.be.true;

    expect(stubNavigate.calledWith('/news'));
  });

  it('displays password constraints when "?" button is clicked', async () => {
    const element = await fixture(html`<app-activation></app-activation>`);
    const activationComponent = element as LitElement;
    const constraintButton = element.shadowRoot!.querySelector('#constraintButton') as HTMLButtonElement;

    constraintButton.click();

    await activationComponent.updateComplete;
    const constraintsContainer = element.shadowRoot!.querySelector('.constraints');

    expect(constraintsContainer).to.not.be.null;
    expect(constraintsContainer!.textContent).to.contain('Password must be between 8 and 32 characters long');
    expect(constraintsContainer!.textContent).to.contain('One lowercase letter [a-z]');
    expect(constraintsContainer!.textContent).to.contain('One uppercase letter [A-Z]');
    expect(constraintsContainer!.textContent).to.contain('One digit [0-9]');
  });
});
