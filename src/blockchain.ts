// First, define an interface for the API response
export interface BlockchainAPIResponse {
  chain_stats: {
    funded_txo_sum: number;
    spent_txo_sum: number;
  };
  mempool_stats: {
    funded_txo_sum: number;
    spent_txo_sum: number;
  };
}

// Add this validation function
function isBlockchainAPIResponse(data: unknown): data is BlockchainAPIResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'chain_stats' in data &&
    'mempool_stats' in data &&
    typeof (data as any).chain_stats.funded_txo_sum === 'number' &&
    typeof (data as any).chain_stats.spent_txo_sum === 'number' &&
    typeof (data as any).mempool_stats.funded_txo_sum === 'number' &&
    typeof (data as any).mempool_stats.spent_txo_sum === 'number'
  );
}

// Create and export the BlockchainService class
export class BlockchainService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getBalance(address: string) {
    try {
      const response = await fetch(`${this.apiUrl}/address/${address}`);
      const data = await response.json();
      if (!isBlockchainAPIResponse(data)) {
        throw new Error('Invalid API response format');
      }

      return {
        confirmed: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
        unconfirmed: data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum
      };
    } catch (error) {
      // Handle the error properly with type assertion
      throw new Error(`Failed to get balance: ${(error as Error).message}`);
    }
  }
} 