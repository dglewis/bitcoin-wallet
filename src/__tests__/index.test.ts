import readline from 'readline';
import { BitcoinWallet } from '../wallet';
import { startCLI, cleanup } from '../index';
import { SecureConsole } from '../utils/secureConsole';

/**
 * Note about TTYWRAP open handle warning in Jest:
 * Jest may show a warning about an open TTYWRAP handle when running these tests.
 * This is a known issue when testing code that uses process.stdin/stdout or readline.
 * The handle is properly cleaned up in the application code, but Jest's process management
 * sometimes detects it as still open. This warning can be safely ignored as it doesn't
 * affect the application's functionality or indicate a real resource leak.
 * See: https://github.com/facebook/jest/issues/11677
 */

// Mock SecureConsole to avoid TTYWRAP handle
jest.mock('../utils/secureConsole', () => ({
    SecureConsole: {
        displaySensitiveData: jest.fn((_, data) => Promise.resolve(console.log(data))),
        cleanup: jest.fn()
    }
}));

// Mock readline with a fake interface
jest.mock('readline', () => ({
    createInterface: jest.fn().mockReturnValue({
        question: jest.fn(),
        on: jest.fn(),
        close: jest.fn(),
        removeAllListeners: jest.fn(),
    })
}));

jest.mock('../wallet');

// Mock process.stdin and process.stdout
const mockProcess = {
    ...process,
    stdin: {
        isTTY: true,
        setRawMode: jest.fn(),
        resume: jest.fn(),
        pause: jest.fn()
    },
    stdout: {
        isTTY: true,
        write: jest.fn()
    },
    on: jest.fn(),
    exit: jest.fn()
};

// Replace the process object for tests
global.process = mockProcess as any;

describe('CLI Interface', () => {
    let mockReadline: any;
    let mockConsoleLog: jest.SpyInstance;
    let mockConsoleError: jest.SpyInstance;
    let lineHandler: (line: string) => void;
    let questionCallback: (answer: string) => void;
    let processListeners: any = {};

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Mock process listeners
        processListeners = {};
        mockProcess.on.mockImplementation((event: string, listener: Function) => {
            processListeners[event] = processListeners[event] || [];
            processListeners[event].push(listener);
            return mockProcess;
        });

        // Mock console methods
        mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'clear').mockImplementation();

        mockReadline = {
            question: jest.fn((query: string, callback: (answer: string) => void) => {
                questionCallback = callback;
            }),
            on: jest.fn((event: string, callback) => {
                if (event === 'line') {
                    lineHandler = callback;
                }
            }),
            close: jest.fn(),
            removeAllListeners: jest.fn(),
            simulateInput: (line: string) => {
                if (lineHandler) {
                    lineHandler(line);
                }
            }
        };

        (readline.createInterface as jest.Mock).mockReturnValue(mockReadline);
    });

    afterEach(() => {
        cleanup();
        mockReadline.close();
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    test('should create new wallet and display mnemonic', async () => {
        const mockMnemonic = 'test mnemonic phrase';
        const mockWallet = {
            getMnemonic: jest.fn().mockReturnValue(mockMnemonic),
        };
        (BitcoinWallet as jest.Mock).mockImplementation(() => mockWallet);

        startCLI();
        mockReadline.simulateInput('1');

        // Run all pending timers and promises
        jest.runAllTimers();
        await Promise.resolve();
        jest.runAllTimers();
        await Promise.resolve();

        const allCalls = mockConsoleLog.mock.calls.map(call => call[0]);
        expect(allCalls).toContain('\nNew wallet created!');
        expect(allCalls).toContain(mockMnemonic);
    });

    test('should import wallet from mnemonic', async () => {
        const mockWallet = {};
        (BitcoinWallet as jest.Mock).mockImplementation((mnemonic?: string) => {
            if (mnemonic === 'test input') return mockWallet;
            throw new Error('Invalid mnemonic phrase');
        });

        startCLI();
        mockReadline.simulateInput('2');
        questionCallback('test input');

        // Run all pending timers and promises
        jest.runAllTimers();
        await Promise.resolve();
        jest.runAllTimers();
        await Promise.resolve();

        expect(BitcoinWallet).toHaveBeenCalledWith('test input');
        const allCalls = mockConsoleLog.mock.calls.map(call => call[0]);
        expect(allCalls).toContain('Wallet imported successfully!');
    });

    test('should display error for invalid mnemonic', async () => {
        (BitcoinWallet as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid mnemonic phrase');
        });

        startCLI();
        mockReadline.simulateInput('2');
        questionCallback('invalid');

        // Run all pending timers and promises
        jest.runAllTimers();
        await Promise.resolve();
        jest.runAllTimers();
        await Promise.resolve();

        expect(mockConsoleError).toHaveBeenCalledWith(
            expect.stringContaining('Technical error'),
            expect.any(Error)
        );
    });

    test('should exit gracefully', async () => {
        startCLI();
        mockReadline.simulateInput('6');

        // Run all pending timers and promises
        jest.runAllTimers();
        await Promise.resolve();

        expect(mockConsoleLog).toHaveBeenCalledWith('Goodbye!');
        expect(mockProcess.exit).toHaveBeenCalledWith(0);
        expect(mockReadline.close).toHaveBeenCalled();
    });

    test('should clean up on process termination', () => {
        startCLI();

        // Simulate SIGINT
        if (processListeners['SIGINT']) {
            processListeners['SIGINT'].forEach((listener: (...args: any[]) => void) => listener());
        }

        expect(mockReadline.close).toHaveBeenCalled();
    });
});
