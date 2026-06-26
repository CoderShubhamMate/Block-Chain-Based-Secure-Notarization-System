/**
 * 🛡️ [PROTOCOL] Authoritative System Constants
 * Responsibility: Single source of truth for Roles, Risk Levels, and Audit Identities.
 * Purpose: Eliminate circular dependencies between db/index.js and middleware/actor.js.
 */

const ROLES = {
    GUEST: 0,
    ANY: 0,
    NONE: 0,
    OWNER: 1,
    NOTARY: 2,
    ADMIN: 3
};

const RISK_LEVELS = {
    LOW: 'RISK_LOW',
    HIGH: 'RISK_HIGH'
};

const ACTOR_IDS = {
    GUEST: '00000000-0000-0000-0000-000000000000',
    SYSTEM: '00000000-0000-0000-0000-FFFFFFFFFFFF'
};

const BBSNS_DOMAINS = {
    AUTH: 'AUTH_',
    DOCS: 'DOC_',
    NOTARY: 'NOTARY_',
    ADMIN: 'ADMIN_',
    USERS: 'USERS_',
    GOVERNANCE: 'GOV_',
    TRANSACTIONS: 'TX_'
};

module.exports = {
    ROLES,
    RISK_LEVELS,
    ACTOR_IDS,
    BBSNS_DOMAINS
};
