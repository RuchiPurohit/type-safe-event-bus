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

//"invokes multiple listeners for the same event"
test("invokes multiple listeners for the same event", () => {
    const bus = new EventBus();
    const calls: string[] = [];

    bus.on("user.created", () => {
        calls.push("first");
    });

    bus.on("user.created", () => {
        calls.push("second");
    });

    bus.emit("user.created", { userId: "123" });

    assert.deepEqual(calls, ["first", "second"]);
});

//"removes a subscribed callback"
test("removes a subscribed callback", () => {
    const bus = new EventBus();
    let callCount = 0;

    const listener = () => {
        callCount += 1;
    };

    bus.on("user.created", listener);
    bus.off("user.created", listener);
    bus.emit("user.created", { userId: "123" });

    assert.equal(callCount, 0);
});

//"removing one callback leaves other callbacks subscribed"
test("removing one callback leaves other callbacks subscribed", () => {
    const bus = new EventBus();
    const calls: string[] = [];

    const firstListener = () => {
        calls.push("first");
    };

    const secondListener = () => {
        calls.push("second");
    };

    bus.on("user.created", firstListener);
    bus.on("user.created", secondListener);

    bus.off("user.created", firstListener);
    bus.emit("user.created", { userId: "123" });

    assert.deepEqual(calls, ["second"]);
});

//"emitting an unknown event does not throw"
test("emitting an unknown event does not throw", () => {
    const bus = new EventBus();

    assert.doesNotThrow(() => {
        bus.emit("unknown.event", { value: "test" });
    });
});
//"removing a callback from an unknown event does not throw"
test("removing a callback from an unknown event does not throw", () => {
    const bus = new EventBus();
    const listener = () => { };

    assert.doesNotThrow(() => {
        bus.off("unknown.event", listener);
    });
});
//"does not invoke listeners belonging to another event"
test("does not invoke listeners belonging to another event", () => {
    const bus = new EventBus();
    let wasCalled = false;

    bus.on("user.deleted", () => {
        wasCalled = true;
    });

    bus.emit("user.created", { userId: "123" });

    assert.equal(wasCalled, false);
});