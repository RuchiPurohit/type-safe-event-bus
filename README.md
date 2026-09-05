# Type-safe Event Bus

A lightweight, strongly typed event bus for TypeScript applications. It lets
different parts of an application communicate through events while guaranteeing
at compile time that event names and payloads are correct.

This is an open-source learning project built incrementally, starting with a
simple JavaScript-style event bus and introducing stronger TypeScript features
one phase at a time.

> [!NOTE]
> The project currently includes the typed event map, restricted event names,
> event-specific payloads, typed internal listener storage, one-time listeners,
> unsubscribe functions, and async listeners (Phases 1–8).

## Features

- Subscribe a listener to an event
- Emit an event with a payload
- Register multiple listeners for the same event
- Register a listener that runs only once
- Unsubscribe using the function returned by `on()`
- Remove a listener
- Register synchronous or asynchronous listeners
- Await all listeners with `emitAsync()`
- Reject unknown event names at compile time
- Enforce the correct payload type for each event

## Getting started

### Prerequisites

- Node.js
- npm

Install the development dependencies:

```bash
npm install
```

Check the TypeScript code:

```bash
npm run typecheck
```

Build the project:

```bash
npm run build
```

Run the tests:

```bash
npm test
```

## Usage

```ts
import { EventBus } from "./EventBus.js";

type AppEvents = {
  "user.created": {
    userId: string;
    name: string;
  };
  "payment.completed": {
    amount: number;
  };
  "user.deleted": {
    userId: string;
  };
};

const bus = new EventBus<AppEvents>();

const handleUserCreated = (payload: AppEvents["user.created"]) => {
  console.log("User created:", payload.name);
};

const unsubscribe = bus.on("user.created", handleUserCreated);

bus.emit("user.created", {
  userId: "123",
  name: "Alice",
});

unsubscribe();

bus.once("payment.completed", (payload) => {
  console.log("Payment completed:", payload.amount);
});

bus.emit("payment.completed", { amount: 100 }); // Listener runs
bus.emit("payment.completed", { amount: 200 }); // Listener does not run

bus.on("user.created", async (payload) => {
  await saveToDatabase(payload);
});

// Starts all listeners without waiting for asynchronous work to finish.
bus.emit("user.created", {
  userId: "456",
  name: "Bob",
});

// Resolves after every listener has finished.
await bus.emitAsync("user.created", {
  userId: "789",
  name: "Carol",
});

// Compile-time errors:
// bus.emit("unknown.event", {});
// bus.emit("payment.completed", { amount: "100" });
```

You can also remove a listener manually with `off(event, callback)`. When using
`off`, pass the same function reference that was passed to `on`; two arrow
functions with identical code are still different function objects.

## API

### `on<K extends keyof TEvents>(event, callback)`

Subscribes a callback to an event. The callback payload is inferred from the
event name. Returns an idempotent unsubscribe function that removes that
specific listener. The callback may return either `void` or `Promise<void>`.

### `once<K extends keyof TEvents>(event, callback)`

Subscribes a callback that is invoked only for the first matching event. The
listener removes itself before the callback runs.

### `emit<K extends keyof TEvents>(event, payload)`

Invokes every callback subscribed to an event and passes the payload to each
one. It returns `void` and does not wait for promises returned by async
listeners. The payload must match the selected event's type. Emitting an event
with no listeners does nothing.

### `emitAsync<K extends keyof TEvents>(event, payload)`

Invokes every callback subscribed to an event and returns a `Promise<void>`
that resolves after all listeners have completed. Listeners are started
concurrently and awaited with `Promise.all()`.

### `off<K extends keyof TEvents>(event, callback)`

Removes the matching callback from an event. Unsubscribing from an unknown
event does nothing.

## Learning roadmap

- [x] **Phase 1 — Build the dumb JavaScript version first**
- [x] **Phase 2 — Introduce the event map**
- [x] **Phase 3 — Restrict event names with `keyof`**
- [x] **Phase 4 — Make payload types depend on event names**
- [x] **Phase 5 — Type the internal listener storage properly**
- [x] **Phase 6 — Implement `once()`**
- [x] **Phase 7 — Return an unsubscribe function**
- [x] **Phase 8 — Support async listeners**
- [ ] **Phase 9 — Add error handling**
- [ ] **Phase 10 — Add wildcard listeners**
- [ ] **Phase 11 — Add tests**
- [ ] **Phase 12 — Package it properly**

Runtime and compile-time tests are being added throughout development. Phase 11
will consolidate and complete the test suite for the finished API.

## Project structure

```text
src/
  EventBus.ts       Event bus implementation
  example.ts        Usage example
test/
  EventBus.test.ts  Behavior tests
```

## Contributing

Issues and pull requests are welcome. Because this is a learning project,
changes should remain focused, readable, and accompanied by relevant tests.

## License

Licensed under the [MIT License](LICENSE).
