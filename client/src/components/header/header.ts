/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './header.css?inline';


@customElement('app-header')
class AppHeaderComponent extends LitElement {
    static styles = [componentStyle, sharedStyle];
  render() {
    return html`
    <div id="bigcontainer">
      <div id="headcontainerbackground" class="flexcontainer">
          hello dies ist im hintergrund
      </div>
      <div id="headcontainer" class="flexcontainer">
          <div>1</div>
          <div>2</div>
          <div>3</div>
      </div>
    </div>`;
  }
}
