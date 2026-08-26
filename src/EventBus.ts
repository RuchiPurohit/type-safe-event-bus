

export class EventBus<TEvents> {
    private listeners: Map<string, Function[]>;

    constructor() {
        this.listeners = new Map();
    }

    on<K extends keyof TEvents>(event: K, callback: (payload: TEvents[K]) => void): void {
        // 1. Look up the array for this event.
        // 2. If it exists, append the callback.
        // 3. Otherwise, create a new array containing the callback.
        const eventName = String(event);
        const eventListeners: Function[] = this.listeners.get(eventName) || [];
        this.listeners.set(eventName, [...eventListeners, callback]);
    }

    emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
        // 1. Look up this event's listeners.
        // 2. If there are none, do nothing.
        // 3. Invoke every listener with the payload.
        const eventName = String(event);
        const eventListeners: Function[] | undefined = this.listeners.get(eventName);
        if (!eventListeners) { return; }
        eventListeners.forEach((listener: Function) => listener(payload));
    }
    off<K extends keyof TEvents>(event: K, callback: (payload: TEvents[K]) => void): void {
        // 1. Look up this event's listeners.
        // 2. If there are none, do nothing.
        // 3. Remove callbacks whose identity matches `callback`.
        // 4. Store the remaining callbacks.
        const eventName = String(event);
        const eventListeners: Function[] | undefined = this.listeners.get(eventName);
        if (!eventListeners) { return; }
        const remainingEventListers: Function[] = eventListeners.filter((listener: Function) => listener !== callback);
        if (remainingEventListers.length === 0) {
            this.listeners.delete(eventName);
            return;
        }
        this.listeners.set(eventName, remainingEventListers);
    }
}
