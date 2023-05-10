/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './leaderboard.css?inline';

@customElement('app-leaderboard')
class AppHeaderComponent extends LitElement {
  static styles = componentStyle;
  render() {
    return html` <div id="kreis"></div>
      <div id="content">
        <div id="pagetitle">leaderboard</div>
        <div id="images">
          <div class="frame"></div>
          <div class="frame"></div>
          <div class="frame"></div>
        </div>
        <div id="placements">
          <ol>
            <li>
              <div class="position">
                <div><a href="#top">Alex</a></div>
                <div>1234567</div>
              </div>
            </li>
            <li>
              <div class="position">
                <div><a href="#top">Lakzan</a></div>
                <div>1234567</div>
              </div>
            </li>
            <li>
              <div class="position">
                <div><a href="#top">Nico</a></div>
                <div>1234567</div>
              </div>
            </li>
            <li>
              <div class="position">
                <div><a href="#top">Alex</a></div>
                <div>1234567</div>
              </div>
            </li>
            <li>
              <div class="position">
                <div><a href="#top">Alex</a></div>
                <div>1234567</div>
              </div>
            </li>
          </ol>
        </div>
      </div>`;
  }
}
