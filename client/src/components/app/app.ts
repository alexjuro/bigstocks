/* Autor: Alexander Lesnjak */
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('app-root')
class AppComponent extends LitElement {
  render() {
    return html` <app-header></app-header>
    <app-main></app-root>`;
  }
}
