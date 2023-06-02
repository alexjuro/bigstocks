/* Author: Nico Pareigis */

import { expect } from 'chai';
import { fixture, html, oneEvent } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import './password';
import { UserData } from '../types';
import { LitElement } from 'lit';

// FIX: dispatchEvent-spies not being called
describe('user-profile-password', () => {
  let userData: Pick<UserData, 'id' | 'password'>;
  const ctPassword = 'strongPassword1';

  let el: LitElement;
  let sr: ShadowRoot;
  let pass1: HTMLInputElement;
  let pass2: HTMLInputElement;

  beforeEach(async () => {
    userData = {
      id: 0,
      password: await bcrypt.hash(ctPassword, 10)
    };

    el = (await fixture(html`<user-profile-password .data="${userData}"></user-profile-password>`)) as LitElement;
    sr = el.shadowRoot!;
    pass1 = sr.querySelector('#pass1') as HTMLInputElement;
    pass2 = sr.querySelector('#pass2') as HTMLInputElement;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should prevent invalid input submission', async () => {
    const setCustomValidity = sinon.spy(pass1, 'setCustomValidity');
    const checkValidity = sinon.spy(sr.querySelector('form') as HTMLFormElement, 'checkValidity');
    const dispatchEvent = sinon.spy(LitElement.prototype, 'dispatchEvent');
    const button = sr.querySelector('button:first-of-type') as HTMLButtonElement;
    let listener;

    const weakPass = 'weakpassword';
    const strongPass = 'VeryStrongNewPassword1';

    // weak password
    pass1.value = weakPass;
    pass2.value = weakPass;
    button.click();

    expect(setCustomValidity.calledOnceWith('pattern-mismatch')).to.be.true;
    expect(pass1.validity.customError).to.be.true;
    expect(checkValidity.calledOnce).to.be.true;
    expect(checkValidity.returned(false)).to.be.true;
    expect(dispatchEvent.calledWith(sinon.match.instanceOf(CustomEvent))).to.be.false;

    // -----------
    sinon.reset();
    // -----------

    // mismatched password
    pass1.value = strongPass;
    pass2.value = `${strongPass}123`;
    listener = oneEvent(el, 'submit-err');
    button.click();

    expect(setCustomValidity.calledOnceWith('')).to.be.true;
    expect(pass1.validity.customError).to.be.false;
    expect(checkValidity.calledOnce).to.be.true;
    expect(checkValidity.returned(true)).to.be.true;
    expect((await listener).detail).to.be.an('error');

    // -----------
    sinon.reset();
    // -----------

    // unchanged password
    const compare = sinon.stub(bcrypt, 'compare').resolves(true);

    pass1.value = ctPassword;
    pass2.value = ctPassword;
    listener = oneEvent(el, 'submit-err');
    button.click();

    expect(setCustomValidity.calledOnceWith('')).to.be.true;
    expect(pass1.validity.customError).to.be.false;
    expect(checkValidity.calledOnce).to.be.true;
    expect(checkValidity.returned(true)).to.be.true;
    expect(compare.calledOnceWith(ctPassword, userData.password)).to.be.true;
    expect((await listener).detail).to.be.an('error');
  });

  it('should submit successfully', async () => {
    const setCustomValidity = sinon.spy(pass1, 'setCustomValidity');
    const checkValidity = sinon.spy(sr.querySelector('form') as HTMLFormElement, 'checkValidity');
    const button = sr.querySelector('button:first-of-type') as HTMLButtonElement;

    const newPass = 'VeryStrongNewPassword1';

    pass1.value = newPass;
    pass2.value = newPass;
    const listener = oneEvent(el, 'submit-req');
    button.click();

    expect(setCustomValidity.calledOnceWith('')).to.be.true;
    expect(pass1.validity.customError).to.be.false;
    expect(checkValidity.calledOnce).to.be.true;
    expect(checkValidity.returned(true)).to.be.true;
    expect((await listener).detail).to.be.a('function');
  });
});
