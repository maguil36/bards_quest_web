export class BaseOrchestrator {
    constructor() {
        this.listeners = new Map();
        this.isActive = false;
    }

    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(callback);
    }

    off(eventName, callback) {
        if (!this.listeners.has(eventName)) return;
        const callbacks = this.listeners.get(eventName);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(eventName, ...args) {
        if (!this.listeners.has(eventName)) return;
        const callbacks = this.listeners.get(eventName);
        callbacks.forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`[${this.constructor.name}] Error in event '${eventName}':`, error);
            }
        });
    }

    initialize() {
        this.isActive = true;
    }

    pause() {
        this.isActive = false;
    }

    resume() {
        this.isActive = true;
    }

    update(deltaTime) {
    }

    render(ctx) {
    }

    destroy() {
        this.listeners.clear();
        this.isActive = false;
    }
}
