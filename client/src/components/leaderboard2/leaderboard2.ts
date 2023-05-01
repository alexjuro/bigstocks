/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './leaderboard2.css?inline'


@customElement('app-leaderboard2')
class AppLeaderboardComponent extends LitElement {
  static styles = componentStyle
  render() {
    return html`
    <div id="maincontainer">
        <div id="left"></div>
        <div id="main">
            <div class="spacer"></div>

            <div id="topthree">
                <div id="spaceone" class="placementnames">
                    <img src="./crown-solid.svg" alt="" id="throphyone">
                    <a href="">alexS</a>
                </div>
                <div id="spacetwo" class="placementnames">
                    <img src="./trophy-fill.svg" alt="" id="throphytwo">
                    <a href="">Nico</a>
                </div>
                <div id="spacethree" class="placementnames">
                    <img src="./trophy-fill.svg" alt="" id="throphythree">
                    <a href="">Lakzan</a>
                </div>
                <div id="one" class="placement">#1</div>
                <div id="two" class="placement">#2</div>
                <div id="three" class="placement"> #3</div>
            </div>

            <div class="spacer"></div>

            <div id="board">
                <div id="names" class="boardhalf">
                    <ol>
                        <li><a href="">alexS</a></li>
                        <li><a href="">Lakzan</a></li>
                        <li><a href="">Nico</a></li>
                        <li><a href="">alexL</a></li>
                    </ol>
                </div>
                <div id="scores" class="boardhalf">
                    <ol>
                        <li>10000</li>
                        <li>1000</li>
                        <li>100</li>
                        <li>10</li>
                    </ol>
                </div>
            </div>

        </div>
        <div id="right"></div>
    </div>`;
  }
}