/* Autor: Alexander Lesnjak */

import { expect } from 'chai';
import { fixture, html } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './friends';
import { AppFriendsComponent } from './friends';

describe('app-friends', () => {
  let e: AppFriendsComponent;

  beforeEach(async () => {
    e = await fixture(html`<app-friends></app-friends>`);
  });

  afterEach(() => {
    sinon.restore();
  });

  //+
  it('should render properly', async () => {
    const friendsContainer = e.shadowRoot!.getElementById('friendsContainer');
    const addMethod = e.shadowRoot!.getElementById('addMethod');
    const textFreunde = e.shadowRoot!.getElementById('textFreunde');
    const addwindow = e.shadowRoot!.getElementById('addwindow');
    const feedback = e.shadowRoot!.getElementById('feedback');
    const requestwindow = e.shadowRoot!.getElementById('requestwindow');
    const friendsList = e.shadowRoot!.getElementById('friendsList');
    const friendswindow = e.shadowRoot!.getElementById('friendswindow');

    expect(friendsContainer).to.exist;
    expect(addMethod).to.exist;
    expect(textFreunde).to.exist;
    expect(addwindow).to.exist;
    expect(feedback).to.exist;
    expect(requestwindow).to.exist;
    expect(friendsList).to.exist;
    expect(friendswindow).to.exist;

    expect(e.scollToForm).to.be.a('function');
    expect(e.addFriend).to.be.a('function');
    expect(e._displaySuccess).to.be.a('function');
    expect(e._displayError).to.be.a('function');
    expect(e.acceptRequest).to.be.a('function');
    expect(e.declineRequest).to.be.a('function');
    expect(e.deleteFriend).to.be.a('function');
    expect(e.reloadComponent).to.be.a('function');
  });

  //+
  it('should be mobile responsive', async () => {
    window.innerWidth = 600;

    await e.updateComplete;

    const addFriend = e.shadowRoot!.querySelector('#addFriend') as HTMLElement;
    const friendsContainer = e.shadowRoot!.querySelector('#friendsContainer') as HTMLElement;
    const friendsList = e.shadowRoot!.querySelector('#friendsList') as HTMLElement;

    expect(getComputedStyle(addFriend).display).to.equal('flex');
    expect(window.getComputedStyle(friendsContainer).flexDirection).to.equal('column-reverse');
    expect(window.getComputedStyle(friendsList).maxHeight).to.equal('500px');

    window.innerWidth = 1920;

    await e.updateComplete;
  });

  //+
  it('should do addFriend() when  clicked on button and give feedback that the user does not exist', async () => {
    //const input = e.shadowRoot!.querySelector('#input') as HTMLInputElement;
    const sendbtn = e.shadowRoot!.querySelector('#sendbtn') as HTMLElement;
    const feedback = e.shadowRoot!.querySelector('#feedback') as HTMLElement;

    //input.value = 'dfgahsfuajksgf';
    sendbtn.click();

    expect(feedback.classList.contains('no')).to.be.true;
    expect(feedback.innerHTML).to.equal('Please enter a username');
  });

  //+
  it('should add a yes class to feedback when _displaySuccess()', async () => {
    const feedback = e.shadowRoot!.querySelector('#feedback') as HTMLElement;
    e._displaySuccess();
    expect(feedback.classList.contains('yes')).to.be.true;
  });
});
