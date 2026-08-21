export class EventBus {
    private listeners: Map<string, Function[]>;

    constructor() {
        this.listeners = new Map();
    }

    on(event: string, callback: Function): void {
        // 1. Look up the array for this event.
        // 2. If it exists, append the callback.
        // 3. Otherwise, create a new array containing the callback.
        const eventListeners: Function[] = this.listeners.get(event) || [];
        this.listeners.set(event, [...eventListeners, callback]);
    }

    emit(event: string, payload: unknown): void {
        // 1. Look up this event's listeners.
        // 2. If there are none, do nothing.
        // 3. Invoke every listener with the payload.
        const eventListeners: Function[] | undefined = this.listeners.get(event);
        if (!eventListeners) { return; }
        eventListeners.forEach((listener: Function) => listener(payload));
    }
    off(event: string, callback: Function): void {
        // 1. Look up this event's listeners.
        // 2. If there are none, do nothing.
        // 3. Remove callbacks whose identity matches `callback`.
        // 4. Store the remaining callbacks.

        const eventListeners: Function[] | undefined = this.listeners.get(event);
        if (!eventListeners) { return; }
        const remainingEventListers: Function[] = eventListeners.filter((listener: Function) => listener !== callback);
        if (remainingEventListers.length === 0) {
            this.listeners.delete(event);
            return;
        }
        this.listeners.set(event, remainingEventListers);
    }
}