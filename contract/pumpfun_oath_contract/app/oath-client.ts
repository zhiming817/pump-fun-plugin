import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet, Idl } from "@coral-xyz/anchor";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  Connection,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";

export interface CollateralToken {
  symbol: string;
  amount: anchor.BN;
  address: string;
  usdValue: anchor.BN;
  lockedTime: anchor.BN;
}

export interface CreateOathParams {
  content: string;
  category: string;
  categoryId: string;
  startTime: number;
  endTime: number;
  stableCollateral: number;
  collateralTokens: CollateralToken[];
  isOverCollateralized: boolean;
  tokenAddress?: PublicKey;
  targetApy?: number;
}

export interface CompleteOathParams {
  oathId: number;
  evidence: string;
}

export interface SlashOathParams {
  oathId: number;
  reason: string;
  slashedPercentage: number; // 基点 (5000 = 50%)
}

export interface QueryOathsParams {
  offset?: number;
  limit?: number;
  filterByCreator?: PublicKey;
  filterByStatus?: any;
  filterByCategory?: string;
}

export class OathContractClient {
  private program: Program;
  private provider: AnchorProvider;
  private programId: PublicKey;

  constructor(
    connection: Connection,
    wallet: Wallet,
    programId: PublicKey,
    idl?: any
  ) {
    this.provider = new AnchorProvider(connection, wallet, {});
    this.programId = programId;
    
    if (idl) {
      this.program = new Program(idl, this.provider);
    } else {
      // 如果没有提供 IDL，则在运行时加载
      this.program = anchor.workspace.PumpfunOathContract as Program;
    }
  }

  /**
   * 获取全局状态 PDA
   */
  async getGlobalStatePda(): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from("global_state")],
      this.program.programId
    );
  }

  /**
   * 获取抵押池 PDA
   */
  async getCollateralPoolPda(): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from("collateral_pool")],
      this.program.programId
    );
  }

  /**
   * 获取誓言 PDA
   */
  async getOathPda(oathId: number): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from("oath"), new anchor.BN(oathId).toArrayLike(Buffer, "le", 8)],
      this.program.programId
    );
  }

  /**
   * 获取用户抵押 PDA
   */
  async getUserCollateralPda(user: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from("user_collateral"), user.toBuffer()],
      this.program.programId
    );
  }

  /**
   * 初始化合约
   */
  async initialize(): Promise<string> {
    const [globalStatePda] = await this.getGlobalStatePda();
    const [collateralPoolPda] = await this.getCollateralPoolPda();

    const tx = await this.program.methods
      .initialize()
      .accounts({
        globalState: globalStatePda,
        collateralPool: collateralPoolPda,
        authority: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * 创建誓言
   */
  async createOath(params: CreateOathParams): Promise<string> {
    const [globalStatePda] = await this.getGlobalStatePda();
    const [collateralPoolPda] = await this.getCollateralPoolPda();
    
    // 获取下一个誓言ID
    const globalState = await (this.program.account as any).globalState.fetch(globalStatePda);
    const oathId = globalState.nextOathId.toNumber();
    
    const [oathPda] = await this.getOathPda(oathId);
    const [userCollateralPda] = await this.getUserCollateralPda(this.provider.wallet.publicKey);

    const createOathArgs = {
      content: params.content,
      category: params.category,
      categoryId: params.categoryId,
      startTime: new anchor.BN(params.startTime),
      endTime: new anchor.BN(params.endTime),
      stableCollateral: new anchor.BN(params.stableCollateral),
      collateralTokens: params.collateralTokens,
      isOverCollateralized: params.isOverCollateralized,
      tokenAddress: params.tokenAddress || null,
      targetApy: params.targetApy ? new anchor.BN(params.targetApy) : null,
    };

    const tx = await this.program.methods
      .createOath(createOathArgs)
      .accounts({
        globalState: globalStatePda,
        oath: oathPda,
        userCollateral: userCollateralPda,
        collateralPool: collateralPoolPda,
        creator: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * 完成誓言
   */
  async completeOath(params: CompleteOathParams): Promise<string> {
    const [globalStatePda] = await this.getGlobalStatePda();
    const [collateralPoolPda] = await this.getCollateralPoolPda();
    const [oathPda] = await this.getOathPda(params.oathId);
    const [userCollateralPda] = await this.getUserCollateralPda(this.provider.wallet.publicKey);

    const completeOathArgs = {
      evidence: params.evidence,
    };

    const tx = await this.program.methods
      .completeOath(completeOathArgs)
      .accounts({
        oath: oathPda,
        userCollateral: userCollateralPda,
        globalState: globalStatePda,
        collateralPool: collateralPoolPda,
        creator: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * 削减誓言 (仅管理员)
   */
  async slashOath(params: SlashOathParams): Promise<string> {
    const [globalStatePda] = await this.getGlobalStatePda();
    const [collateralPoolPda] = await this.getCollateralPoolPda();
    const [oathPda] = await this.getOathPda(params.oathId);
    
    // 获取誓言信息以确定创建者
    const oath = await (this.program.account as any).oath.fetch(oathPda);
    const [userCollateralPda] = await this.getUserCollateralPda(oath.creator);

    const slashOathArgs = {
      reason: params.reason,
      slashedPercentage: new anchor.BN(params.slashedPercentage),
    };

    const tx = await this.program.methods
      .slashOath(slashOathArgs)
      .accounts({
        oath: oathPda,
        userCollateral: userCollateralPda,
        globalState: globalStatePda,
        collateralPool: collateralPoolPda,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * 查询誓言列表
   */
  async queryOaths(params: QueryOathsParams = {}): Promise<string> {
    const [globalStatePda] = await this.getGlobalStatePda();

    const getOathListArgs = {
      offset: new anchor.BN(params.offset || 0),
      limit: new anchor.BN(params.limit || 10),
      filterByCreator: params.filterByCreator || null,
      filterByStatus: params.filterByStatus || null,
      filterByCategory: params.filterByCategory || null,
    };

    const tx = await this.program.methods
      .getOathList(getOathListArgs)
      .accounts({
        globalState: globalStatePda,
      })
      .rpc();

    return tx;
  }

  /**
   * 获取誓言信息
   */
  async getOath(oathId: number): Promise<any> {
    const [oathPda] = await this.getOathPda(oathId);
    return await (this.program.account as any).oath.fetch(oathPda);
  }

  /**
   * 获取用户抵押信息
   */
  async getUserCollateral(user: PublicKey): Promise<any> {
    const [userCollateralPda] = await this.getUserCollateralPda(user);
    return await (this.program.account as any).userCollateral.fetch(userCollateralPda);
  }

  /**
   * 获取全局状态信息
   */
  async getGlobalState(): Promise<any> {
    const [globalStatePda] = await this.getGlobalStatePda();
    return await (this.program.account as any).globalState.fetch(globalStatePda);
  }

  /**
   * 获取抵押池信息
   */
  async getCollateralPool(): Promise<any> {
    const [collateralPoolPda] = await this.getCollateralPoolPda();
    return await (this.program.account as any).collateralPool.fetch(collateralPoolPda);
  }

  /**
   * 获取所有誓言 (通过RPC调用)
   */
  async getAllOaths(): Promise<any[]> {
    return await (this.program.account as any).oath.all();
  }

  /**
   * 根据创建者获取誓言
   */
  async getOathsByCreator(creator: PublicKey): Promise<any[]> {
    return await (this.program.account as any).oath.all([
      {
        memcmp: {
          offset: 8 + 8, // discriminator + id
          bytes: creator.toBase58(),
        },
      },
    ]);
  }
}

// 导出类型和客户端
export { OathContractClient as default };