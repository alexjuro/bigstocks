import { LitElement, html, css } from 'lit';
import { httpClient } from '../../http-client.js';
import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import componentStyle from './minesweeper.css?inline';
import { router } from '../../router/router.js';

@customElement('app-minesweeper')
class SecretAppComponent extends LitElement {
  static styles = componentStyle;

  @state() request = httpClient.get('minesweeper').then(async res => (await res.json()) as any);

  @property()
  username: string = '';

  @property()
  tries: number = 0;

  @property()
  cash: number = 0;
  cashString: string = '';

  rows = 8;
  cols = 8;
  totalMines = 1;
  marksleft = 10;

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
    if (this.marksleft == 0) {
      return;
    }

    event.preventDefault();
    if (this.gameOver || this.successfulGame) return;
    const target = event.target as HTMLDivElement;
    const row = parseInt(target.dataset.row || '0');
    const col = parseInt(target.dataset.col || '0');

    this.marksleft = this.marksleft - 1; // Setze marksleft auf den ursprünglichen Wert
    const marksleftElement = this.shadowRoot?.getElementById('marksleft');
    marksleftElement!.innerHTML = `marksleft: ${this.marksleft}`;

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

    //turn of the Game Over/ Victory  message
    const messageElement = this.shadowRoot!.getElementById('message');
    messageElement!.innerHTML = '';

    //reset the marksleft to 10
    this.marksleft = 10;
    const marksleftElement = this.shadowRoot?.getElementById('marksleft');
    marksleftElement!.innerHTML = `marksleft: ${this.marksleft}`;

    this.initGame();
  }

  async restartPost() {
    try {
      const response = await httpClient.post('minesweeper/restart', '');
      console.log('updated tries');
    } catch (e) {
      console.log('error');
    }
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
      }
    }
    if (allMinesMarked) {
      this.showVictory();
    }
  }

  async showGameOver() {
    console.log('game over');
    const messageElement = this.shadowRoot!.getElementById('message');
    messageElement!.innerHTML = 'Game Over';

    //decrease the amount of tries by one
    if (this.tries != 0) {
      this.restartPost();
      this.changeTries();
    }
  }

  showVictory() {
    console.log('great success');
    const messageElement = this.shadowRoot!.getElementById('message');
    messageElement!.innerHTML = 'You won!';

    if (this.tries != 0) {
      this.cash = this.cash + 500;
      this.cashString = this.cash.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: false
      });
      const cashElem = this.shadowRoot?.getElementById('cash');
      cashElem!.innerHTML = `cash: ${this.cashString} $`;
    }

    //decrease the amount of tries by one
    if (this.tries != 0) {
      this.restartPost();
      this.changeTries();
      this.victoryPost();
    }
  }

  async victoryPost() {
    try {
      const response = await httpClient.post('minesweeper/victory', '');
      console.log('updated money');
    } catch (e) {
      console.log('error');
    }
  }

  changeTries() {
    const marksleftElement = this.shadowRoot?.getElementById('tries');
    marksleftElement!.innerHTML = `Tries left: ${this.tries} -1`;
    this.tries = this.tries - 1;

    setTimeout(() => {
      marksleftElement!.innerHTML = `Tries left: ${this.tries}`;
    }, 1000);
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

      this.username = data.username;
      this.tries = data.tries.value;
      this.cash = data.money;
      this.cashString = this.cash.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: false
      });

      const usernameElem = this.shadowRoot?.getElementById('username');
      usernameElem!.innerHTML = `${this.username}`;

      const cashElem = this.shadowRoot?.getElementById('cash');
      cashElem!.innerHTML = `cash: ${this.cashString} $`;

      const triesElem = this.shadowRoot?.getElementById('tries');
      triesElem!.innerHTML = `Tries left: ${this.tries}`;
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      } else {
        console.log((e as Error).message);
      }
    }
  }

  render() {
    return html`
      <div id="container">
        <div id="username">...</div>
        <div id="cash">cash: ... $</div>
        <div id="tries">Tries left: ...</div>
        <div class="board"></div>
        <div id="message"></div>
        <div id="marksleft">Marks left: ${this.marksleft}</div>
        <button id="restart-button" @click="${this.restartGame}">Restart</button>

        <div id="how">
          <h4>How it works:</h4>
          <br />
          There is no warm up!
          <br />
          Everytime you win or lose your tries decrease by one. You get 3 tries every day. If you feel like you are
          loosing, you can restart the One win adds 500$ to your cash. game. If you have never played minesweeper
          before:
          <h5>Here is a quick Tutorial:</h5>
          Once you leftclick on a field it reveals how many mines are in a one block radius around the field. To win you
          have to mark all mine with a rightclick on your mice.
          <br />
          <br />
          That's it. Enjoy!
        </div>
      </div>
    `;
  }
}
