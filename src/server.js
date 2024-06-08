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
// Load the payer keypair
const payer = (0, util_1.loadKeypairFromFile)(require("os").homedir() + "/.config/solana/id.json");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware to parse JSON bodies
app.use(body_parser_1.default.json());
app.post("/give-nft", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletAddress = req.query.wallet;
    if (!walletAddress) {
        return res.status(400).send("Wallet address is required");
    }
    try {
        const recipientPublicKey = new web3_js_1.PublicKey(walletAddress);
        const tokenMintKeypair = web3_js_1.Keypair.generate();
        // Create the NFT
        yield (0, tokens_1.createNft)(tokenMintKeypair, payer, "Special NFT", "SPNFT", "https://raw.githubusercontent.com/solana-developers/web3-examples/new-examples/tokens/tokens/.assets/nft.json");
        // Mint the NFT to the recipient's wallet
        yield (0, tokens_1.mintNft)(tokenMintKeypair.publicKey, payer, payer, recipientPublicKey);
        res.status(200).send("NFT successfully minted and sent to " + walletAddress);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while minting the NFT");
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
