const { ACTION_POLICIES } = require('../constants/actions');
const { BBSNS_DOMAINS } = require('../constants/protocol');
const dbContext = require('../db/context');
const { BBSNSEnforcementError } = require('../db/index');

/**
 * 🛡️ [PHASE 4] withDomain Middleware
 * Explicitly declares the logical domain context for the route.
 */
function withDomain(domainName) {
    if (!BBSNS_DOMAINS[domainName]) {
        throw new Error(`[STRUCTURAL_ERROR] Invalid domain declaration: ${domainName}`);
    }

    const middleware = (req, res, next) => {
        const store = dbContext.getStore();
        if (!store) {
            console.error(`❌ CONTEXT FAILURE in withDomain('${domainName}')`);
            throw new BBSNSEnforcementError("STRUCTURAL_ERROR: Domain used before context initialization");
        }
        
        // Declare domain and request context in store object
        store.domain = domainName;
        store.route = req.originalUrl || req.path;
        
        next();
    };

    // Reflective Metadata for Startup Audit
    middleware.__domain = domainName;
    return middleware;
}

/**
 * 🛡️ [PHASE 4] withAction Middleware
 * Attaches metadata and validates domain-action prefix binding.
 */
function withAction(actionName) {
    // 1. Validate action existence in Registry of Law
    if (!ACTION_POLICIES[actionName]) {
        console.error(`[AUTH_ERROR] Unknown action name: ${actionName}`);
        throw new Error(`INVALID_ACTION_POLICY: ${actionName}`);
    }

    const middleware = (req, res, next) => {
        const store = dbContext.getStore();
        if (!store || !store.domain) {
            console.error(`❌ CONTEXT FAILURE in withAction('${actionName}')`);
            throw new BBSNSEnforcementError("STRUCTURAL_ERROR: Action used before domain/context");
        }

        const expectedPrefix = BBSNS_DOMAINS[store.domain];
        if (!actionName.startsWith(expectedPrefix)) {
            console.error(`❌ [ACTION_DOMAIN_VIOLATION] Action ${actionName} does not belong to domain ${store.domain}`);
            throw new BBSNSEnforcementError(`ACTION_DOMAIN_VIOLATION: ${actionName} vs ${store.domain}`);
        }

        // Standardized Property Update
        store.action = actionName;
        
        next();
    };

    // Reflective Metadata for Startup Audit
    middleware.__action = actionName;
    return middleware;
}

/**
 * 🛡️ [PHASE 4] withMutation Middleware
 * Explicitly declares state-changing intent.
 */
function withMutation() {
    const middleware = (req, res, next) => {
        const store = dbContext.getStore();
        if (store) {
            store.isMutationIntent = true;
        }
        next();
    };

    // Reflective Metadata for Startup Audit
    middleware.__isMutation = true;
    return middleware;
}

module.exports = { 
    withDomain, 
    withAction, 
    withMutation 
};
