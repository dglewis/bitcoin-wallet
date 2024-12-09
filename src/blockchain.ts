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

export interface UTXO {
    txid: string;
    vout: number;
    value: number;
    scriptpubkey: string;
    witnessUtxo: {
        script: Buffer;
        value: number;
    };
}

interface Transaction {
    txid: string;
    status: {
        confirmed: boolean;
        block_height?: number;
        block_time?: number;
    };
    vin: Array<{
        prevout: {
            scriptpubkey_address: string;
            value: number;
        };
    }>;
    vout: Array<{
        scriptpubkey_address: string;
        value: number;
    }>;
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

function isUTXO(data: unknown): data is UTXO {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof (data as any).txid === 'string' &&
        typeof (data as any).vout === 'number' &&
        typeof (data as any).value === 'number' &&
        typeof (data as any).scriptpubkey === 'string'
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

  async getUTXOs(address: string): Promise<UTXO[]> {
    try {
        const response = await fetch(`${this.apiUrl}/address/${address}/utxo`);
        const data = await response.json();

        if (!Array.isArray(data) || !data.every(isUTXO)) {
            throw new Error('Invalid UTXO response format');
        }

        return data.map(utxo => ({
            txid: utxo.txid,
            vout: utxo.vout,
            value: utxo.value,
            scriptpubkey: utxo.scriptpubkey,
            witnessUtxo: {
                script: Buffer.from(utxo.scriptpubkey, 'hex'),
                value: utxo.value
            }
        }));
    } catch (error) {
        throw new Error(`Failed to get UTXOs: ${(error as Error).message}`);
    }
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/tx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: txHex
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const txid = await response.text();
      return txid;
    } catch (error) {
      throw new Error(`Failed to broadcast transaction: ${(error as Error).message}`);
    }
  }

  async getTransactions(address: string): Promise<Array<{txid: string, amount: number, confirmations: number, timestamp: number}>> {
    try {
        const response = await fetch(`${this.apiUrl}/address/${address}/txs`);
        const data = await response.json();

        if (!Array.isArray(data) || !data.every(tx => 'txid' in tx && 'status' in tx)) {
            throw new Error('Invalid transaction response format');
        }

        return data.map(tx => ({
            txid: tx.txid,
            amount: this.calculateTransactionAmount(tx, address),
            confirmations: tx.status.confirmed ? tx.status.block_height : 0,
            timestamp: tx.status.block_time || Date.now() / 1000
        }));
    } catch (error) {
        throw new Error(`Failed to get transaction history: ${(error as Error).message}`);
    }
  }

  private calculateTransactionAmount(tx: any, address: string): number {
    let amount = 0;
    // Sum inputs from our address (negative)
    tx.vin.forEach((input: any) => {
      if (input.prevout.scriptpubkey_address === address) {
        amount -= input.prevout.value;
      }
    });
    // Sum outputs to our address (positive)
    tx.vout.forEach((output: any) => {
      if (output.scriptpubkey_address === address) {
        amount += output.value;
      }
    });
    return amount;
  }
}