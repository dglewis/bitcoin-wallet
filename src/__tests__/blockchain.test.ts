import { BlockchainService, UTXO } from '../blockchain';

describe('BlockchainService', () => {
    let service: BlockchainService;
    const testAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';

    beforeEach(() => {
        service = new BlockchainService('https://blockstream.info/api');
        global.fetch = jest.fn();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('getUTXOs should handle valid response', async () => {
        const mockUTXOs = [{
            txid: '123',
            vout: 0,
            value: 50000,
            scriptpubkey: '001414d0dbcf5e6d245ad8f00aaa0dcc59b47a6569b4'
        }];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockUTXOs
        });

        const result = await service.getUTXOs(testAddress);
        expect(result[0].txid).toBe('123');
        expect(result[0].witnessUtxo.value).toBe(50000);
    });

    test('getUTXOs should handle invalid response', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ([{ invalid: 'data' }])
        });

        await expect(service.getUTXOs(testAddress)).rejects.toThrow('Invalid UTXO response format');
    });
});

