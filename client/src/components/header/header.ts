/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './header.css?inline';
//import backgroundsvg from './backgroundlogo.svg';

const bglogo = './Mediamodifier-Design.svg';
const list = './list-ol.svg';
const person = './person-fill.svg'



@customElement('app-header')
class AppHeaderComponent extends LitElement {
    static styles = [componentStyle, sharedStyle];
  render() {
    return html`
      <div id="bigcontainer">
        <div id="headcontainerbackground" class="flexcontainer">
          <img src="./Mediamodifier-Design.svg" alt="" height="100%" class="logomask">
        </div>
        <div id="headcontainer" class="flexcontainer">
          <div>
            <a href="">
              <img src="./list-ol.svg" alt="" class="iconmask">
            </a>
          </div>
          <div>
            <a href="#top" id="logotext">bigstocks</a>
          </div>
          <div>
            <a href="">
              <img src="./person-fill.svg" alt="" class="iconmask">
            </a>
          </div>
        </div>
      </div>`;
  }
}
