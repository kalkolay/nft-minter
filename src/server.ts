import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createNft, mintNft, transferNft } from "./tokens";
import { loadKeypairFromFile } from "./util";
import path from "path";

// Load the payer keypair from the root folder of the project
const payer = loadKeypairFromFile(
    path.join(__dirname, "..", "id.json"),
);

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to mint NFT
app.post("/give-nft", async (req: Request, res: Response) => {
    const walletAddress = req.query.wallet as string;
    const name = req.query.name as string;
    const symbol = req.query.symbol as string;
    const imageUri = req.query.imageUri as string;

    if (!walletAddress) {
        return res.status(400).send("Wallet address is required");
    }

    if (!name || !symbol || !imageUri) {
        return res.status(400).send("Name, symbol, and imageUri are required");
    }

    try {
        const recipientPublicKey = new PublicKey(walletAddress);
        const mintKeypair = Keypair.generate();

        // Create the NFT
        await createNft(
            mintKeypair,
            payer,
            name,
            symbol,
            imageUri,
        );

        // Mint the NFT to the recipient's wallet
        await mintNft(
            mintKeypair.publicKey,
            payer,
            payer,
            recipientPublicKey,
        );

        res.status(200).json({
            message: `NFT successfully minted and sent to ${walletAddress}`,
            mintAddress: mintKeypair.publicKey.toBase58()
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while minting the NFT");
    }
});

// Endpoint to transfer NFT
app.post("/transfer-nft", async (req: Request, res: Response) => {
    const fromWallet = req.query.fromWallet as string;
    const toWallet = req.query.toWallet as string;
    const mintAddress = req.query.mintAddress as string;

    if (!fromWallet || !toWallet || !mintAddress) {
        return res.status(400).send("All parameters (fromWallet, toWallet, mintAddress) are required");
    }

    try {
        const fromPublicKey = new PublicKey(fromWallet);
        const toPublicKey = new PublicKey(toWallet);
        const mintPublicKey = new PublicKey(mintAddress);

        // Transfer the NFT
        await transferNft(
            mintPublicKey,
            payer,
            fromPublicKey,
            toPublicKey,
        );

        res.status(200).send(`Successfully transferred NFT from ${fromWallet} to ${toWallet}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while transferring the NFT");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
