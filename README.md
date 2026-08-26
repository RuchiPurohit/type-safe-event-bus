# Type-safe Event Bus

A lightweight, strongly typed event bus for TypeScript applications. It lets
different parts of an application communicate through events while guaranteeing
at compile time that event names and payloads are correct.

This is an open-source learning project built incrementally, starting with a
simple JavaScript-style event bus and introducing stronger TypeScript features
one phase at a time.

> [!NOTE]
> The project currently includes the typed event map, restricted event names,
> event-specific payloads, and typed internal listener storage (Phases 1–5).

## Features

- Subscribe a listener to an event
- Emit an event with a payload
- Register multiple listeners for the same event
- Remove a listener
- Safely emit or unsubscribe from unknown events
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
};

const bus = new EventBus<AppEvents>();

const handleUserCreated = (payload: AppEvents["user.created"]) => {
  console.log("User created:", payload.name);
};

bus.on("user.created", handleUserCreated);

bus.emit("user.created", {
  userId: "123",
  name: "Alice",
});

bus.off("user.created", handleUserCreated);

// Compile-time errors:
// bus.emit("unknown.event", {});
// bus.emit("payment.completed", { amount: "100" });
```

The same function reference must be passed to `on` and `off`. Two arrow
functions with identical code are still different function objects.

## API

### `on<K extends keyof TEvents>(event, callback)`

Subscribes a callback to an event. The callback payload is inferred from the
event name.

### `emit<K extends keyof TEvents>(event, payload)`

Invokes every callback subscribed to an event and passes the payload to each
one. The payload must match the selected event's type. Emitting an event with
no listeners does nothing.

### `off<K extends keyof TEvents>(event, callback)`

Removes the matching callback from an event. Unsubscribing from an unknown
event does nothing.

## Learning roadmap

- [x] **Phase 1 — Build the dumb JavaScript version first**
- [x] **Phase 2 — Introduce the event map**
- [x] **Phase 3 — Restrict event names with `keyof`**
- [x] **Phase 4 — Make payload types depend on event names**
- [x] **Phase 5 — Type the internal listener storage properly**
- [ ] **Phase 6 — Implement `once()`**
- [ ] **Phase 7 — Return an unsubscribe function**
- [ ] **Phase 8 — Support async listeners**
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
