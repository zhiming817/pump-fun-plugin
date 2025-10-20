/**
 * 手动创建誓言测试脚本
 * 使用本地私钥文件
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PumpfunOathContract } from "../target/types/pumpfun_oath_contract";
import { PublicKey, Keypair, SystemProgram, Connection } from "@solana/web3.js";
import * as fs from "fs";

async function main() {
  // 读取私钥文件
  console.log("📖 读取私钥文件...");
  const keypairFile = fs.readFileSync(
    "/Users/zhaozhiming/.config/solana/id.json",
    "utf-8"
  );
  const secretKey = Uint8Array.from(JSON.parse(keypairFile));
  const creator = Keypair.fromSecretKey(secretKey);
  
  console.log("✓ 创建者公钥:", creator.publicKey.toBase58());
  //address 
  

  // 连接到 Devnet (使用多个备用 RPC)
  const rpcEndpoints = [
    "https://api.zan.top/node/v1/solana/devnet/55c625d41c924f97971cdd05bb533048",
  ];
  
  let connection: Connection | null = null;
  for (const endpoint of rpcEndpoints) {
    try {
      console.log(`尝试连接到: ${endpoint}`);
      const testConnection = new Connection(endpoint, "confirmed");
      await testConnection.getLatestBlockhash();
      connection = testConnection;
      console.log("✓ 连接成功");
      break;
    } catch (err) {
      console.log(`✗ 连接失败，尝试下一个...`);
    }
  }
  
  if (!connection) {
    throw new Error("无法连接到任何 Devnet RPC 端点");
  }
  
  // 检查余额
  const balance = await connection.getBalance(creator.publicKey);
  console.log("✓ 账户余额:", balance / anchor.web3.LAMPORTS_PER_SOL, "SOL");
  
  if (balance < 0.1 * anchor.web3.LAMPORTS_PER_SOL) {
    console.log("⚠️  余额不足，正在空投...");
    const airdropSignature = await connection.requestAirdrop(
      creator.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    console.log("✓ 空投成功");
  }

  // 设置 Provider
  const wallet = new anchor.Wallet(creator);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // 加载程序
  const programId = new PublicKey("Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ");
  const idl = JSON.parse(
    fs.readFileSync("./target/idl/pumpfun_oath_contract.json", "utf-8")
  );
  const program = new Program(idl, provider) as Program<PumpfunOathContract>;
  
  console.log("✓ 程序 ID:", program.programId.toBase58());

  // 派生 PDAs
  console.log("\n📍 派生 PDA 账户...");
  const [globalStatePda] = await PublicKey.findProgramAddress(
    [Buffer.from("global_state")],
    program.programId
  );
  console.log("✓ Global State PDA:", globalStatePda.toBase58());

  const [collateralPoolPda] = await PublicKey.findProgramAddress(
    [Buffer.from("collateral_pool")],
    program.programId
  );
  console.log("✓ Collateral Pool PDA:", collateralPoolPda.toBase58());

  // 获取 next_oath_id
  console.log("\n🔍 查询全局状态...");
  const globalState = await program.account.globalState.fetch(globalStatePda);
  const nextOathId = globalState.nextOathId;
  console.log("✓ Next Oath ID:", nextOathId.toString());
  console.log("✓ Total Oaths:", globalState.totalOaths.toString());
  console.log("✓ Authority:", globalState.authority.toBase58());

  // 派生 oath PDA
  const [oathPda] = await PublicKey.findProgramAddress(
    [Buffer.from("oath"), nextOathId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  console.log("✓ Oath PDA:", oathPda.toBase58());

  // 准备创建誓言参数
  const currentTime = Math.floor(Date.now() / 1000);
  const createOathArgs = {
    content: "我将在2025年完成 Solana 开发学习",
    category: "学习",
    categoryId: "learning_001",
    startTime: new anchor.BN(currentTime),
    endTime: new anchor.BN(currentTime + 30 * 86400), // 30 天
    stableCollateral: new anchor.BN(1), // $100 USD 等值
    collateralTokens: [
      {
        symbol: "USDC",
        amount: new anchor.BN(1 * 1000000), // 0.5 SOL
         address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Native SOL
        usdValue: new anchor.BN(50), // $50 USD
        lockedTime: new anchor.BN(currentTime)
      }
    ],
    isOverCollateralized: true,
    tokenAddress: null,
    targetApy: new anchor.BN(1000) // 10% APY
  };

  console.log("\n📝 创建誓言参数:");
  console.log("  内容:", createOathArgs.content);
  console.log("  分类:", createOathArgs.category);
  console.log("  开始时间:", new Date(currentTime * 1000).toLocaleString());
  console.log("  结束时间:", new Date((currentTime + 30 * 86400) * 1000).toLocaleString());
  console.log("  稳定币抵押:", createOathArgs.stableCollateral.toString(), "USD");
  console.log("  代币抵押:", createOathArgs.collateralTokens.length, "种");

  // 创建誓言
  console.log("\n🚀 发送创建誓言交易...");
  try {
    const tx = await program.methods
      .createOath(createOathArgs)
      .accountsPartial({
        globalState: globalStatePda,
        oath: oathPda,
        collateralPool: collateralPoolPda,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    console.log("✅ 创建誓言成功！");
    console.log("📝 交易签名:", tx);
    console.log("🔗 查看交易: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");

    // 验证誓言创建
    console.log("\n🔍 验证誓言账户...");
    const oathAccount = await program.account.oath.fetch(oathPda);
    console.log("✓ Oath ID:", oathAccount.id.toString());
    console.log("✓ 创建者:", oathAccount.creator.toBase58());
    console.log("✓ 内容:", oathAccount.content);
    console.log("✓ 分类:", oathAccount.category);
    console.log("✓ 状态:", JSON.stringify(oathAccount.status));
    console.log("✓ 抵押金额:", oathAccount.stableCollateral.toString());

    // 查看更新后的全局状态
    const updatedGlobalState = await program.account.globalState.fetch(globalStatePda);
    console.log("\n📊 全局状态更新:");
    console.log("✓ Next Oath ID:", updatedGlobalState.nextOathId.toString());
    console.log("✓ Total Oaths:", updatedGlobalState.totalOaths.toString());
    console.log("✓ Total Collateral:", updatedGlobalState.totalCollateral.toString());

  } catch (error) {
    console.error("❌ 创建誓言失败:", error);
    if (error.logs) {
      console.error("程序日志:", error.logs);
    }
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ 脚本执行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 脚本执行失败:", error);
    process.exit(1);
  });
