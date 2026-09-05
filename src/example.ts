import { EventBus } from "./EventBus.js";

type AppEvents = {
    "user.created": {
        userId: string;
        name: string;
    };

    "payment.completed": {
        amount: number
    };

    "user.deleted": {
        userId: string;
    };
}

const bus = new EventBus<AppEvents>();

const firstListener = (data: unknown) => {
    console.log("First listener:", data);
};

const secondListener = (data: unknown) => {
    console.log("Second listener:", data);
};

bus.on("user.created", firstListener);
bus.on("user.created", secondListener);

bus.emit("user.created", { userId: '1', name: "Alice" });

bus.off("user.created", firstListener);

bus.emit("user.created", { userId: '2', name: "Bob" });

bus.once("payment.completed", (payload) => {
    console.log("One-time payment listener:", payload.amount);
});

bus.emit("payment.completed", { amount: 100 }); // Listener runs
bus.emit("payment.completed", { amount: 200 }); // Listener does not run again

const unsubscribe = bus.on("user.deleted", (payload) => {
    console.log("Deleted user:", payload.userId);
});

bus.emit("user.deleted", { userId: "1" }); // Listener runs
unsubscribe();
bus.emit("user.deleted", { userId: "2" }); // Listener does not run

// bus.emit("unknown.event", null);
