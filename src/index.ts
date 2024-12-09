import { BitcoinWallet } from './wallet';
import * as readline from 'readline';
import { SecureConsole } from './utils/secureConsole';
import { handleError } from './utils/errorHandler';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let wallet: BitcoinWallet;

const displayMenu = () => {
    console.clear();
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
    try {
        switch (choice) {
            case '1':
                wallet = new BitcoinWallet();
                console.log('\nNew wallet created!');
                await SecureConsole.displaySensitiveData(
                    'IMPORTANT: Please save your mnemonic phrase securely',
                    wallet.getMnemonic()
                );
                break;

            case '2':
                return new Promise((resolve) => {
                    rl.question('\nEnter your mnemonic phrase: ', async (mnemonic) => {
                        try {
                            wallet = new BitcoinWallet(mnemonic);
                            console.log('Wallet imported successfully!');
                        } catch (error) {
                            console.error(handleError(error));
                        }
                        resolve(displayMenu());
                    });
                });

            case '3':
                if (!wallet) {
                    console.log('Please create or import a wallet first.');
                } else {
                    await SecureConsole.displaySensitiveData(
                        'Your mnemonic phrase',
                        wallet.getMnemonic()
                    );
                }
                break;

            case '4':
                if (!wallet) {
                    console.log('Please create or import a wallet first.');
                } else {
                    return new Promise((resolve) => {
                        rl.question('\nEnter address index (default 0): ', async (index) => {
                            try {
                                const parsedIndex = parseInt(index) || 0;
                                if (parsedIndex < 0) throw new Error('Index must be non-negative');
                                const address = await wallet.getSegWitAddress(parsedIndex);
                                console.log(`\nSegWit address: ${address}`);
                            } catch (error) {
                                console.error(handleError(error));
                            }
                            resolve(displayMenu());
                        });
                    });
                }
                break;

            case '5':
                if (!wallet) {
                    console.log('Please create or import a wallet first.');
                } else {
                    return new Promise((resolve) => {
                        rl.question('\nEnter address index (default 0): ', async (index) => {
                            try {
                                const parsedIndex = parseInt(index) || 0;
                                if (parsedIndex < 0) throw new Error('Index must be non-negative');
                                const address = await wallet.getLegacyAddress(parsedIndex);
                                console.log(`\nLegacy address: ${address}`);
                            } catch (error) {
                                console.error(handleError(error));
                            }
                            resolve(displayMenu());
                        });
                    });
                }
                break;

            case '6':
                console.clear();
                console.log('\nGoodbye!');
                rl.close();
                process.exit(0);
                break;

            default:
                console.log('Invalid choice. Please try again.');
        }
        displayMenu();
    } catch (error) {
        console.error(handleError(error));
        displayMenu();
    }
};

// Start the CLI
console.clear();
displayMenu();
rl.on('line', handleChoice);