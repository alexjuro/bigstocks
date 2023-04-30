/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';

@customElement('app-leaderboard')
class AppLeaderComponent extends LitElement {
  render() {
    const styles = sharedStyle;
    return html`<h1>Hello World!</h1>`;
  }
}