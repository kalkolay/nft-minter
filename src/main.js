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
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const tokens_1 = require("./tokens");
const util_1 = require("./util");
const payer = (0, util_1.loadKeypairFromFile)(require("os").homedir() + "/.config/solana/id.json");
const testUserKeypair1 = web3_js_1.Keypair.generate();
const tokenMintKeypair = web3_js_1.Keypair.generate();
// Replace this with the special wallet's public key
const specialWalletPublicKey = new web3_js_1.PublicKey("HnMw7uuXhS744kvmBU9QGpHav8GysFrHERPtHQdNFk49");
function tokensScript() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, tokens_1.createAccount)("Test User Keypair #1", testUserKeypair1, payer);
        // NFT
        yield (0, tokens_1.createNft)(tokenMintKeypair, payer, "Homer NFT", "HOMR", "https://raw.githubusercontent.com/solana-developers/web3-examples/new-examples/tokens/tokens/.assets/nft.json");
        // Mint NFT to the special wallet
        yield (0, tokens_1.mintNft)(tokenMintKeypair.publicKey, payer, payer, specialWalletPublicKey);
    });
}
tokensScript();
