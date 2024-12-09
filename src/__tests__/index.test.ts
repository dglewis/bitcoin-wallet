import { BitcoinWallet } from '../wallet';
import * as readline from 'readline';
import { SecureConsole } from '../utils/secureConsole';

// Mock dependencies
jest.mock('../wallet');
jest.mock('../utils/secureConsole');
jest.mock('readline');

describe('CLI Interface', () => {
    let mockConsoleLog: jest.SpyInstance;
    let mockConsoleError: jest.SpyInstance;
    let mockLineHandler: (line: string) => void;

    beforeEach(() => {
        mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
        jest.clearAllMocks();

        // Mock readline.createInterface
        (readline.createInterface as jest.Mock).mockReturnValue({
            question: jest.fn(),
            on: jest.fn((event: string, callback: (line: string) => void) => {
                if (event === 'line') {
                    mockLineHandler = callback;
                }
            }),
            close: jest.fn()
        });
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
        require('../index');

        // Simulate user selecting option 1
        mockLineHandler('1');

        // Verify wallet creation and mnemonic display
        expect(BitcoinWallet).toHaveBeenCalled();
        expect(SecureConsole.displaySensitiveData).toHaveBeenCalledWith(
            'IMPORTANT: Please save your mnemonic phrase securely',
            mockMnemonic
        );
    });
});