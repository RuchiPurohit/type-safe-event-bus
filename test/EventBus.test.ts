import assert from "node:assert/strict";
import test from "node:test";
import { EventBus } from "../src/EventBus.js";

test("subscribes a callback to an event", () => {
    const bus = new EventBus();
    let called = false;

    bus.on("user.created", () => {
        called = true;
    });

    bus.emit("user.created", { id: 1, name: "Alice" });
    assert.equal(called, true);
});

//passes the exact payload to the callback
test("passes the exact payload to the callback", () => {
    const bus = new EventBus();
    const payload = { id: 1, name: "Alice" };

    let receivedPayload: unknown;

    bus.on("user.created", (data: unknown) => {
        receivedPayload = data;
    });

    bus.emit("user.created", payload);

    assert.strictEqual(receivedPayload, payload);
});