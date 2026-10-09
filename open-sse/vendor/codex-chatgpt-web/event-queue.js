/* Adapted from miuuyy/codex-chatgpt-web commit 09877fa21ffdbf20979623ef501046fc02a750d7 (MIT). */
export class AsyncEventQueue {
    maxBuffered;
    buffered = [];
    waiters = [];
    closed = false;
    constructor(maxBuffered = 10_000) {
        this.maxBuffered = maxBuffered;
    }
    push(value) {
        if (this.closed)
            return;
        const waiter = this.waiters.shift();
        if (waiter) {
            waiter({ value, done: false });
            return;
        }
        if (this.buffered.length >= this.maxBuffered)
            throw new Error("Adapter event backlog exceeded");
        this.buffered.push(value);
    }
    close() {
        if (this.closed)
            return;
        this.closed = true;
        while (this.waiters.length > 0)
            this.waiters.shift()({ value: undefined, done: true });
    }
    async collect() {
        const values = [];
        for await (const value of this)
            values.push(value);
        return values;
    }
    [Symbol.asyncIterator]() {
        return {
            next: () => {
                const value = this.buffered.shift();
                if (value !== undefined)
                    return Promise.resolve({ value, done: false });
                if (this.closed)
                    return Promise.resolve({ value: undefined, done: true });
                return new Promise((resolve) => this.waiters.push(resolve));
            },
            return: () => {
                this.close();
                return Promise.resolve({ value: undefined, done: true });
            },
        };
    }
}
