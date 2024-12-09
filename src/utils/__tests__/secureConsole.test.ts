import { SecureConsole } from '../secureConsole';
import * as readline from 'readline';

jest.mock('readline', () => ({
    createInterface: jest.fn().mockReturnValue({
        question: jest.fn((query, cb) => cb()),
        close: jest.fn()
    })
}));

describe('SecureConsole', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.clear = jest.fn();
        console.log = jest.fn();
    });

    test('should display sensitive data securely', async () => {
        await SecureConsole.displaySensitiveData('Test Message', 'secret data');

        expect(console.clear).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('WARNING'));
        expect(console.log).toHaveBeenCalledWith('secret data');
    });
}); 