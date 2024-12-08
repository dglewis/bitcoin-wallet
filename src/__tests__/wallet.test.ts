import { BitcoinWallet } from '../wallet';
import * as bip39 from 'bip39';

describe('BitcoinWallet', () => {
    let wallet: BitcoinWallet;

    beforeEach(() => {
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
});