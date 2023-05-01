/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './header2.css?inline';

@customElement('app-header2')
class AppHeaderComponent extends LitElement {
    static styles = componentStyle
  render() {
    return html`
    <div id="container">
        <div id="layerone">
            <img src="./logo.svg" alt="">
        </div>
        <div id="layertwo">
            <a href="" id="logotxt">bigstocks</a>
            <a href="" id="profiltxt">profil</a>
        </div>
    </div>`;
  }
}