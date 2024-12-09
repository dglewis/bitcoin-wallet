import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { BlockchainService } from './blockchain';

const bip32 = BIP32Factory(ecc);

export class BitcoinWallet {
    private mnemonic: string;
    private seed: Buffer;
    private network: bitcoin.networks.Network;
    private blockchain: BlockchainService;

    constructor(mnemonic?: string) {
        this.network = bitcoin.networks.bitcoin; // Use mainnet by default
        if (mnemonic) {
            if (!bip39.validateMnemonic(mnemonic)) {
                throw new Error('Invalid mnemonic phrase');
            }
            this.mnemonic = mnemonic;
        } else {
            this.mnemonic = bip39.generateMnemonic(256); // 24 words
        }
        this.seed = bip39.mnemonicToSeedSync(this.mnemonic);
        this.blockchain = new BlockchainService('https://blockstream.info/api');
    }

    /**
     * Get the wallet's mnemonic phrase
     */
    public getMnemonic(): string {
        return this.mnemonic;
    }

    /**
     * Derive a SegWit (P2WPKH) address at the specified index
     * @param index Account index
     * @returns The derived address
     */
    public async getSegWitAddress(index: number = 0): Promise<string> {
        // BIP84 derivation path for SegWit: m/84'/0'/0'/0/index
        const path = `m/84'/0'/0'/0/${index}`;
        const keyPair = this.derivePath(path);

        const { address } = bitcoin.payments.p2wpkh({
            pubkey: keyPair.publicKey,
            network: this.network,
        });

        if (!address) throw new Error('Failed to generate address');
        return address;
    }

    /**
     * Derive a Legacy (P2PKH) address at the specified index
     * @param index Account index
     * @returns The derived address
     */
    public async getLegacyAddress(index: number = 0): Promise<string> {
        // BIP44 derivation path for Legacy: m/44'/0'/0'/0/index
        const path = `m/44'/0'/0'/0/${index}`;
        const keyPair = this.derivePath(path);

        const { address } = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network: this.network,
        });

        if (!address) throw new Error('Failed to generate address');
        return address;
    }

    /**
     * Helper method to derive a key pair from a path
     */
    private derivePath(path: string) {
        const root = bip32.fromSeed(this.seed);
        return root.derivePath(path);
    }

    async getBalance(): Promise<{ confirmed: number; unconfirmed: number }> {
        const address = await this.getSegWitAddress(0);
        return await this.blockchain.getBalance(address);
    }

    async sendBitcoin(toAddress: string, amount: number, feeRate: number): Promise<string> {
        const utxos = await this.blockchain.getUTXOs(await this.getSegWitAddress(0));
        const psbt = new bitcoin.Psbt({ network: this.network });

        // Add inputs from UTXOs
        for (const utxo of utxos) {
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                witnessUtxo: utxo.witnessUtxo
            });
        }

        // Add output for recipient
        psbt.addOutput({
            address: toAddress,
            value: amount
        });

        // Sign transaction
        const keyPair = this.derivePath("m/84'/0'/0'/0/0");
        psbt.signAllInputs(keyPair);

        // Broadcast transaction
        const tx = psbt.finalizeAllInputs().extractTransaction();
        return await this.blockchain.broadcastTransaction(tx.toHex());
    }

    async getTransactionHistory(): Promise<Array<{
        txid: string,
        amount: number,
        confirmations: number,
        timestamp: number
    }>> {
        const address = await this.getSegWitAddress(0);
        return await this.blockchain.getTransactions(address);
    }
}