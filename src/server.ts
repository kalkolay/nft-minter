import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createNft, mintNft } from "./tokens";
import { loadKeypairFromFile } from "./util";

// Load the payer keypair
const payer = loadKeypairFromFile("id.json",);

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.post("/give-nft", async (req: Request, res: Response) => {
    const walletAddress = req.query.wallet as string;
    if (!walletAddress) {
        return res.status(400).send("Wallet address is required");
    }

    try {
        const recipientPublicKey = new PublicKey(walletAddress);
        const tokenMintKeypair = Keypair.generate();

        // Create the NFT
        await createNft(
            tokenMintKeypair,
            payer,
            "Special NFT",
            "SPNFT",
            "https://raw.githubusercontent.com/solana-developers/web3-examples/new-examples/tokens/tokens/.assets/nft.json",
        );

        // Mint the NFT to the recipient's wallet
        await mintNft(
            tokenMintKeypair.publicKey,
            payer,
            payer,
            recipientPublicKey,
        );

        res.status(200).send("NFT successfully minted and sent to " + walletAddress);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while minting the NFT");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});