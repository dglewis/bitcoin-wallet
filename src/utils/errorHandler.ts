export class WalletError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly technical?: string
    ) {
        super(message);
        this.name = 'WalletError';
    }
}

export function handleError(error: unknown): string {
    if (error instanceof WalletError) {
        return error.message;
    }

    // Log technical details securely but return generic message
    console.error('Technical error:', error);
    return 'An unexpected error occurred. Please try again.';
}