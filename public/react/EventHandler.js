export class EventHandler {
  constructor() {
    this.listeners = {};
  }

  on(type, handler) {
    if (this.listeners[type] == null) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(handler);
  }

  off(type, handler) {
    _.pull(this.listeners[type], handler);
  }

  dispatch(type, event) {
    _.forEach(this.listeners[type], (handler) => handler(event));
  }
}
