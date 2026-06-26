const dbContext = require('../db/context');

/**
 * 🛡️ withRestoredContext (ARCHITECTURE_FIX_2.1)
 * 
 * Specifically designed to combat AsyncLocalStorage context loss 
 * in event-driven middleware like Multer.
 * 
 * Pattern: Capture -> Execute -> Re-enter logic
 */
function withRestoredContext(middleware) {
    if (typeof middleware !== 'function') {
        throw new Error('[CONTEXT_ERROR] target is not a middleware function');
    }

    return (req, res, next) => {
        const store = dbContext.getStore();
        
        // Execute target middleware (e.g., multer)
        middleware(req, res, (err) => {
            if (store) {
                // RE-ENTER the captured context before calling next()
                // This ensures all subsequent handlers see the original store.
                dbContext.run(store, () => next(err));
            } else {
                next(err);
            }
        });
    };
}

module.exports = { withRestoredContext };
