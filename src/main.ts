import { Keypair, PublicKey } from "@solana/web3.js";
import { createAccount, createNft, mintNft } from "./tokens";
import { loadKeypairFromFile } from "./util";

const payer = loadKeypairFromFile(
	require("os").homedir() + "/.config/solana/id.json",
);

const testUserKeypair1 = Keypair.generate();
const tokenMintKeypair = Keypair.generate();

// Replace this with the special wallet's public key
const specialWalletPublicKey = new PublicKey("HnMw7uuXhS744kvmBU9QGpHav8GysFrHERPtHQdNFk49");

async function tokensScript() {
	await createAccount("Test User Keypair #1", testUserKeypair1, payer);

	// NFT
	await createNft(
		tokenMintKeypair,
		payer,
		"Homer NFT",
		"HOMR",
		"https://raw.githubusercontent.com/solana-developers/web3-examples/new-examples/tokens/tokens/.assets/nft.json",
	);

	// Mint NFT to the special wallet
	await mintNft(
		tokenMintKeypair.publicKey,
		payer,
		payer,
		specialWalletPublicKey,
	);
}

tokensScript();