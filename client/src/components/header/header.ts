/* Autor: Alexander Lesnjak */
// Problem: click auf news laedt die Seite neu

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './style.css?inline';

@customElement('app-header')
class AppHeaderComponent extends LitElement {
  static styles = componentStyle;
  render() {
    return html` <div id="headercontainer">
      <div id="logo" onclick="leaderboard()">bigstocks</div>
      <div id="nav">
        <div class="navelem"><a href="/news">news</a></div>
        <div class="navelem" onclick="portfolio()">portfolio</div>
        <div class="navelem" onclick="profile()">profile</div>
      </div>
    </div>`;
  }
}
