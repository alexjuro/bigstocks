import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';
import newsStyle from './news.css?inline';
import sharedStyle from '../shared.css?inline';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';

interface Article {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string[];
  source: string;
  summary: string;
  url: string;
}

@customElement('finnhub-market-news')
class FinnHubMarketNews extends PageMixin(LitElement) {
  static styles = [newsStyle, sharedStyle];
  apiKey = 'chdrhk1r01qi6ghjs8s0chdrhk1r01qi6ghjs8sg';
  category = 'general';
  minId = 0;
  articles: Article[] = [];
  error = '';

  static get properties() {
    return {
      apiKey: { type: String },
      category: { type: String },
      minId: { type: Number },
      articles: { type: Array },
      error: { type: String }
    };
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

  async fetchArticles() {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/news?category=${this.category}&minId=${this.minId}&token=${this.apiKey}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No news articles found.');
      }
      this.articles = data as Article[];
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        this.error = error.message;
      } else if (typeof error === 'string') {
        this.error = error;
      } else {
        this.error = 'An unknown error occurred.';
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchArticles(); // Fetch initial data
    setInterval(() => {
      this.fetchArticles(); // Fetch new data every 3 minutes
    }, 18000);
  }

  // Hilfsfunktion zur Entfernung von doppelten Punkten am Anfang der Überschrift
  cleanHeadline(headline: string): string {
    if (headline.startsWith(':')) {
      return headline.slice(1).trim();
    }
    return headline.trim();
  }

  render() {
    return html`
      <h1 class="market-news-header">Market News</h1>
      <div class="market-news">
        ${this.error ? html`<p>Error: ${this.error}</p>` : ''}
        ${this.articles.map(
          article => html`
            <div class="article">
              <div class="article-image-container">
                ${article.image
                  ? html` <img src="${article.image}" alt="${article.headline}" class="article-image" /> `
                  : ''}
                <h2 class="article-headline">${this.cleanHeadline(article.headline)}</h2>
              </div>
              <div class="article-content">
                <p class="article-summary">${article.summary}</p>
                <a href="${article.url}" target="_blank" rel="noopener">Read more</a>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }
}
