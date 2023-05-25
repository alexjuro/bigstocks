/* Author: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import sharedStyle from '../../shared.css?inline';
import sharedLocalStyle from '../shared-local.css?inline';
import componentStyle from './constraints.css?inline';
import { PageMixin } from '../../page.mixin';

export type Constraint = {
  section: string;
  bullets?: string[];
};

@customElement('field-constraints')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Constraints extends PageMixin(LitElement) {
  static styles = [sharedStyle, sharedLocalStyle, componentStyle];

  @property() title = 'Contraints';
  @property() constraints!: Constraint[];

  @query('.content') content!: HTMLDivElement;

  render() {
    return html`<div class="wrapper">
      <button type="button" @click="${this.toggleConstraints}">${this.title}</button>
      <div class="shadow">
        <div class="content">
          <ol>
            ${map(
              this.constraints,
              i => html`
                <li>${i.section}</li>
                <ul>
                  ${map(i.bullets, b => html`<li>${b}</li>`)}
                </ul>
              `
            )}
          </ol>
        </div>
      </div>
    </div>`;
  }

  toggleConstraints() {
    this.content.classList.toggle('pinned');
  }
}
