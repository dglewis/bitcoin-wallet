# Bitcoin Wallet API Documentation

## BitcoinWallet Class

The `BitcoinWallet` class provides core functionality for Bitcoin wallet operations.

### Constructor

```typescript
constructor(mnemonic?: string)
```

Creates a new wallet instance.
- **Parameters:**
  - `mnemonic` (optional): 24-word BIP-39 mnemonic phrase
- **Returns:** BitcoinWallet instance
- **Throws:** Error if mnemonic is invalid
- **Example:**
  ```typescript
  // Create new wallet with random mnemonic
  const wallet = new BitcoinWallet();

  // Import existing wallet
  const importedWallet = new BitcoinWallet('your mnemonic phrase here');
  ```

### Methods

#### getMnemonic

```typescript
public getMnemonic(): string
```

Returns the wallet's mnemonic phrase.
- **Returns:** 24-word mnemonic phrase
- **Example:**
  ```typescript
  const mnemonic = wallet.getMnemonic();
  console.log(mnemonic); // "abandon abandon ability ..."
  ```

#### getSegWitAddress

```typescript
public async getSegWitAddress(index: number = 0): Promise<string>
```

Generates a Native SegWit (bc1) address.
- **Parameters:**
  - `index`: Address index (default: 0)
- **Returns:** Promise resolving to Bech32 address
- **Throws:** Error if address generation fails
- **Example:**
  ```typescript
  const address = await wallet.getSegWitAddress(0);
  console.log(address); // "bc1q..."
  ```

#### getLegacyAddress

```typescript
public async getLegacyAddress(index: number = 0): Promise<string>
```

Generates a Legacy (1) address.
- **Parameters:**
  - `index`: Address index (default: 0)
- **Returns:** Promise resolving to P2PKH address
- **Throws:** Error if address generation fails
- **Example:**
  ```typescript
  const address = await wallet.getLegacyAddress(0);
  console.log(address); // "1..."
  ```

### Private Methods

#### derivePath

```typescript
private derivePath(path: string)
```

Internal method for BIP-32 key derivation.
- **Parameters:**
  - `path`: BIP-32 derivation path
- **Returns:** BIP32 key pair
- **Used by:** getSegWitAddress, getLegacyAddress

## Usage Example

```typescript
import { BitcoinWallet } from './wallet';

async function main() {
    // Create new wallet
    const wallet = new BitcoinWallet();

    // Save mnemonic securely
    console.log('Backup your mnemonic:', wallet.getMnemonic());

    // Generate addresses
    const segwitAddr = await wallet.getSegWitAddress(0);
    const legacyAddr = await wallet.getLegacyAddress(0);

    console.log('SegWit Address:', segwitAddr);
    console.log('Legacy Address:', legacyAddr);
}

main().catch(console.error);
```

## Error Handling

The API uses TypeScript for type safety and throws descriptive errors:

```typescript
try {
    const wallet = new BitcoinWallet('invalid mnemonic');
} catch (error) {
    console.error('Wallet creation failed:', error.message);
}
```

## Security Notes

1. The mnemonic is stored in memory only
2. No persistent storage is implemented
3. User is responsible for secure mnemonic backup
4. Private keys are derived on-demand and not stored