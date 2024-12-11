import { BitcoinWallet } from './wallet';
import * as readline from 'readline';
import { SecureConsole } from './utils/secureConsole';
import { handleError } from './utils/errorHandler';

export let rl: readline.Interface | null = null;

/**
 * Initialize the readline interface for CLI input/output.
 * Note: When testing with Jest, you might see a TTYWRAP open handle warning.
 * This is a known Jest issue with process.stdin/stdout and doesn't indicate a real resource leak.
 * We properly clean up the readline interface in the cleanup() function and through process handlers.
 */
function initReadline() {
    if (!rl) {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }
    return rl!;
}

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
    const readline = rl;
    if (!readline) {
        throw new Error('Readline interface not initialized');
    }

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
                    readline.question('\nEnter your mnemonic phrase: ', async (mnemonic) => {
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
                        readline.question('\nEnter address index (default 0): ', async (index) => {
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
                        readline.question('\nEnter address index (default 0): ', async (index) => {
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
                console.log('Goodbye!');
                cleanup();
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

export const startCLI = () => {
    rl = initReadline();

    // Handle process termination
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);

    displayMenu();
    rl.on('line', handleChoice);
};

// Export for testing
export { handleChoice, displayMenu, initReadline };

export function cleanup() {
    if (rl) {
        // Only try to remove listeners if the method exists (handles both real and mock interfaces)
        if (typeof rl.removeAllListeners === 'function') {
            rl.removeAllListeners();
        }
        rl.close();
        rl = null;
    }
    // Clean up SecureConsole as well
    SecureConsole.cleanup();
}

// Only start CLI if running directly (not being imported)
if (require.main === module) {
    startCLI();
}
