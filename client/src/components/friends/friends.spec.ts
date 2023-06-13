import { expect } from 'chai';
import { fixture, html, nextFrame } from '@open-wc/testing-helpers';
import './friends.ts';

describe('AppAddFriend', () => {
  let element: Element;

  beforeEach(async () => {
    element = await fixture(html`<app-friends></app-friends>`);
  });

  it('should not allow adding yourself as a friend', async () => {
    // Rufe die Methode zum Hinzufügen eines Freundes auf
    const addFriendButton = element.shadowRoot!.querySelector('#addwindow button') as HTMLButtonElement;
    const nameInput = element.shadowRoot!.querySelector('#input') as HTMLInputElement;
    nameInput.value = 'Ryan'; // Füge deinen Benutzernamen hier ein
    addFriendButton.click();

    // Warte auf die Aktualisierung des DOM nach dem Klick
    await nextFrame();

    // Überprüfe, ob das Feedback-Feld den Fehler anzeigt
    const feedbackElement = element.shadowRoot!.querySelector('#feedback');
    expect(feedbackElement!.classList.contains('no')).to.be.true;
    expect(feedbackElement!.innerHTML).to.equal('You tried to add yourself');
  });
});
