import {
	createCreateMetadataAccountV3Instruction,
	createCreateMasterEditionV3Instruction,
	PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import {
	createAssociatedTokenAccountInstruction,
	createInitializeMintInstruction,
	createMintToInstruction,
	createTransferInstruction,
	getAssociatedTokenAddressSync,
	MINT_SIZE,
	TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
	Connection,
	Keypair,
	PublicKey,
	SystemProgram,
	TransactionInstruction,
} from "@solana/web3.js";
import {
	buildTransaction,
	logTransaction,
	newLogSection,
} from "./util";

const connection = new Connection("https://api.devnet.solana.com", {
	commitment: "confirmed",
	confirmTransactionInitialTimeout: 60000,
});

export async function createNft(
	mintKeypair: Keypair,
	payerKeypair: Keypair,
	tokenName: string,
	tokenSymbol: string,
	tokenUri: string,
) {
	const createMintAccountInstruction = SystemProgram.createAccount({
		fromPubkey: payerKeypair.publicKey,
		newAccountPubkey: mintKeypair.publicKey,
		lamports: await connection.getMinimumBalanceForRentExemption(MINT_SIZE),
		space: MINT_SIZE,
		programId: TOKEN_PROGRAM_ID,
	});

	const initializeMintInstruction = createInitializeMintInstruction(
		mintKeypair.publicKey,
		0,
		payerKeypair.publicKey,
		payerKeypair.publicKey,
	);

	const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
		{
			metadata: PublicKey.findProgramAddressSync(
				[
					Buffer.from("metadata"),
					PROGRAM_ID.toBuffer(),
					mintKeypair.publicKey.toBuffer(),
				],
				PROGRAM_ID,
			)[0],
			mint: mintKeypair.publicKey,
			mintAuthority: payerKeypair.publicKey,
			payer: payerKeypair.publicKey,
			updateAuthority: payerKeypair.publicKey,
		},
		{
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
		},
	);

	const tx = await buildTransaction(
		connection,
		payerKeypair.publicKey,
		[payerKeypair, mintKeypair],
		[
			createMintAccountInstruction,
			initializeMintInstruction,
			createMetadataInstruction,
		],
	);
	const signature = await connection.sendTransaction(tx);

	newLogSection();
	await logTransaction(connection, signature);
}

export async function mintNft(
	mintPublicKey: PublicKey,
	mintAuthority: Keypair,
	payerKeypair: Keypair,
	recipientPublicKey: PublicKey,
) {
	newLogSection();
	console.log(`Minting NFT to recipient: ${recipientPublicKey}`);

	const ixList: TransactionInstruction[] = [];
	const associatedTokenAddress = getAssociatedTokenAddressSync(
		mintPublicKey,
		recipientPublicKey,
	);
	console.log(
		`   Recipient Associated Token Address: ${associatedTokenAddress}`,
	);
	const associatedTokenAccountInfo = await connection.getAccountInfo(
		associatedTokenAddress,
	);
	if (!associatedTokenAccountInfo || associatedTokenAccountInfo.lamports === 0) {
		ixList.push(
			createAssociatedTokenAccountInstruction(
				payerKeypair.publicKey,
				associatedTokenAddress,
				recipientPublicKey,
				mintPublicKey,
			),
		);
	}

	ixList.push(
		createMintToInstruction(
			mintPublicKey,
			associatedTokenAddress,
			mintAuthority.publicKey,
			1,
		),
	);

	ixList.push(
		createCreateMasterEditionV3Instruction(
			{
				edition: PublicKey.findProgramAddressSync(
					[
						Buffer.from("metadata"),
						PROGRAM_ID.toBuffer(),
						mintPublicKey.toBuffer(),
						Buffer.from("edition"),
					],
					PROGRAM_ID,
				)[0],
				metadata: PublicKey.findProgramAddressSync(
					[
						Buffer.from("metadata"),
						PROGRAM_ID.toBuffer(),
						mintPublicKey.toBuffer(),
					],
					PROGRAM_ID,
				)[0],
				mint: mintPublicKey,
				mintAuthority: payerKeypair.publicKey,
				payer: payerKeypair.publicKey,
				updateAuthority: payerKeypair.publicKey,
			},
			{
				createMasterEditionArgs: { maxSupply: 1 },
			},
		),
	);

	const tx = await buildTransaction(
		connection,
		payerKeypair.publicKey,
		[mintAuthority, payerKeypair],
		ixList,
	);
	const signature = await connection.sendTransaction(tx);
	await logTransaction(connection, signature);
}

export async function transferNft(
	mintPublicKey: PublicKey,
	payerKeypair: Keypair,
	fromPublicKey: PublicKey,
	toPublicKey: PublicKey,
) {
	const ixList: TransactionInstruction[] = [];

	const fromAtaAddress = getAssociatedTokenAddressSync(mintPublicKey, fromPublicKey);
	const fromAtaAccountInfo = await connection.getAccountInfo(fromAtaAddress);
	if (!fromAtaAccountInfo) {
		throw new Error("Sender's associated token account does not exist");
	}

	const toAtaAddress = getAssociatedTokenAddressSync(mintPublicKey, toPublicKey);
	const toAtaAccountInfo = await connection.getAccountInfo(toAtaAddress);
	if (!toAtaAccountInfo) {
		ixList.push(
			createAssociatedTokenAccountInstruction(
				payerKeypair.publicKey,
				toAtaAddress,
				toPublicKey,
				mintPublicKey,
			)
		);
	}

	ixList.push(
		createTransferInstruction(
			fromAtaAddress,
			toAtaAddress,
			fromPublicKey,
			1 // Transferring one NFT
		)
	);

	const tx = await buildTransaction(
		connection,
		payerKeypair.publicKey,
		[payerKeypair],
		ixList,
	);
	const signature = await connection.sendTransaction(tx);
	newLogSection();
	await logTransaction(connection, signature);
}
