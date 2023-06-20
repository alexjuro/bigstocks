/* Autor: Alexander Schellenberg */
import { LitElement, css, html } from 'lit';
import { PageMixin } from '../../page.mixin';
import { customElement } from 'lit/decorators.js';

@customElement('app-trading-notification')
export class NotificationComponent extends PageMixin(LitElement) {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    }

    .notification {
      display: none;
      width: 100px;
      height: 55px;
      position: absolute;
      bottom: 2.5%;
      left: 5%;
      transform: translate(-10%, -10%);
      padding: 10px;
      background-color: rgba(0, 0, 0, 0.8);
      color: #fff;
      font-size: 12px;
      text-align: center;
      transition: opacity 0.3s ease;
      pointer-events: auto;
      border-radius: 5%;
      border: 2px solid #6a5acd;
    }

    .success {
      background-color: rgba(0, 128, 0, 0.9);
      display: block;
    }

    .warning {
      background-color: rgba(200, 105, 0, 0.9);
      display: block;
    }

    .error {
      background-color: rgba(255, 0, 0, 0.9);
      display: block;
    }

    @media screen and (max-width: 500px) {
      left: 10%;
    }
  `;

  render() {
    return html`<div id="noti" class="notification"></div>`;
  }
}
