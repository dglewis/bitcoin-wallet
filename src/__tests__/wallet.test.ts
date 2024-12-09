import { BitcoinWallet } from '../wallet';
import * as bip39 from 'bip39';
import { BlockchainService } from '../blockchain';
import { config } from '../config';
import * as bitcoin from 'bitcoinjs-lib';

// Mock BlockchainService
jest.mock('../blockchain');

describe('BitcoinWallet', () => {
    let wallet: BitcoinWallet;

    beforeEach(() => {
        jest.clearAllMocks();
        wallet = new BitcoinWallet();
    });

    test('should generate valid mnemonic', () => {
        const mnemonic = wallet.getMnemonic();
        expect(bip39.validateMnemonic(mnemonic)).toBe(true);
        expect(mnemonic.split(' ').length).toBe(24); // 256-bit entropy gives 24 words
    });

    test('should accept valid mnemonic', () => {
        const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        const testWallet = new BitcoinWallet(testMnemonic);
        expect(testWallet.getMnemonic()).toBe(testMnemonic);
    });

    test('should reject invalid mnemonic', () => {
        const invalidMnemonic = 'invalid mnemonic phrase test';
        expect(() => new BitcoinWallet(invalidMnemonic)).toThrow('Invalid mnemonic phrase');
    });

    test('should generate valid SegWit address', async () => {
        const address = await wallet.getSegWitAddress(0);
        expect(address).toMatch(/^bc1q[a-zA-Z0-9]{14,74}$/); // Updated regex for valid SegWit address length
    });

    test('should generate valid Legacy address', async () => {
        const address = await wallet.getLegacyAddress(0);
        expect(address).toMatch(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/); // Basic Legacy address format check
    });

    test('should get wallet balance', async () => {
        const mockBalance = { confirmed: 100000, unconfirmed: 50000 };
        (BlockchainService.prototype.getBalance as jest.Mock).mockResolvedValue(mockBalance);

        const balance = await wallet.getBalance();
        expect(balance).toEqual(mockBalance);
    });

    test('should send bitcoin with valid parameters', async () => {
        // Use a known test mnemonic
        const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        wallet = new BitcoinWallet(testMnemonic);

        const mockTxId = '1234567890abcdef';
        const validAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
        const amount = 50000;
        const feeRate = 5;

        // Get the wallet's actual address for UTXO script
        const walletAddress = await wallet.getSegWitAddress(0);
        const { output } = bitcoin.payments.p2wpkh({
            address: walletAddress
        });

        // Mock balance check
        (BlockchainService.prototype.getBalance as jest.Mock)
            .mockResolvedValue({ confirmed: 100000, unconfirmed: 0 });

        // Mock UTXO with correct script matching our wallet
        (BlockchainService.prototype.getUTXOs as jest.Mock)
            .mockResolvedValue([{
                txid: '7ea75da574ebdc0e022ac91b0691a36a141790c8278c4275c5923e86b32937b4',
                vout: 0,
                witnessUtxo: {
                    script: output,
                    value: 100000
                }
            }]);

        // Mock transaction broadcast
        (BlockchainService.prototype.broadcastTransaction as jest.Mock)
            .mockResolvedValue(mockTxId);

        const txId = await wallet.sendBitcoin(validAddress, amount, feeRate);
        expect(txId).toBe(mockTxId);
    });

    test('should reject invalid bitcoin address', async () => {
        await expect(wallet.sendBitcoin('invalid_address', 50000, 5))
            .rejects.toThrow('Invalid Bitcoin address');
    });

    test('should reject amount below dust limit', async () => {
        const validAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
        await expect(wallet.sendBitcoin(validAddress, 100, 5))
            .rejects.toThrow(/dust limit/);
    });

    test('should reject invalid fee rate', async () => {
        const validAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
        await expect(wallet.sendBitcoin(validAddress, 50000, 0))
            .rejects.toThrow(`Fee rate must be between ${config.minFeeRate} and ${config.maxFeeRate} sat/vB`);
    });

    test('should get transaction history', async () => {
        const mockHistory = [{
            txid: 'abc123',
            amount: 50000,
            confirmations: 6,
            timestamp: Date.now()
        }];

        (BlockchainService.prototype.getTransactions as jest.Mock)
            .mockResolvedValue(mockHistory);

        const history = await wallet.getTransactionHistory();
        expect(history).toEqual(mockHistory);
    });
});