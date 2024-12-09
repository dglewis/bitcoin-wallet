import * as readline from 'readline';

export class SecureConsole {
    static async displaySensitiveData(message: string, data: string): Promise<void> {
        console.clear();
        console.log('\n⚠️  WARNING: Sensitive information follows');
        console.log('Make sure no one can see your screen\n');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('Press ENTER to view or CTRL+C to cancel...', () => {
                console.clear();
                console.log(`\n${message}:`);
                console.log(data);
                console.log('\nPress ENTER to clear screen...');

                rl.question('', () => {
                    console.clear();
                    rl.close();
                    resolve();
                });
            });
        });
    }
} 