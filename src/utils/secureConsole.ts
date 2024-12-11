import * as readline from 'readline';

export class SecureConsole {
    private static rl: readline.Interface | null = null;

    private static getReadline(): readline.Interface {
        if (!this.rl) {
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
        }
        return this.rl;
    }

    public static cleanup() {
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }
    }

    public static async displaySensitiveData(message: string, data: string): Promise<void> {
        console.log(message);
        console.log(data);

        // In test environment, don't create readline interface
        if (process.env.NODE_ENV === 'test') {
            return Promise.resolve();
        }

        const rl = this.getReadline();
        return new Promise((resolve) => {
            rl.question('\nPress enter to continue...', () => {
                console.clear();
                resolve();
            });
        });
    }
}