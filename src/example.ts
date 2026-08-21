import { EventBus } from "./EventBus.js";

const bus = new EventBus();

const firstListener = (data: unknown) => {
    console.log("First listener:", data);
};

const secondListener = (data: unknown) => {
    console.log("Second listener:", data);
};

bus.on("user.created", firstListener);
bus.on("user.created", secondListener);

bus.emit("user.created", { id: 1, name: "Alice" });

bus.off("user.created", firstListener);

bus.emit("user.created", { id: 2, name: "Bob" });

bus.emit("unknown.event", null);