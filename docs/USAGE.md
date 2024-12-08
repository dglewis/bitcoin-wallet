# Bitcoin Wallet Usage Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start the CLI wallet
npm start
```

## CLI Interface

The wallet provides an interactive command-line interface with the following options:

1. **Create new wallet**
   - Generates a new 24-word mnemonic phrase
   - Automatically creates HD wallet structure
   - Example output:
     ```
     New wallet created!
     IMPORTANT: Please save your mnemonic phrase securely:
     abandon abandon ability ... (24 words total)
     ```

2. **Import existing wallet**
   - Restore wallet using your 24-word mnemonic phrase
   - Example:
     ```
     Enter your mnemonic phrase: abandon abandon ability ...
     Wallet imported successfully!
     ```

3. **Display mnemonic**
   - Securely view your wallet's mnemonic phrase
   - ⚠️ Only display in secure environment

4. **Generate SegWit address**
   - Creates Native SegWit (bc1...) addresses
   - Supports multiple addresses via index
   - Example:
     ```
     Enter address index (default 0): 0
     SegWit address: bc1q...
     ```

5. **Generate Legacy address**
   - Creates Legacy (1...) addresses
   - Supports multiple addresses via index
   - Example:
     ```
     Enter address index (default 0): 0
     Legacy address: 1...
     ```

## Security Best Practices

1. **Mnemonic Security**
   - Write down your mnemonic phrase on paper
   - Never store digitally or take photos
   - Keep in secure, private location
   - Consider multiple backup copies

2. **Environment Security**
   - Use on trusted computer
   - Ensure no malware/keyloggers
   - Consider air-gapped setup for large amounts

## Technical Details

### Address Types

1. **Native SegWit (Bech32)**
   - Prefix: bc1
   - Path: m/84'/0'/0'/0/index
   - Lowest fees
   - Highest security

2. **Legacy**
   - Prefix: 1
   - Path: m/44'/0'/0'/0/index
   - Maximum compatibility

### HD Wallet Structure

The wallet implements BIP standards:
- BIP-39: Mnemonic generation
- BIP-32: HD wallet structure
- BIP-44: Legacy address derivation
- BIP-84: Native SegWit derivation

## Error Handling

Common error messages and solutions:

1. "Invalid mnemonic phrase"
   - Ensure all words are correct
   - Check word count (24 words)
   - Verify words against BIP-39 wordlist

2. "Failed to generate address"
   - Verify index is non-negative integer
   - Check system memory availability