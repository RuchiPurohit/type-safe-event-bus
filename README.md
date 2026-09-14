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
> unsubscribe functions, async listeners, and configurable listener error
> handling (Phases 1–9).

## Features

- Subscribe a listener to an event
- Emit an event with a payload
- Register multiple listeners for the same event
- Register a listener that runs only once
- Unsubscribe using the function returned by `on()`
- Remove a listener
- Register synchronous or asynchronous listeners
- Await all listeners with `emitAsync()`
- Report listener failures through an optional `onError` callback
- Continue invoking listeners when another listener fails
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
import { EventBus } from "@ruchipurohit/type-safe-event-bus";

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

const bus = new EventBus<AppEvents>({
  onError(error, event) {
    console.error("Listener failed for event:", event);

    if (error instanceof Error) {
      console.error(error.message);
    }
  },
});

async function saveToDatabase(
  payload: AppEvents["user.created"]
): Promise<void> {
  console.log("Saving user:", payload);
}

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

bus.on("user.created", () => {
  throw new Error("Unable to notify analytics");
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

Errors have the type `unknown` because JavaScript allows any value to be
thrown. Narrow the value, for example with `error instanceof Error`, before
accessing properties such as `error.message`.

## API

### `new EventBus<TEvents>(options?)`

Creates an event bus. The optional configuration object accepts an `onError`
callback:

```ts
interface EventBusOptions<TEvents> {
  onError?: (error: unknown, event: keyof TEvents) => void;
}
```

When a listener throws or returns a rejected promise, the bus passes the error
and the typed event name to `onError` when that callback is configured. Without
an error callback, listener failures are ignored. If no options are needed, the
constructor can still be called without an argument.

The `onError` callback should not throw. An error thrown by the error handler
itself can escape the event bus and interrupt listener processing.

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
with no listeners does nothing. Listener failures are reported through
`onError`, when configured, without preventing the remaining listeners from
being invoked.

### `emitAsync<K extends keyof TEvents>(event, payload)`

Invokes every callback subscribed to an event and returns a `Promise<void>`
that resolves after all listeners have completed. Listeners are started
concurrently and awaited with `Promise.all()`. Each listener invocation is
wrapped independently so one failure does not prevent the other listeners from
completing. Failures are passed to `onError` when it is configured.

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
- [x] **Phase 9 — Add error handling**
- [ ] **Phase 10 — Add wildcard listeners**
- [ ] **Phase 11 — Add tests**
- [ ] **Phase 12 — Package it properly**

Runtime and compile-time tests are being added throughout development. Phase 11
will consolidate and complete the test suite for the finished API.

## Project structure

```text
src/
  EventBus.ts          Event bus implementation
  EventBusOptions.ts   Error-handling configuration type
  example.ts           Usage example
test/
  EventBus.test.ts     Behavior tests
```

## Contributing

Issues and pull requests are welcome. Because this is a learning project,
changes should remain focused, readable, and accompanied by relevant tests.

## Publishing

The package is configured to be published publicly as
`@ruchipurohit/type-safe-event-bus`. Before the first publish, sign in to npm
and confirm that your npm account owns the `ruchipurohit` scope:

```bash
npm login
npm whoami
```

Build, test, and inspect the exact package contents before publishing:

```bash
npm ci
npm run typecheck
npm test
npm pack --dry-run
```

For the initial release, publish from the repository root:

```bash
npm publish --access public
```

Later releases are published automatically by
`.github/workflows/release.yml`. To prepare one:

1. Run `npm version patch`, `npm version minor`, or `npm version major`.
2. Push the commit and tag with `git push origin main --follow-tags`.
3. Create and publish a GitHub release for that tag.

The release tag must match the version in `package.json` (for example, tag
`v1.1.0` for package version `1.1.0`). After the initial publish, open the
package settings on npmjs.com and add a GitHub Actions trusted publisher with
these values:

- Organization or user: `RuchiPurohit`
- Repository: `type-safe-event-bus`
- Workflow filename: `release.yml`
- Allowed action: `npm publish`

The workflow uses short-lived OIDC credentials, so it does not require an npm
token in GitHub. It runs the type checks and tests, verifies the version, and
publishes a public package with npm provenance.

## License

Licensed under the [MIT License](LICENSE).
