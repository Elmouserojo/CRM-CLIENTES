class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = {};
    }

    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);

        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }

    dispatch(event, payload) {
        if (event === 'CLIENTS_UPDATED') {
            this.state.clients = payload;
        } else if (event === 'JOBS_UPDATED') {
            this.state.jobs = payload;
        }

        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(payload));
        }
    }

    getState() {
        return this.state;
    }
}

export const store = new Store({
    clients: [],
    jobs: []
});
