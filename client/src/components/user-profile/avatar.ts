import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client';
import sharedStyle from '../shared.css?inline';
import componentStyle from './avatar.css?inline';

// FIX: also used in other components, export?
type Data = {
  name: string;
  email: string;
};

@customElement('user-profile-avatar')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProfileAvatar extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @query('input') input!: HTMLInputElement;

  @property() data!: Data;

  render() {
    return html`
      <h3>Avatar</h3>
      <form>
        <img src="SOURCE" alt="Profile Picture" />
        <input type="file" accept="image/png,image/jpeg" />
        <form-control @req-submit=${this.submit}></form-control>
      </form>
      <p>Accepted image formats are PNG and JPEG. Your image's size must not exceed 200KB.</p>
    `;
  }

  async submit() {
    const [valid, file] = this.checkValidity();
    if (!valid) {
      // TODO: render error
      console.log('error');
      return;
    }

    try {
      await httpClient.post('/users/profile', {
        email: this.data.email,
        avatar: file
      });
    } catch (e) {
      this.dispatchEvent(new CustomEvent('submit-error', { bubbles: true, detail: e }));
    }
  }

  checkValidity(): [boolean, File | null] {
    const files = this.input.files || new FileList();
    const valid =
      files.length === 1 && files[0].size <= 1024 * 200 && ['image/png', 'image/jpeg'].includes(files[0].type);
    const file = valid ? files[0] : null;
    return [valid, file];
  }

  // TODO: formatting, store+retrieve
}
