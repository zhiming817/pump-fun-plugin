import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import OathContractClient, { CreateOathParams, CompleteOathParams } from "./oath-client";

// 使用示例
async function example() {
  // 1. 设置连接和钱包
  const connection = new Connection("http://localhost:8899", "processed");
  const wallet = new Wallet(Keypair.generate()); // 在实际应用中使用真实钱包
  const programId = new PublicKey("Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ");

  // 2. 创建客户端实例
  const client = new OathContractClient(connection, wallet, programId);

  try {
    // 3. 初始化合约（仅需执行一次）
    console.log("正在初始化合约...");
    const initTx = await client.initialize();
    console.log("初始化交易签名:", initTx);

    // 4. 创建誓言
    console.log("正在创建誓言...");
    const createOathParams: CreateOathParams = {
      content: "我承诺在30天内学会Solana智能合约开发",
      category: "学习",
      categoryId: "education_001",
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30天后
      stableCollateral: 200, // $200 USD
      collateralTokens: [
        {
          symbol: "USDC",
          amount: new anchor.BN(100 * 1000000), // 100 USDC (6 decimals)
          address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          usdValue: new anchor.BN(100),
          lockedTime: new anchor.BN(Math.floor(Date.now() / 1000))
        }
      ],
      isOverCollateralized: true,
      targetApy: 1500 // 15% APY
    };

    const createTx = await client.createOath(createOathParams);
    console.log("创建誓言交易签名:", createTx);

    // 5. 查询全局状态
    console.log("正在查询全局状态...");
    const globalState = await client.getGlobalState();
    console.log("全局状态:", {
      authority: globalState.authority.toString(),
      nextOathId: globalState.nextOathId.toString(),
      totalOaths: globalState.totalOaths.toString(),
      totalCollateral: globalState.totalCollateral.toString(),
      isPaused: globalState.isPaused
    });

    // 6. 查询指定誓言
    console.log("正在查询誓言信息...");
    const oath = await client.getOath(1);
    console.log("誓言信息:", {
      id: oath.id.toString(),
      creator: oath.creator.toString(),
      content: oath.content,
      category: oath.category,
      status: oath.status,
      stableCollateral: oath.stableCollateral.toString(),
      collateralTokensCount: oath.collateralTokens.length
    });

    // 7. 完成誓言（提供证据）
    console.log("正在完成誓言...");
    const completeParams: CompleteOathParams = {
      oathId: 1,
      evidence: "已完成Solana智能合约开发学习，并成功部署了第一个合约到测试网。项目地址：https://github.com/example/my-solana-contract"
    };

    const completeTx = await client.completeOath(completeParams);
    console.log("完成誓言交易签名:", completeTx);

    // 8. 查询完成后的誓言状态
    const completedOath = await client.getOath(1);
    console.log("完成后的誓言状态:", {
      status: completedOath.status,
      evidence: completedOath.evidence
    });

    // 9. 查询用户抵押信息
    const userCollateral = await client.getUserCollateral(wallet.publicKey);
    console.log("用户抵押信息:", {
      totalCollateralValue: userCollateral.totalCollateralValue.toString(),
      activeOaths: userCollateral.activeOaths.map((id: any) => id.toString()),
      totalSlashed: userCollateral.totalSlashed.toString()
    });

  } catch (error) {
    console.error("执行过程中发生错误:", error);
  }
}

// 管理员功能示例
async function adminExample() {
  const connection = new Connection("http://localhost:8899", "processed");
  const adminWallet = new Wallet(Keypair.generate()); // 管理员钱包
  const programId = new PublicKey("Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ");

  const client = new OathContractClient(connection, adminWallet, programId);

  try {
    // 削减违约的誓言
    console.log("管理员正在削减违约誓言...");
    const slashTx = await client.slashOath({
      oathId: 2,
      reason: "用户未能在承诺时间内完成学习目标，且未提供有效证据",
      slashedPercentage: 5000 // 50%
    });
    console.log("削减交易签名:", slashTx);

    // 查询被削减的誓言
    const slashedOath = await client.getOath(2);
    console.log("被削减的誓言信息:", {
      status: slashedOath.status,
      slashingInfo: slashedOath.slashingInfo
    });

  } catch (error) {
    console.error("管理员操作发生错误:", error);
  }
}

// 查询功能示例
async function queryExample() {
  const connection = new Connection("http://localhost:8899", "processed");
  const wallet = new Wallet(Keypair.generate());
  const programId = new PublicKey("Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ");

  const client = new OathContractClient(connection, wallet, programId);

  try {
    // 查询所有誓言
    console.log("正在查询所有誓言...");
    const allOaths = await client.getAllOaths();
    console.log(`找到 ${allOaths.length} 个誓言`);

    allOaths.forEach((oath, index) => {
      console.log(`誓言 ${index + 1}:`, {
        id: oath.account.id.toString(),
        creator: oath.account.creator.toString(),
        content: oath.account.content.substring(0, 50) + "...",
        status: oath.account.status
      });
    });

    // 查询特定用户的誓言
    const userOaths = await client.getOathsByCreator(wallet.publicKey);
    console.log(`用户 ${wallet.publicKey.toString()} 有 ${userOaths.length} 个誓言`);

    // 查询抵押池信息
    const collateralPool = await client.getCollateralPool();
    console.log("抵押池信息:", {
      totalStableCollateral: collateralPool.totalStableCollateral.toString(),
      totalTokenCollateral: collateralPool.totalTokenCollateral.toString(),
      supportedTokensCount: collateralPool.supportedTokens.length
    });

  } catch (error) {
    console.error("查询过程中发生错误:", error);
  }
}

// 导出示例函数
export { example, adminExample, queryExample };