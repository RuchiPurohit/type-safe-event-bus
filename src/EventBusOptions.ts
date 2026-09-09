export interface EventBusOptions<TEvents> {
    onError?: (
        error: unknown,
        event: keyof TEvents
    ) => void;
}