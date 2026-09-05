import assert from "node:assert/strict";
import test from "node:test";
import { EventBus } from "../src/EventBus.js";

type TestEvents = {
    "user.created": { userId: string; name: string };
    "user.deleted": { userId: string };
    "payment.completed": { amount: number };
};

test("subscribes a callback to an event", () => {
    const bus = new EventBus<TestEvents>();
    let called = false;

    bus.on("user.created", () => {
        called = true;
    });

    bus.emit("user.created", { userId: '1', name: "Alice" });
    assert.equal(called, true);
});

//passes the exact payload to the callback
test("passes the exact payload to the callback", () => {
    const bus = new EventBus<TestEvents>();
    const payload = { userId: '1', name: "Alice" };

    let receivedPayload: unknown;

    bus.on("user.created", (data: unknown) => {
        receivedPayload = data;
    });

    bus.emit("user.created", payload);

    assert.strictEqual(receivedPayload, payload);
});

//"invokes multiple listeners for the same event"
test("invokes multiple listeners for the same event", () => {
    const bus = new EventBus<TestEvents>();
    const calls: string[] = [];

    bus.on("user.created", () => {
        calls.push("first");
    });

    bus.on("user.created", () => {
        calls.push("second");
    });

    bus.emit("user.created", { userId: "123", name: "Alice" });

    assert.deepEqual(calls, ["first", "second"]);
});

//"removes a subscribed callback"
test("removes a subscribed callback", () => {
    const bus = new EventBus<TestEvents>();
    let callCount = 0;

    const listener = () => {
        callCount += 1;
    };

    bus.on("user.created", listener);
    bus.off("user.created", listener);
    bus.emit("user.created", { userId: "123", name: "Alice" });

    assert.equal(callCount, 0);
});

//"removing one callback leaves other callbacks subscribed"
test("removing one callback leaves other callbacks subscribed", () => {
    const bus = new EventBus<TestEvents>();
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
    bus.emit("user.created", { userId: "123", name: "Alice" });

    assert.deepEqual(calls, ["second"]);
});

//"emitting an unknown event does not throw"
test("emitting an unknown event does not throw", () => {
    const bus = new EventBus<TestEvents>();

    assert.doesNotThrow(() => {
        // @ts-expect-error - event is not defined in TestEvents
        bus.emit("unknown.event", { value: "test" });
    });
});
//"removing a callback from an unknown event does not throw"
test("removing a callback from an unknown event does not throw", () => {
    const bus = new EventBus<TestEvents>();
    const listener = () => { };

    assert.doesNotThrow(() => {
        // @ts-expect-error - event is not defined in TestEvents
        bus.off("unknown.event", listener);
    });
});
//"does not invoke listeners belonging to another event"
test("does not invoke listeners belonging to another event", () => {
    const bus = new EventBus<TestEvents>();
    let wasCalled = false;

    bus.on("user.deleted", () => {
        wasCalled = true;
    });

    bus.emit("user.created", { userId: "123", name: "Alice" });

    assert.equal(wasCalled, false);
});

test("only accepts event names defined in the event map", () => {
    const bus = new EventBus<TestEvents>();

    bus.on("user.created", () => { });

    // This directive makes the test fail during type-checking if the next line
    // ever stops producing a TypeScript error.
    // @ts-expect-error - "something.random" is not a key of TestEvents
    bus.on("something.random", () => { });
});

test("passes the correctly typed payload to a listener", () => {
    const bus = new EventBus<TestEvents>();

    let receivedName: string | undefined;

    bus.on("user.created", (payload) => {
        receivedName = payload.name;
    });
    bus.emit("user.created", { userId: '1', name: "Alice" });
    assert.equal(receivedName, "Alice");
});

test("supports different payload types for different events", () => {
    const bus = new EventBus<TestEvents>();
    let receivedAmount: number | undefined;
    let receivedUserId: string | undefined;

    bus.on("payment.completed", (payload) => {
        receivedAmount = payload.amount;
    });

    bus.on("user.deleted", (payload) => {
        receivedUserId = payload.userId;
    });

    bus.emit("payment.completed", { amount: 100 });
    bus.emit("user.deleted", { userId: '123' });

    assert.equal(receivedAmount, 100);
    assert.equal(receivedUserId, '123');
});

test("does not invoke a listener registered for another event", () => {
    const bus = new EventBus<TestEvents>();
    let wasCalled = false;

    bus.on("user.deleted", () => {
        wasCalled = true;
    });

    bus.emit("user.created", { userId: '1', name: "Alice" });

    assert.equal(wasCalled, false);
})

test("removes a typed listener", () => {
    const bus = new EventBus<TestEvents>();
    let callCount = 0;

    const listener = (payload: TestEvents["user.created"]) => {
        callCount += 1;
    };

    bus.on("user.created", listener);
    bus.off("user.created", listener);

    bus.emit("user.created", {
        userId: "123",
        name: "alice",
    });

    assert.equal(callCount, 0);
});

test("rejects unknown event names at compile time", () => {
    const bus = new EventBus<TestEvents>();

    // @ts-expect-error - event is not defined in TestEvents
    bus.on("something.random", () => { });
});
test("rejects an incorrect emit payload at compile time", () => {
    const bus = new EventBus<TestEvents>();

    bus.emit("user.created", {
        // @ts-expect-error - user.created requires userId and name

        amount: 100,
    });
});
test("rejects a listener with the wrong payload type", () => {
    const bus = new EventBus<TestEvents>();

    const paymentListener = (
        payload: TestEvents["payment.completed"]
    ) => { };

    // @ts-expect-error - payment listener cannot handle user.created payloads
    bus.on("user.created", paymentListener);
});

test("invokes a once listener only once", () => {
    const bus = new EventBus<TestEvents>();
    let callCount = 0;

    bus.once("user.created", () => {
        callCount += 1;
    });

    bus.emit("user.created", {
        userId: "1",
        name: "Alice",
    });

    bus.emit("user.created", {
        userId: "2",
        name: "Bob",
    });

    assert.equal(callCount, 1);
});

test("passes the correctly typed payload to a once listener", () => {
    const bus = new EventBus<TestEvents>();
    let receivedName: string | undefined;

    bus.once("user.created", (payload) => {
        receivedName = payload.name;
    });

    bus.emit("user.created", {
        userId: "1",
        name: "Alice",
    });

    assert.equal(receivedName, "Alice");
});


test('returns a function that unsubscribe the callback', () => {
    type AppEvents = {
        "user.created": {
            "userId": string;
            "name": string;
        };
    };
    const bus = new EventBus<AppEvents>();
    let callCount = 0;

    const unsubscribe = bus.on("user.created", () => { callCount += 1; });

    bus.emit("user.created", { userId: "123", name: 'ru' });
    unsubscribe();
    bus.emit("user.created", { userId: "123", name: 'ru' });
    assert.equal(callCount, 1);
    assert.equal(typeof unsubscribe, "function");
});

test("unsubscribe removes only its associated callback", () => {

    type AppEvents = {
        "user.created": {
            "userId": string;
            "name": string;
        };
    };
    const bus = new EventBus<AppEvents>();
    const calls: string[] = [];

    const unsubscribeFirst = bus.on("user.created", () => {
        calls.push("first");
    });

    bus.on("user.created", () => {
        calls.push("second");
    });

    unsubscribeFirst();
    bus.emit("user.created", { userId: "123", name: 'ru' });

    assert.deepEqual(calls, ["second"]);
});

test("unsubscribe can be called more than once", () => {
    type AppEvents = {
        "user.created": {
            "userId": string;
            "name": string;
        };
    };
    const bus = new EventBus<AppEvents>();
    let called = false;

    const unsubscribe = bus.on("user.created", () => {
        called = true;
    });

    unsubscribe();
    unsubscribe();

    bus.emit("user.created", { userId: "123", name: 'ru' });

    assert.equal(called, false);
});