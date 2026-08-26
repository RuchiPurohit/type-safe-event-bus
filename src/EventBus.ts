
type Listener<TPayload> = (payload: TPayload) => void;

type ListenerMap<TEvents> = {
    [K in keyof TEvents]?: Listener<TEvents[K]>[];
}


export class EventBus<TEvents> {
    private listeners: ListenerMap<TEvents>;

    constructor() {
        this.listeners = {};
    }

    on<K extends keyof TEvents>(event: K, callback: Listener<TEvents[K]>): void {
        // 1. Look up the array for this event.
        // 2. If it exists, append the callback.
        // 3. Otherwise, create a new array containing the callback.

        const eventListeners = this.listeners[event] ?? [];
        this.listeners[event] = [...eventListeners, callback];
    }

    emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
        // 1. Look up this event's listeners.
        // 2. If there are none, do nothing.
        // 3. Invoke every listener with the payload.

        const eventListeners = this.listeners[event];
        if (!eventListeners) { return; }
        eventListeners.forEach((listener) => listener(payload));
    }
    off<K extends keyof TEvents>(event: K, callback: Listener<TEvents[K]>): void {
        // 1. Look up this event's listeners.
        // 2. If there are none, do nothing.
        // 3. Remove callbacks whose identity matches `callback`.
        // 4. Store the remaining callbacks.

        const eventListeners = this.listeners[event];
        if (!eventListeners) { return; }
        const remainingEventListers = eventListeners.filter((listener) => listener !== callback);
        if (remainingEventListers.length === 0) {
            delete this.listeners[event];
            return;
        }
        this.listeners[event] = remainingEventListers;
    }
}
