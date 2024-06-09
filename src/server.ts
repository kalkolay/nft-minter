import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createNft, mintNft, transferNft } from "./tokens";
import { loadKeypairFromFile } from "./util";
import path from "path";
import fetch from "node-fetch";

// Load the payer keypair from the root folder of the project
const payer = loadKeypairFromFile(
    path.join(__dirname, "..", "id.json"),
);

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Route handler for the root URL
app.get('/', (req: any, res: { sendFile: (arg0: string) => void; }) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Endpoint to mint NFT
app.post("/give-nft", async (req: Request, res: Response) => {
    const username = req.query.username as string;
    const name = req.query.name as string;
    const symbol = req.query.symbol as string;
    const imageUri = req.query.imageUri as string;
    let walletAddress = req.query.wallet as string;

    if (!name || !symbol || !imageUri) {
        return res.status(400).send({ error: "Name, symbol, and imageUri are required" });
    }

    try {
        if (!walletAddress) {
            // Fetch the wallet address from the Google Sheet using Instagram username
            const sheetUrl = "https://api.sheety.co/0bf9aeca2aa96fa235902765caab8a5c/participantsCompassHackathon2024/sheet1";
            const sheetResponse = await fetch(sheetUrl);
            const sheetData = await sheetResponse.json();

            const participant = sheetData.sheet1.find((p: any) => p.participantInstagramUsername === username);
            if (participant) {
                walletAddress = participant.participantWallet;
                console.log(`Fetched wallet address for username ${username}: ${walletAddress}`);
            }
        }

        if (!walletAddress) {
            return res.status(400).send({ error: "Wallet address not found in sheet and not provided in request" });
        }

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
        console.error("An error occurred while minting the NFT:", error);
        res.status(500).send({ error: "An error occurred while minting the NFT" });
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
        console.error("An error occurred while transferring the NFT:", error);
        res.status(500).send("An error occurred while transferring the NFT");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
