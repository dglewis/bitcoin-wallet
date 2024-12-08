import { BitcoinWallet } from './wallet';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let wallet: BitcoinWallet;

const displayMenu = () => {
    console.log('\nBitcoin Wallet CLI');
    console.log('1. Create new wallet');
    console.log('2. Import wallet from mnemonic');
    console.log('3. Display mnemonic');
    console.log('4. Generate SegWit address');
    console.log('5. Generate Legacy address');
    console.log('6. Exit');
    console.log('\nEnter your choice (1-6):');
};

const handleChoice = async (choice: string) => {
    switch (choice) {
        case '1':
            wallet = new BitcoinWallet();
            console.log('\nNew wallet created!');
            console.log('IMPORTANT: Please save your mnemonic phrase securely:');
            console.log(wallet.getMnemonic());
            break;

        case '2':
            rl.question('\nEnter your mnemonic phrase: ', (mnemonic) => {
                try {
                    wallet = new BitcoinWallet(mnemonic);
                    console.log('Wallet imported successfully!');
                } catch (error: unknown) {
                    console.error('Error importing wallet:', error instanceof Error ? error.message : String(error));
                }
                displayMenu();
            });
            return; // Don't display menu yet

        case '3':
            if (!wallet) {
                console.log('Please create or import a wallet first.');
            } else {
                console.log('\nYour mnemonic phrase:');
                console.log(wallet.getMnemonic());
            }
            break;

        case '4':
            if (!wallet) {
                console.log('Please create or import a wallet first.');
            } else {
                rl.question('\nEnter address index (default 0): ', async (index) => {
                    const address = await wallet.getSegWitAddress(parseInt(index) || 0);
                    console.log(`\nSegWit address: ${address}`);
                    displayMenu();
                });
                return; // Don't display menu yet
            }
            break;

        case '5':
            if (!wallet) {
                console.log('Please create or import a wallet first.');
            } else {
                rl.question('\nEnter address index (default 0): ', async (index) => {
                    const address = await wallet.getLegacyAddress(parseInt(index) || 0);
                    console.log(`\nLegacy address: ${address}`);
                    displayMenu();
                });
                return; // Don't display menu yet
            }
            break;

        case '6':
            console.log('\nGoodbye!');
            rl.close();
            process.exit(0);
            break;

        default:
            console.log('Invalid choice. Please try again.');
    }
    displayMenu();
};

const startCLI = () => {
    displayMenu();
    rl.on('line', handleChoice);
};

startCLI();