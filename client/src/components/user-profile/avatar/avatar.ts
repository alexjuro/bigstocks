/* Autor: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { httpClient } from '../../../http-client';
import sharedStyle from '../../shared.css?inline';
import sharedLocalStyle from '../shared-local.css?inline';
import componentStyle from './avatar.css?inline';
import { UserData } from '../types';

@customElement('user-profile-avatar')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProfileAvatar extends LitElement {
  static styles = [sharedStyle, sharedLocalStyle, componentStyle];

  @property() data!: Pick<UserData, 'id' | 'avatar'>;
  @property() file = 'No file chosen.';

  @query('input') input!: HTMLInputElement;
  @query('img') img!: HTMLImageElement;
  @query('#upload') upload!: HTMLButtonElement;

  private readonly mimeTypes = ['image/png', 'image/jpeg'];
  // via https://en.wikipedia.org/wiki/List_of_file_signatures
  private readonly mimeSig = ['89504e47da1aa', 'ffd8ffdb', 'ffd8ffe0', 'ffd8ffee'];
  private readonly loadError = new Error('Failed to laod image, please try again.');

  render() {
    return html`<div class="container">
      <div class="description">
        <h3>Avatar</h3>
        <p>Accepted image formats are PNG and JPEG.</p>
      </div>
      <form>
        <div class="inner">
          <img src="${this.data.avatar || 'avatar.png'}" />
          <div>
            <h4>Change avatar</h4>
            <div class="controls">
              <input type="file" accept="${this.mimeTypes.join(',')}" @change="${this.updateFile}" />
              <button type="button" @click="${() => this.input.click()}">Choose file...</button>
              <p id="file">${this.file}</p>
            </div>
            <p id="size">Image size must not exceed 200KiB.</p>
            <button id="upload" type="button" @click="${this.submit}">Upload</button>
          </div>
        </div>
      </form>
    </div>`;
  }

  firstUpdated() {
    this.img.onerror = () => {
      this.img.src = '';
      this.dispatchEvent(new CustomEvent('load-err', { bubbles: true, detail: 'Failed to load avatar.' }));
    };
  }

  updateFile() {
    if (this.input.files) {
      this.file = decodeURIComponent(this.input.files[0].name);
      this.upload.style.visibility = 'visible';
    }
  }

  async submit() {
    const file = await this.checkValidity();
    if (!file) {
      this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: new Error('Invalid file.') }));
      return;
    }

    this.dispatchEvent(
      new CustomEvent('submit-req', {
        bubbles: true,
        detail: {
          cb: async () => {
            try {
              await this.base64enc(file!).then(base64 => (this.data.avatar = base64));
              await httpClient
                .put('/users/account/avatar', this.data)
                .then(() =>
                  this.dispatchEvent(
                    new CustomEvent('submit-suc', { bubbles: true, detail: 'Avatar update successful.' })
                  )
                );
            } catch (e) {
              this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: e }));
            }
          },
          confirm: false
        }
      })
    );
  }

  async checkValidity(): Promise<File | null> {
    const files = this.input.files || new FileList();
    const valid =
      files.length === 1 &&
      files[0].size <= 1024 * 200 &&
      this.mimeTypes.includes(files[0].type) &&
      (await this.sniffMime(files[0]));

    return valid ? files[0] : null;
  }

  async sniffMime(file: File): Promise<boolean> {
    const reader = new FileReader();

    return new Promise((res, rej) => {
      reader.onload = () => {
        const hex = new Uint8Array(reader.result as ArrayBuffer);
        const hex4 = hex.subarray(0, 4).reduce((s, i) => s + i.toString(16), '');
        const hex8 = hex.reduce((s, i) => s + i.toString(16), '');
        res(this.mimeSig.includes(hex4) || this.mimeSig.includes(hex8));
      };
      reader.onerror = () => rej(this.loadError);
      reader.readAsArrayBuffer(file.slice(0, 8));
    });
  }

  async base64enc(file: File): Promise<string> {
    const reader = new FileReader();

    return new Promise((res, rej) => {
      reader.onload = () => res(reader.result as string);
      reader.onerror = () => rej(this.loadError);
      reader.readAsDataURL(file);
    });
  }
}
