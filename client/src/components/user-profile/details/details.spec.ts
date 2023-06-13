/* Autor: Nico Pareigis */

import { expect } from 'chai';
import { fixture, html, oneEvent } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './details';
import { ProfileMain } from './details';
import { UserData } from '../types';

let userData: Pick<UserData, 'id' | 'email' | 'username'>;

describe('user-profile-details', () => {
  let el: ProfileMain;
  let sr: ShadowRoot;
  let name: HTMLInputElement;
  let email: HTMLInputElement;

  beforeEach(async () => {
    userData = {
      id: 0,
      email: 'admin@bigstocks.com',
      username: 'HarryHacker'
    };

    el = (await fixture(html`<user-profile-details .data="${userData}"></user-profile-details>`)) as ProfileMain;
    sr = el.shadowRoot!;
    name = sr.querySelector('#name') as HTMLInputElement;
    email = sr.querySelector('#email') as HTMLInputElement;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should fill in user data', () => {
    expect(name.value).to.equal(userData.username);
    expect(email.value).to.equal(userData.email);
  });

  it('should prevent invalid input submission', () => {
    const thisCheckValidity = sinon.spy(el, 'checkValidity');
    const checkValidity = sinon.spy(sr.querySelector('form') as HTMLFormElement, 'checkValidity');
    const eventSpy = sinon.spy(el, 'dispatchEvent');
    const button = sr.querySelector('button:first-of-type') as HTMLButtonElement;

    // unchanged data
    button.click();

    expect(thisCheckValidity.calledOnceWith(true)).to.be.true;
    expect(checkValidity.calledOnce).to.be.true;
    expect(name.validity.customError).to.be.false;
    expect(email.validity.customError).to.be.false;
    expect(eventSpy.calledWith(sinon.match.instanceOf(CustomEvent))).to.be.false;

    // -------------
    sinon.reset();
    // -------------

    // invalid name
    name.value = 'Harry/Hacker';
    button.click();

    expect(thisCheckValidity.calledOnceWith(true)).to.be.true;
    expect(checkValidity.calledOnce).to.be.true;
    expect(name.validity.customError).to.be.true;
    expect(eventSpy.calledWith(sinon.match.instanceOf(CustomEvent))).to.be.false;

    // -------------
    sinon.reset();
    // -------------

    // invalid email
    email.value = 'admin@bigstocks.';
    button.click();

    expect(thisCheckValidity.calledOnceWith(true)).to.be.true;
    expect(checkValidity.calledOnce).to.be.true;
    expect(email.validity.customError).to.be.true;
    expect(eventSpy.calledWith(sinon.match.instanceOf(CustomEvent))).to.be.false;
  });

  it('should submit successfully', async () => {
    name.value = 'harryHacker';
    const listener = oneEvent(el, 'submit-req');
    (sr.querySelector('button') as HTMLButtonElement).click();

    expect((await listener).detail).to.be.an('object');
    expect((await listener).detail.cb).to.be.a('function');
    expect((await listener).detail.confirm).to.be.true;
  });
});
