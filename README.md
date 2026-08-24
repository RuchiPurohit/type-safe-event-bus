# Type-safe Event Bus

An event bus built from scratch in TypeScript.

This is an open-source learning project focused on understanding TypeScript in
depth. The project starts with a deliberately simple, loosely typed event bus.
Type safety will be introduced gradually as the API evolves.

> [!NOTE]
> The current Phase 1 implementation is not type-safe yet. Event names are
> strings and callbacks use the broad `Function` type intentionally.

## Features

- Subscribe a listener to an event
- Emit an event with a payload
- Register multiple listeners for the same event
- Remove a listener
- Safely emit or unsubscribe from unknown events

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

const bus = new EventBus();

const handleUserCreated = (data: unknown) => {
  console.log("User created:", data);
};

bus.on("user.created", handleUserCreated);

bus.emit("user.created", {
  userId: "123",
});

bus.off("user.created", handleUserCreated);
```

The same function reference must be passed to `on` and `off`. Two arrow
functions with identical code are still different function objects.

## API

### `on(event, callback)`

Subscribes a callback to an event.

### `emit(event, payload)`

Invokes every callback subscribed to an event and passes the payload to each
one. Emitting an event with no listeners does nothing.

### `off(event, callback)`

Removes the matching callback from an event. Unsubscribing from an unknown
event does nothing.

## Learning roadmap

- **Phase 1 — Runtime behavior:** Build the basic event bus with strings,
  `Function`, `Map`, and arrays.
- **Later phases — Type safety:** Introduce precise callback types, event maps,
  generics, `keyof`, indexed access types, and inference.

Phase 1 is complete when all expected runtime behaviors are covered by tests.

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
