import { BitcoinWallet } from '../src/wallet';

async function demonstrateWallet() {
    console.log('🔐 Bitcoin Wallet Demo\n');

    // Create a new wallet
    console.log('Creating new wallet...');
    const wallet = new BitcoinWallet();

    // Display the mnemonic
    console.log('\n📝 Mnemonic (KEEP THIS SAFE!):\n');
    console.log(wallet.getMnemonic());

    // Generate multiple addresses
    console.log('\n🏦 Generating addresses...\n');

    // Generate 3 SegWit addresses
    console.log('Native SegWit Addresses (cheaper fees):');
    for (let i = 0; i < 3; i++) {
        const address = await wallet.getSegWitAddress(i);
        console.log(`Address ${i}: ${address}`);
    }

    // Generate 3 Legacy addresses
    console.log('\nLegacy Addresses (maximum compatibility):');
    for (let i = 0; i < 3; i++) {
        const address = await wallet.getLegacyAddress(i);
        console.log(`Address ${i}: ${address}`);
    }

    console.log('\n✨ Demo complete! Your wallet is ready to use.');
    console.log('⚠️  Remember to backup your mnemonic phrase in a secure location!');
}

// Run the demo
demonstrateWallet().catch(console.error);