const GAME_KEYS = new Set([
  'Space', 'Enter',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'KeyA', 'KeyD', 'KeyW', 'KeyS',
]);

export class KeyboardInput {
  constructor() {
    this._keys = new Set();
    this._onKeyDown = e => {
      this._keys.add(e.code);
      if (GAME_KEYS.has(e.code)) e.preventDefault();
    };
    this._onKeyUp = e => {
      this._keys.delete(e.code);
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  isDown(code) {
    return this._keys.has(code);
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}
