import { BitcoinWallet } from '../wallet';
import * as readline from 'readline';
import { SecureConsole } from '../utils/secureConsole';

// Mock dependencies
jest.mock('../wallet');
jest.mock('../utils/secureConsole');
jest.mock('readline', () => ({
    createInterface: jest.fn().mockReturnValue({
        question: jest.fn(),
        on: jest.fn(),
        close: jest.fn()
    })
}));

describe('CLI Interface', () => {
    let mockConsoleLog: jest.SpyInstance;
    let mockConsoleError: jest.SpyInstance;

    beforeEach(() => {
        mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
        jest.clearAllMocks();
    });

    afterEach(() => {
        mockConsoleLog.mockRestore();
        mockConsoleError.mockRestore();
    });

    test('should create new wallet and display mnemonic', async () => {
        const mockMnemonic = 'test mnemonic phrase';
        (BitcoinWallet as jest.Mock).mockImplementation(() => ({
            getMnemonic: () => mockMnemonic
        }));

        // Import the CLI module (this will trigger the initial menu display)
        const cli = require('../index');

        // Simulate user selecting option 1
        const rl = readline.createInterface({} as any);
        rl.on.mock.calls[0][1]('1');

        // Verify wallet creation and mnemonic display
        expect(BitcoinWallet).toHaveBeenCalled();
        expect(SecureConsole.displaySensitiveData).toHaveBeenCalledWith(
            'IMPORTANT: Please save your mnemonic phrase securely',
            mockMnemonic
        );
    });
}); 