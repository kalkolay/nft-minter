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
exports.transferNft = exports.mintNft = exports.createNft = void 0;
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const util_1 = require("./util");
const connection = new web3_js_1.Connection("https://api.devnet.solana.com", {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000,
});
function createNft(mintKeypair, payerKeypair, tokenName, tokenSymbol, tokenUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const createMintAccountInstruction = web3_js_1.SystemProgram.createAccount({
            fromPubkey: payerKeypair.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(spl_token_1.MINT_SIZE),
            space: spl_token_1.MINT_SIZE,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        });
        const initializeMintInstruction = (0, spl_token_1.createInitializeMintInstruction)(mintKeypair.publicKey, 0, payerKeypair.publicKey, payerKeypair.publicKey);
        const createMetadataInstruction = (0, mpl_token_metadata_1.createCreateMetadataAccountV3Instruction)({
            metadata: web3_js_1.PublicKey.findProgramAddressSync([
                Buffer.from("metadata"),
                mpl_token_metadata_1.PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
            ], mpl_token_metadata_1.PROGRAM_ID)[0],
            mint: mintKeypair.publicKey,
            mintAuthority: payerKeypair.publicKey,
            payer: payerKeypair.publicKey,
            updateAuthority: payerKeypair.publicKey,
        }, {
            createMetadataAccountArgsV3: {
                data: {
                    name: tokenName,
                    symbol: tokenSymbol,
                    uri: tokenUri,
                    creators: null,
                    sellerFeeBasisPoints: 0,
                    uses: null,
                    collection: null,
                },
                isMutable: false,
                collectionDetails: null,
            },
        });
        const tx = yield (0, util_1.buildTransaction)(connection, payerKeypair.publicKey, [payerKeypair, mintKeypair], [
            createMintAccountInstruction,
            initializeMintInstruction,
            createMetadataInstruction,
        ]);
        const signature = yield connection.sendTransaction(tx);
        (0, util_1.newLogSection)();
        yield (0, util_1.logTransaction)(connection, signature);
    });
}
exports.createNft = createNft;
function mintNft(mintPublicKey, mintAuthority, payerKeypair, recipientPublicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, util_1.newLogSection)();
        console.log(`Minting NFT to recipient: ${recipientPublicKey}`);
        const ixList = [];
        const associatedTokenAddress = (0, spl_token_1.getAssociatedTokenAddressSync)(mintPublicKey, recipientPublicKey);
        console.log(`   Recipient Associated Token Address: ${associatedTokenAddress}`);
        const associatedTokenAccountInfo = yield connection.getAccountInfo(associatedTokenAddress);
        if (!associatedTokenAccountInfo || associatedTokenAccountInfo.lamports === 0) {
            ixList.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payerKeypair.publicKey, associatedTokenAddress, recipientPublicKey, mintPublicKey));
        }
        ixList.push((0, spl_token_1.createMintToInstruction)(mintPublicKey, associatedTokenAddress, mintAuthority.publicKey, 1));
        ixList.push((0, mpl_token_metadata_1.createCreateMasterEditionV3Instruction)({
            edition: web3_js_1.PublicKey.findProgramAddressSync([
                Buffer.from("metadata"),
                mpl_token_metadata_1.PROGRAM_ID.toBuffer(),
                mintPublicKey.toBuffer(),
                Buffer.from("edition"),
            ], mpl_token_metadata_1.PROGRAM_ID)[0],
            metadata: web3_js_1.PublicKey.findProgramAddressSync([
                Buffer.from("metadata"),
                mpl_token_metadata_1.PROGRAM_ID.toBuffer(),
                mintPublicKey.toBuffer(),
            ], mpl_token_metadata_1.PROGRAM_ID)[0],
            mint: mintPublicKey,
            mintAuthority: payerKeypair.publicKey,
            payer: payerKeypair.publicKey,
            updateAuthority: payerKeypair.publicKey,
        }, {
            createMasterEditionArgs: { maxSupply: 1 },
        }));
        const tx = yield (0, util_1.buildTransaction)(connection, payerKeypair.publicKey, [mintAuthority, payerKeypair], ixList);
        const signature = yield connection.sendTransaction(tx);
        yield (0, util_1.logTransaction)(connection, signature);
    });
}
exports.mintNft = mintNft;
function transferNft(mintPublicKey, payerKeypair, fromPublicKey, toPublicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const ixList = [];
        const fromAtaAddress = (0, spl_token_1.getAssociatedTokenAddressSync)(mintPublicKey, fromPublicKey);
        const fromAtaAccountInfo = yield connection.getAccountInfo(fromAtaAddress);
        if (!fromAtaAccountInfo) {
            throw new Error("Sender's associated token account does not exist");
        }
        const toAtaAddress = (0, spl_token_1.getAssociatedTokenAddressSync)(mintPublicKey, toPublicKey);
        const toAtaAccountInfo = yield connection.getAccountInfo(toAtaAddress);
        if (!toAtaAccountInfo) {
            ixList.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payerKeypair.publicKey, toAtaAddress, toPublicKey, mintPublicKey));
        }
        ixList.push((0, spl_token_1.createTransferInstruction)(fromAtaAddress, toAtaAddress, fromPublicKey, 1 // Transferring one NFT
        ));
        const tx = yield (0, util_1.buildTransaction)(connection, payerKeypair.publicKey, [payerKeypair], ixList);
        const signature = yield connection.sendTransaction(tx);
        (0, util_1.newLogSection)();
        yield (0, util_1.logTransaction)(connection, signature);
    });
}
exports.transferNft = transferNft;
