# Solana NFT Minting and Transfer Service

This project provides a REST API service for minting and transferring NFTs on the Solana blockchain. The service is built using Express.js and interacts with the Solana blockchain using the `@solana/web3.js` and `@metaplex-foundation/mpl-token-metadata` libraries.

It is also possible to mint NFT by this website on its [main page](https://nft-miner-0c0f7df50061.herokuapp.com).

Deployed on [Heroku](https://dashboard.heroku.com/).

## API Endpoints

### Mint NFT

**Endpoint:**
```
POST /give-nft
```
**Query Parameters:**
- `wallet` (*string*): The recipient’s wallet address.
- `name` (*string*): The name of the NFT.
- `symbol` (*string*): The symbol of the NFT.
- `imageUri` (*string*): The URI of the image for the NFT.
**Example Request:**
```bash
curl -X POST "https://nft-miner-0c0f7df50061.herokuapp.com/give-nft?wallet=RecipientWalletPublicKey&name=YourNFTName&symbol=YourNFTSymbol&imageUri=YourImageURI"
```
**Response:**
```json
{
    "message": "NFT successfully minted and sent to RecipientWalletPublicKey",
    "mintAddress": "GeneratedMintAddress"
}
```

### Transfer NFT

**Endpoint:**
```
POST /transfer-nft
```
**Query Parameters:**
- `fromWallet` (*string*): The sender’s wallet address.
- `toWallet` (*string*): The recipient’s wallet address.
- `mintAddress` (*string*): The mint address of the NFT.
  **Example Request:**
```bash
curl -X POST "https://nft-miner-0c0f7df50061.herokuapp.com/transfer-nft?fromWallet=SenderWalletPublicKey&toWallet=RecipientWalletPublicKey&mintAddress=NFTMintAddress"
```
**Response:**
```
Successfully transferred NFT from SenderWalletPublicKey to RecipientWalletPublicKey
```

## Project Structure

- `src/`
  - `server.ts`: Entry point for the Express server. 
  - `tokens.ts`: Contains functions for creating, minting, and transferring NFTs. 
  - `util.ts`: Utility functions for handling Solana keypairs and transactions.
- `public\`
  - `index.html`: Main HTML page
___

Made by **AI Digital Creators** for Compass Hackathon 2024.
