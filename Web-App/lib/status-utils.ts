/**
 * 🛡️ [DATA AUTHORITY] BBSNS Status Normalization Engine
 * Protocol: Normalize UP (Frontend -> Backend Truth)
 * Authoritative Logic Gate: "KYC_VERIFIED"
 */

export function normalizeStatus(status?: string): string {
    if (!status) return "PENDING";
    
    // Normalize to Upper Case & Trim for defensive comparison
    const s = status.trim().toUpperCase();

    // 🛡️ [NORMALIZATION] map legacy/variant states to authoritative backend truth
    if (s === "VERIFIED") return "KYC_VERIFIED";
    if (s === "KYC_VERIFIED") return "KYC_VERIFIED";
    
    return s;
}

/**
 * Maps authoritative logic tokens to user-friendly UI labels
 */
export function getDisplayStatus(status?: string): string {
    const s = normalizeStatus(status);
    
    switch (s) {
        case "KYC_VERIFIED":
            return "Verified";
        case "PENDING":
            return "Pending";
        case "APPROVED":
            return "Approved";
        case "ACTIVATED":
            return "Activated";
        case "REJECTED":
            return "Rejected";
        default:
            return s.charAt(0) + s.slice(1).toLowerCase();
    }
}

/**
 * Centralized Logic Gate for Verification Status
 */
export function isKycVerified(status?: string): boolean {
    return normalizeStatus(status) === "KYC_VERIFIED";
}

/**
 * Maps authoritative tokens to UI Badge variants (shadcn/ui compatible)
 */
export function getStatusBadgeVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
    const s = normalizeStatus(status);
    
    switch (s) {
        case "KYC_VERIFIED":
        case "ACTIVATED":
            return "default"; // Emerald/Success logic handled via className usually
        case "PENDING":
        case "APPROVED":
            return "outline";
        case "REJECTED":
            return "destructive";
        default:
            return "secondary";
    }
}
