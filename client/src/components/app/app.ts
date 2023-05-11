/* Autor: Alexander Lesnjak */
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { router } from '../../router/router';

@customElement('app-root')
class AppComponent extends LitElement {
  render() {
    return html` <app-header></app-header>`;
  }
}
