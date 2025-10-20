/**
 * 检查交易状态和誓言账户
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PumpfunOathContract } from "../target/types/pumpfun_oath_contract";
import { PublicKey, Connection } from "@solana/web3.js";
import * as fs from "fs";

async function main() {
  const txSignature = "3Csk2xALf8isatRHX7bEFTS77AM3ogSHwMJs1ra9hcWpeRWu5Yv2sTk1AjtAYfgcGRLpCxCRTXxyY3ekb8XUGR1T";
  
  // 连接到 Devnet
  const connection = new Connection("https://api.zan.top/node/v1/solana/devnet/55c625d41c924f97971cdd05bb533048", "confirmed");
  
  console.log("🔍 检查交易状态...");
  console.log("交易签名:", txSignature);
  console.log("🔗 浏览器链接: https://explorer.solana.com/tx/" + txSignature + "?cluster=devnet");
  
  try {
    const txStatus = await connection.getSignatureStatus(txSignature);
    console.log("\n交易状态:", JSON.stringify(txStatus, null, 2));
    
    if (txStatus.value?.confirmationStatus) {
      console.log("✅ 交易已确认:", txStatus.value.confirmationStatus);
      
      if (txStatus.value.err) {
        console.log("❌ 交易失败:", txStatus.value.err);
      } else {
        console.log("✅ 交易成功！");
      }
    } else {
      console.log("⏳ 交易未找到或未确认");
    }
  } catch (error) {
    console.error("检查交易状态失败:", error);
  }

  // 检查誓言账户
  console.log("\n🔍 检查誓言账户...");
  
  const programId = new PublicKey("Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ");
  const idl = JSON.parse(
    fs.readFileSync("./target/idl/pumpfun_oath_contract.json", "utf-8")
  );
  
  const wallet = new anchor.Wallet(anchor.web3.Keypair.generate());
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const program = new Program(idl, provider) as Program<PumpfunOathContract>;
  
  const [globalStatePda] = await PublicKey.findProgramAddress(
    [Buffer.from("global_state")],
    program.programId
  );
  
  const globalState = await program.account.globalState.fetch(globalStatePda);
  console.log("✓ Next Oath ID:", globalState.nextOathId.toString());
  console.log("✓ Total Oaths:", globalState.totalOaths.toString());
  
  // 尝试获取誓言 ID 3 的账户
  const oathId = new anchor.BN(3);
  const [oathPda] = await PublicKey.findProgramAddress(
    [Buffer.from("oath"), oathId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  
  console.log("\n检查 Oath ID 3:", oathPda.toBase58());
  
  try {
    const oathAccount = await program.account.oath.fetch(oathPda);
    console.log("\n✅ 誓言账户存在！");
    console.log("📋 誓言详情:");
    console.log("  ID:", oathAccount.id.toString());
    console.log("  创建者:", oathAccount.creator.toBase58());
    console.log("  内容:", oathAccount.content);
    console.log("  分类:", oathAccount.category);
    console.log("  状态:", JSON.stringify(oathAccount.status));
    console.log("  稳定币抵押:", oathAccount.stableCollateral.toString());
    console.log("  代币抵押数量:", oathAccount.collateralTokens.length);
    console.log("  创建时间:", new Date(oathAccount.createdAt.toNumber() * 1000).toLocaleString());
    console.log("  开始时间:", new Date(oathAccount.startTime.toNumber() * 1000).toLocaleString());
    console.log("  结束时间:", new Date(oathAccount.endTime.toNumber() * 1000).toLocaleString());
  } catch (error) {
    console.log("❌ 誓言账户不存在或获取失败");
    console.error(error.message);
  }
  
  // 列出所有誓言 ID
  console.log("\n📜 尝试列出所有誓言账户...");
  const currentNextId = globalState.nextOathId.toNumber();
  
  for (let i = 1; i < currentNextId; i++) {
    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from("oath"), new anchor.BN(i).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    
    try {
      const oath = await program.account.oath.fetch(pda);
      console.log(`  Oath ${i}: ${oath.content.substring(0, 30)}... (${JSON.stringify(oath.status)})`);
    } catch {
      console.log(`  Oath ${i}: 不存在`);
    }
  }
}

main()
  .then(() => {
    console.log("\n✅ 检查完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 检查失败:", error);
    process.exit(1);
  });
