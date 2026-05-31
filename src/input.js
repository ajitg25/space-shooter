export class KeyboardInput {
  constructor() {
    this._keys = new Set();
    window.addEventListener('keydown', e => {
      this._keys.add(e.code);
      e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      this._keys.delete(e.code);
    });
  }

  isDown(code) {
    return this._keys.has(code);
  }
}
