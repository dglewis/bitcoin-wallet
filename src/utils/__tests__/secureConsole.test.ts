import { SecureConsole } from '../secureConsole';

describe('SecureConsole', () => {
    let mockConsoleLog: jest.SpyInstance;
    let mockConsoleError: jest.SpyInstance;

    beforeEach(() => {
        mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
        process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
        jest.clearAllMocks();
        SecureConsole.cleanup();
    });

    test('should display sensitive data securely', async () => {
        await SecureConsole.displaySensitiveData('Test Message', 'secret data');

        expect(mockConsoleLog).toHaveBeenCalledWith('Test Message');
        expect(mockConsoleLog).toHaveBeenCalledWith('secret data');
    });
});