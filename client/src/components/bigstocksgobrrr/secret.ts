import { LitElement, html, css } from 'lit';
import { httpClient } from '../../http-client.js';
import { customElement, eventOptions, property } from 'lit/decorators.js';
import componentStyle from './secret.css?inline';

@customElement('app-minesweeper')
class SecretAppComponent extends LitElement {
  static styles = componentStyle;

  @property({ type: Array })
  requests: any[] = [];

  rows = 8;
  cols = 8;
  totalMines = 2;

  board: { element: HTMLDivElement; hasMine: boolean; revealed: boolean; marked: boolean }[][] = [];
  gameOver = false;
  successfulGame = false;
  highscore = 0;

  messageElement!: HTMLDivElement;
  restartButton!: HTMLButtonElement;
  highscoreElement!: HTMLDivElement;

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.handleRightClick = this.handleRightClick.bind(this);
    this.restartGame = this.restartGame.bind(this);
  }

  createBoard() {
    const boardElement = this.shadowRoot?.querySelector('.board') as HTMLDivElement;
    if (!boardElement) return;

    for (let i = 0; i < this.rows; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.cols; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'hidden');
        cell.dataset.row = i.toString();
        cell.dataset.col = j.toString();
        boardElement.appendChild(cell);
        this.board[i][j] = { element: cell, hasMine: false, revealed: false, marked: false };
        cell.addEventListener('click', this.handleClick);
        cell.addEventListener('contextmenu', this.handleRightClick);
      }
    }
  }

  placeMines() {
    let minesToPlace = this.totalMines;
    while (minesToPlace > 0) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      if (!this.board[row][col].hasMine) {
        this.board[row][col].hasMine = true;
        minesToPlace--;
      }
    }
  }

  isValidCell(row: number, col: number) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  countSurroundingMines(row: number, col: number) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (this.isValidCell(newRow, newCol) && this.board[newRow][newCol].hasMine) {
          count++;
        }
      }
    }
    return count;
  }

  revealCell(row: number, col: number) {
    const cell = this.board[row][col];
    if (!cell.revealed && !cell.marked) {
      cell.revealed = true;
      cell.element.classList.remove('hidden');
      cell.element.classList.add('revealed');
      if (cell.hasMine) {
        cell.element.classList.add('mine');
        this.gameOver = true;
        if (this.messageElement) this.messageElement.textContent = 'Game Over';
        if (this.restartButton) this.restartButton.style.display = 'block';
        if (!this.successfulGame) {
          this.showGameOver();
        }
        if (this.highscoreElement) this.highscoreElement.textContent = `Highscore: ${this.highscore}`;
      } else {
        const count = this.countSurroundingMines(row, col);
        if (count > 0) {
          cell.element.textContent = count.toString();
        }
      }
    }
  }

  markCell(row: number, col: number) {
    const cell = this.board[row][col];
    if (!cell.revealed) {
      cell.marked = true;
      cell.element.classList.add('marked');
    }
  }

  handleClick(event: Event) {
    if (this.gameOver || this.successfulGame) return;
    const target = event.target as HTMLDivElement;
    const row = parseInt(target.dataset.row || '0');
    const col = parseInt(target.dataset.col || '0');
    this.revealCell(row, col);
    this.checkGameCompleted();
  }

  handleRightClick(event: Event) {
    event.preventDefault();
    if (this.gameOver || this.successfulGame) return;
    const target = event.target as HTMLDivElement;
    const row = parseInt(target.dataset.row || '0');
    const col = parseInt(target.dataset.col || '0');
    this.markCell(row, col);
    this.checkGameCompleted();
  }

  restartGame() {
    const boardElement = this.shadowRoot?.querySelector('.board') as HTMLDivElement;
    if (!boardElement) return;

    boardElement.innerHTML = '';
    this.board = [];
    this.gameOver = false;
    this.successfulGame = false;
    if (this.messageElement) this.messageElement.textContent = '';
    if (this.highscoreElement) this.highscoreElement.textContent = `Highscore: ${this.highscore}`;
    this.initGame();
  }

  initGame() {
    this.createBoard();
    this.placeMines();
  }

  checkGameCompleted() {
    if (this.gameOver) return;
    let allMinesMarked = true;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const cell = this.board[i][j];
        if (!cell.revealed && cell.hasMine && !cell.marked) {
          allMinesMarked = false;
          break;
        }
      }
      if (!allMinesMarked) {
        break;
      }
    }
    if (allMinesMarked) {
      this.showVictory();
    }
  }

  showGameOver() {
    console.log('game over');
  }

  showVictory() {
    console.log('great success');
  }

  @eventOptions({ capture: true })
  async firstUpdated() {
    this.initGame();

    const appHeader = this.dispatchEvent(
      new CustomEvent('update-pagename', { detail: 'Minesweeper', bubbles: true, composed: true })
    );

    try {
      const response = await httpClient.get('minesweeper');
      const data = await response.json();

      console.log('data:', data);
    } catch (e) {
      console.log((e as Error).message, 'error');
    }
  }

  render() {
    return html`
      <div id="container">
        <div id="username">Username</div>
        <div id="highscore">Highscore: ${this.highscore}</div>
        <div class="board"></div>
        <div id="message"></div>
        <button id="restart-button" @click="${this.restartGame}">Restart</button>
        If you found this, you are an absolute legend. You are smart, handsome. <br />
        big PP energy spreads from you
      </div>
    `;
  }
}
