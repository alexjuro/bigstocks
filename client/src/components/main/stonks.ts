import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';
import { LitElement, html } from 'lit';
import sharedStyle from '../shared.css?inline';

// The Main Page
@customElement('app-stonks')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MainComponent extends PageMixin(LitElement) {
  static style = sharedStyle;

  render() {
    return html` <h1>MAIN</h1>
      <img
        src="https://c4.wallpaperflare.com/wallpaper/838/806/561/satoru-gojo-one-piece-hd-wallpaper-preview.jpg"
        alt="SUCCECS"
      />`;
  }
}
