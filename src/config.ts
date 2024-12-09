export const config = {
    apiEndpoint: process.env.BITCOIN_API_ENDPOINT || 'https://blockstream.info/api',
    network: process.env.BITCOIN_NETWORK || 'mainnet',
    maxFeeRate: 100, // sat/vB
    minFeeRate: 1,   // sat/vB
    dustLimit: 546   // satoshis
}; 