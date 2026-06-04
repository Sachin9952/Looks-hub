class AsyncLock {
  constructor() {
    this.queues = new Map();
  }

  async acquire(key) {
    if (!this.queues.has(key)) {
      this.queues.set(key, Promise.resolve());
    }

    const currentPromise = this.queues.get(key);
    let release;
    const nextPromise = new Promise((resolve) => {
      release = resolve;
    });

    this.queues.set(key, currentPromise.then(() => nextPromise));

    await currentPromise;

    return () => {
      release();
      if (this.queues.get(key) === nextPromise) {
        this.queues.delete(key);
      }
    };
  }
}

const lockInstance = new AsyncLock();
export default lockInstance;
