"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const web3_js_1 = require("@solana/web3.js");
const tokens_1 = require("./tokens");
const util_1 = require("./util");
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// Load the payer keypair from the root folder of the project
const payer = (0, util_1.loadKeypairFromFile)(path_1.default.join(__dirname, "..", "id.json"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware to parse JSON bodies
app.use(body_parser_1.default.json());
// Serve static files from the 'public' directory
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
// Route handler for the root URL
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '..', 'public', 'index.html'));
});
// Endpoint to mint NFT
app.post("/give-nft", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.query.username;
    const name = req.query.name;
    const symbol = req.query.symbol;
    const imageUri = req.query.imageUri;
    let walletAddress = req.query.wallet;
    if (!name || !symbol || !imageUri) {
        return res.status(400).send({ error: "Name, symbol, and imageUri are required" });
    }
    try {
        if (!walletAddress) {
            // Fetch the wallet address from the Google Sheet using Instagram username
            const sheetUrl = "https://api.sheety.co/0bf9aeca2aa96fa235902765caab8a5c/participantsCompassHackathon2024/sheet1";
            const sheetResponse = yield (0, node_fetch_1.default)(sheetUrl);
            const sheetData = yield sheetResponse.json();
            const participant = sheetData.sheet1.find((p) => p.participantInstagramUsername === username);
            if (participant) {
                walletAddress = participant.participantWallet;
                console.log(`Fetched wallet address for username ${username}: ${walletAddress}`);
            }
        }
        if (!walletAddress) {
            return res.status(400).send({ error: "Wallet address not found in sheet and not provided in request" });
        }
        const recipientPublicKey = new web3_js_1.PublicKey(walletAddress);
        const mintKeypair = web3_js_1.Keypair.generate();
        // Create the NFT
        yield (0, tokens_1.createNft)(mintKeypair, payer, name, symbol, imageUri);
        // Mint the NFT to the recipient's wallet
        yield (0, tokens_1.mintNft)(mintKeypair.publicKey, payer, payer, recipientPublicKey);
        res.status(200).json({
            message: `NFT successfully minted and sent to ${walletAddress}`,
            mintAddress: mintKeypair.publicKey.toBase58()
        });
    }
    catch (error) {
        console.error("An error occurred while minting the NFT:", error);
        res.status(500).send({ error: "An error occurred while minting the NFT" });
    }
}));
// Endpoint to transfer NFT
app.post("/transfer-nft", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fromWallet = req.query.fromWallet;
    const toWallet = req.query.toWallet;
    const mintAddress = req.query.mintAddress;
    if (!fromWallet || !toWallet || !mintAddress) {
        return res.status(400).send("All parameters (fromWallet, toWallet, mintAddress) are required");
    }
    try {
        const fromPublicKey = new web3_js_1.PublicKey(fromWallet);
        const toPublicKey = new web3_js_1.PublicKey(toWallet);
        const mintPublicKey = new web3_js_1.PublicKey(mintAddress);
        // Transfer the NFT
        yield (0, tokens_1.transferNft)(mintPublicKey, payer, fromPublicKey, toPublicKey);
        res.status(200).send(`Successfully transferred NFT from ${fromWallet} to ${toWallet}`);
    }
    catch (error) {
        console.error("An error occurred while transferring the NFT:", error);
        res.status(500).send("An error occurred while transferring the NFT");
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
