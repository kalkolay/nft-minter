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
exports.buildTransaction = exports.logNewMint = exports.logBalance = exports.logTransaction = exports.logNewKeypair = exports.logAccountInfo = exports.newLogSection = exports.loadKeypairFromFile = void 0;
const web3_js_1 = require("@solana/web3.js");
function loadKeypairFromFile(path) {
    return web3_js_1.Keypair.fromSecretKey(Buffer.from(JSON.parse(require("fs").readFileSync(path, "utf-8"))));
}
exports.loadKeypairFromFile = loadKeypairFromFile;
function newLogSection() {
    console.log("-----------------------------------------------------");
}
exports.newLogSection = newLogSection;
function logAccountInfo(accountInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Account Info:");
        console.log(accountInfo);
    });
}
exports.logAccountInfo = logAccountInfo;
function logNewKeypair(keypair) {
    console.log("Created a new keypair.");
    console.log(`   New account Public Key: ${keypair.publicKey}`);
}
exports.logNewKeypair = logNewKeypair;
function logTransaction(connection, signature) {
    return __awaiter(this, void 0, void 0, function* () {
        yield connection.confirmTransaction(signature);
        console.log("Transaction successful.");
        console.log(`   Transaction signature: ${signature}`);
    });
}
exports.logTransaction = logTransaction;
function logBalance(accountName, connection, pubkey) {
    return __awaiter(this, void 0, void 0, function* () {
        const balance = yield connection.getBalance(pubkey);
        console.log(`   ${accountName}:`);
        console.log(`       Account Pubkey: ${pubkey.toString()} SOL`);
        console.log(`       Account Balance: ${balance / web3_js_1.LAMPORTS_PER_SOL} SOL`);
    });
}
exports.logBalance = logBalance;
function logNewMint(mintPubkey, decimals) {
    console.log("Created a new mint.");
    console.log(`   New mint Public Key: ${mintPubkey}`);
    console.log(`   Mint type: ${decimals === 0 ? "NFT" : "SPL Token"}`);
}
exports.logNewMint = logNewMint;
function buildTransaction(connection, payer, signers, instructions) {
    return __awaiter(this, void 0, void 0, function* () {
        let blockhash = yield connection
            .getLatestBlockhash()
            .then((res) => res.blockhash);
        const messageV0 = new web3_js_1.TransactionMessage({
            payerKey: payer,
            recentBlockhash: blockhash,
            instructions,
        }).compileToV0Message();
        const tx = new web3_js_1.VersionedTransaction(messageV0);
        signers.forEach((s) => tx.sign([s]));
        return tx;
    });
}
exports.buildTransaction = buildTransaction;
