import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PumpfunOathContract } from "../target/types/pumpfun_oath_contract";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("pumpfun_oath_contract", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PumpfunOathContract as Program<PumpfunOathContract>;
  
  // Test accounts
  const authority = provider.wallet as anchor.Wallet;
  let globalStatePda: PublicKey;
  let collateralPoolPda: PublicKey;
  let globalStateBump: number;
  let collateralPoolBump: number;

  before(async () => {
    // Derive PDAs
    [globalStatePda, globalStateBump] = await PublicKey.findProgramAddress(
      [Buffer.from("global_state")],
      program.programId
    );

    [collateralPoolPda, collateralPoolBump] = await PublicKey.findProgramAddress(
      [Buffer.from("collateral_pool")],
      program.programId
    );
  });

  it("Is initialized!", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        globalState: globalStatePda,
        collateralPool: collateralPoolPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize transaction signature", tx);

    // Verify global state
    const globalStateAccount = await program.account.globalState.fetch(globalStatePda);
    expect(globalStateAccount.authority.toString()).to.equal(authority.publicKey.toString());
    expect(globalStateAccount.nextOathId.toString()).to.equal("1");
    expect(globalStateAccount.totalOaths.toString()).to.equal("0");
    expect(globalStateAccount.totalCollateral.toString()).to.equal("0");
    expect(globalStateAccount.isPaused).to.be.false;
  });

  it("Creates an oath", async () => {
    const creator = Keypair.generate();
    
    // Airdrop SOL to creator
    const signature = await provider.connection.requestAirdrop(
      creator.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    const oathId = 1;
    const [oathPda] = await PublicKey.findProgramAddress(
      [Buffer.from("oath"), new anchor.BN(oathId).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [userCollateralPda] = await PublicKey.findProgramAddress(
      [Buffer.from("user_collateral"), creator.publicKey.toBuffer()],
      program.programId
    );

    const currentTime = Math.floor(Date.now() / 1000);
    const createOathArgs = {
      content: "I will learn Solana development",
      category: "Education",
      categoryId: "edu_001",
      startTime: new anchor.BN(currentTime),
      endTime: new anchor.BN(currentTime + 86400), // 24 hours
      stableCollateral: new anchor.BN(150), // $150 USD
      collateralTokens: [
        {
          symbol: "USDC",
          amount: new anchor.BN(50 * 1000000), // 50 USDC (6 decimals)
          address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          usdValue: new anchor.BN(50),
          lockedTime: new anchor.BN(currentTime)
        }
      ],
      isOverCollateralized: true,
      tokenAddress: null,
      targetApy: new anchor.BN(1200) // 12% APY
    };

    const tx = await program.methods
      .createOath(createOathArgs)
      .accounts({
        globalState: globalStatePda,
        oath: oathPda,
        userCollateral: userCollateralPda,
        collateralPool: collateralPoolPda,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    console.log("Create oath transaction signature", tx);

    // Verify oath creation
    const oathAccount = await program.account.oath.fetch(oathPda);
    expect(oathAccount.id.toString()).to.equal("1");
    expect(oathAccount.creator.toString()).to.equal(creator.publicKey.toString());
    expect(oathAccount.content).to.equal("I will learn Solana development");
    expect(oathAccount.category).to.equal("Education");
    expect(oathAccount.stableCollateral.toString()).to.equal("150");
    expect(oathAccount.status).to.deep.equal({ active: {} });

    // Verify global state update
    const updatedGlobalState = await program.account.globalState.fetch(globalStatePda);
    expect(updatedGlobalState.nextOathId.toString()).to.equal("2");
    expect(updatedGlobalState.totalOaths.toString()).to.equal("1");
    expect(updatedGlobalState.totalCollateral.toString()).to.equal("200"); // 150 + 50
  });

  it("Completes an oath", async () => {
    const creator = Keypair.generate();
    
    // Airdrop SOL to creator
    const signature = await provider.connection.requestAirdrop(
      creator.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // First create an oath
    const oathId = 2;
    const [oathPda] = await PublicKey.findProgramAddress(
      [Buffer.from("oath"), new anchor.BN(oathId).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [userCollateralPda] = await PublicKey.findProgramAddress(
      [Buffer.from("user_collateral"), creator.publicKey.toBuffer()],
      program.programId
    );

    const currentTime = Math.floor(Date.now() / 1000);
    const createOathArgs = {
      content: "I will complete this test",
      category: "Testing",
      categoryId: "test_001",
      startTime: new anchor.BN(currentTime),
      endTime: new anchor.BN(currentTime + 86400),
      stableCollateral: new anchor.BN(100),
      collateralTokens: [],
      isOverCollateralized: false,
      tokenAddress: null,
      targetApy: null
    };

    await program.methods
      .createOath(createOathArgs)
      .accounts({
        globalState: globalStatePda,
        oath: oathPda,
        userCollateral: userCollateralPda,
        collateralPool: collateralPoolPda,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    // Now complete the oath
    const completeOathArgs = {
      evidence: "Test completed successfully with all assertions passing"
    };

    const completeTx = await program.methods
      .completeOath(completeOathArgs)
      .accounts({
        oath: oathPda,
        userCollateral: userCollateralPda,
        globalState: globalStatePda,
        collateralPool: collateralPoolPda,
        creator: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    console.log("Complete oath transaction signature", completeTx);

    // Verify oath completion
    const completedOath = await program.account.oath.fetch(oathPda);
    expect(completedOath.status).to.deep.equal({ completed: {} });
    expect(completedOath.evidence).to.equal("Test completed successfully with all assertions passing");
  });

  it("Queries oath list", async () => {
    const getOathListArgs = {
      offset: new anchor.BN(0),
      limit: new anchor.BN(10),
      filterByCreator: null,
      filterByStatus: null,
      filterByCategory: null
    };

    const tx = await program.methods
      .getOathList(getOathListArgs)
      .accounts({
        globalState: globalStatePda,
      })
      .rpc();

    console.log("Get oath list transaction signature", tx);
  });

  it("Slashes an oath (authority only)", async () => {
    const creator = Keypair.generate();
    
    // Airdrop SOL to creator
    const signature = await provider.connection.requestAirdrop(
      creator.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Create an oath to slash
    const oathId = 3;
    const [oathPda] = await PublicKey.findProgramAddress(
      [Buffer.from("oath"), new anchor.BN(oathId).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [userCollateralPda] = await PublicKey.findProgramAddress(
      [Buffer.from("user_collateral"), creator.publicKey.toBuffer()],
      program.programId
    );

    const currentTime = Math.floor(Date.now() / 1000);
    const createOathArgs = {
      content: "I will fail this oath",
      category: "Testing",
      categoryId: "test_002",
      startTime: new anchor.BN(currentTime),
      endTime: new anchor.BN(currentTime + 86400),
      stableCollateral: new anchor.BN(200),
      collateralTokens: [],
      isOverCollateralized: false,
      tokenAddress: null,
      targetApy: null
    };

    await program.methods
      .createOath(createOathArgs)
      .accounts({
        globalState: globalStatePda,
        oath: oathPda,
        userCollateral: userCollateralPda,
        collateralPool: collateralPoolPda,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    // Slash the oath
    const slashOathArgs = {
      reason: "Failed to meet oath requirements",
      slashedPercentage: new anchor.BN(5000) // 50%
    };

    const slashTx = await program.methods
      .slashOath(slashOathArgs)
      .accounts({
        oath: oathPda,
        userCollateral: userCollateralPda,
        globalState: globalStatePda,
        collateralPool: collateralPoolPda,
        authority: authority.publicKey,
      })
      .rpc();

    console.log("Slash oath transaction signature", slashTx);

    // Verify oath was slashed
    const slashedOath = await program.account.oath.fetch(oathPda);
    expect(slashedOath.status).to.deep.equal({ failed: {} });
    expect(slashedOath.slashingInfo).to.not.be.null;
    expect(slashedOath.slashingInfo.reason).to.equal("Failed to meet oath requirements");
    expect(slashedOath.slashingInfo.slashedAmount.toString()).to.equal("100"); // 50% of 200
  });
});
