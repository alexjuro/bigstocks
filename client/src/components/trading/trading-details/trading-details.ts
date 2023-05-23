import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './trading-details.css?inline';
import sharedTradingStyle from '../shared-trading.css?inline';
import { TradingComponent } from '../tradingcomponent.js';
import { httpClient } from '../../../http-client';
import { router } from '../../../router/router';

@customElement('app-trading-details')
class TradingDetailsComponent extends TradingComponent {
  static styles = [sharedStyle, componentStyle, sharedTradingStyle];

  constructor() {
    super();
  }

  async firstUpdated() {
    try {
      this.startAsyncInit();
      const newStatusJSON = await httpClient.get('/users/new' + location.search);
      const newStatus = (await newStatusJSON.json()).new;
      if (newStatus) {
        this.showNotification('new user was created successfully', 'info');
      }
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    } finally {
      this.finishAsyncInit();
    }
  }

  // Hier können zusätzliche Properties hinzugefügt werden, um die benötigten Informationen zu speichern
  connectedCallback() {
    super.connectedCallback();
    this.requestUpdate();
    console.log('JA');
  }

  render() {
    return html`
      ${this.renderNotification()}
      <div>
        <h1>Test</h1>
      </div>
    `;
  }
}
