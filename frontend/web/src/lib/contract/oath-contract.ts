/**
 * PumpFun Oath 智能合约交互类
 */

import {
  Connection,
  PublicKey,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';
import {
  PROGRAM_ID,
  SEEDS,
  CreateOathArgs,
  CompleteOathArgs,
  SlashOathArgs,
  Oath,
  GlobalState,
  CollateralPool,
} from './types';

export class OathContract {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * 获取 GlobalState PDA
   */
  static getGlobalStatePDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.GLOBAL_STATE],
      PROGRAM_ID
    );
  }

  /**
   * 获取 CollateralPool PDA
   */
  static getCollateralPoolPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.COLLATERAL_POOL],
      PROGRAM_ID
    );
  }

  /**
   * 获取 Oath PDA
   */
  static getOathPDA(oathId: bigint): [PublicKey, number] {
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64LE(oathId);
    return PublicKey.findProgramAddressSync(
      [SEEDS.OATH, buffer],
      PROGRAM_ID
    );
  }

  /**
   * 初始化合约
   */
  async initialize(authority: PublicKey): Promise<TransactionInstruction> {
    const [globalState] = OathContract.getGlobalStatePDA();
    const [collateralPool] = OathContract.getCollateralPoolPDA();

    // 构建初始化指令
    // 实际使用时需要使用 Program 的方法构建
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: globalState, isSigner: false, isWritable: true },
        { pubkey: collateralPool, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: Buffer.from([]), // 需要序列化指令数据
    });

    return instruction;
  }

  /**
   * 创建誓言
   */
  async createOath(
    creator: PublicKey,
    _args: CreateOathArgs
  ): Promise<TransactionInstruction> {
    const [globalState] = OathContract.getGlobalStatePDA();
    const [collateralPool] = OathContract.getCollateralPoolPDA();

    // 获取 next_oath_id
    const globalStateAccount = await this.connection.getAccountInfo(globalState);
    if (!globalStateAccount) {
      throw new Error('Global state not initialized');
    }

    // 解析 globalState 以获取 nextOathId
    // 这里需要根据实际的账户数据结构解析
    const nextOathId = BigInt(0); // 示例值

    const [oath] = OathContract.getOathPDA(nextOathId);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: globalState, isSigner: false, isWritable: true },
        { pubkey: oath, isSigner: false, isWritable: true },
        { pubkey: collateralPool, isSigner: false, isWritable: true },
        { pubkey: creator, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: Buffer.from([]), // 需要序列化 CreateOathArgs
    });

    return instruction;
  }

  /**
   * 完成誓言
   */
  async completeOath(
    oathId: bigint,
    creator: PublicKey,
    _args: CompleteOathArgs
  ): Promise<TransactionInstruction> {
    const [oath] = OathContract.getOathPDA(oathId);
    const [globalState] = OathContract.getGlobalStatePDA();
    const [collateralPool] = OathContract.getCollateralPoolPDA();

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: oath, isSigner: false, isWritable: true },
        { pubkey: globalState, isSigner: false, isWritable: true },
        { pubkey: collateralPool, isSigner: false, isWritable: true },
        { pubkey: creator, isSigner: true, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: Buffer.from([]), // 需要序列化 CompleteOathArgs
    });

    return instruction;
  }

  /**
   * 削减誓言
   */
  async slashOath(
    oathId: bigint,
    authority: PublicKey,
    _args: SlashOathArgs
  ): Promise<TransactionInstruction> {
    const [oath] = OathContract.getOathPDA(oathId);
    const [globalState] = OathContract.getGlobalStatePDA();

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: oath, isSigner: false, isWritable: true },
        { pubkey: globalState, isSigner: false, isWritable: false },
        { pubkey: authority, isSigner: true, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: Buffer.from([]), // 需要序列化 SlashOathArgs
    });

    return instruction;
  }

  /**
   * 查询全局状态
   */
  async getGlobalState(): Promise<GlobalState | null> {
    const [globalStatePDA] = OathContract.getGlobalStatePDA();
    const account = await this.connection.getAccountInfo(globalStatePDA);

    if (!account) {
      return null;
    }

    // 解析账户数据
    // 需要根据实际的数据结构反序列化
    return null; // 示例返回
  }

  /**
   * 查询誓言信息
   */
  async getOath(oathId: bigint): Promise<Oath | null> {
    const [oathPDA] = OathContract.getOathPDA(oathId);
    const account = await this.connection.getAccountInfo(oathPDA);

    if (!account) {
      return null;
    }

    // 解析账户数据
    return null; // 示例返回
  }

  /**
   * 查询抵押池信息
   */
  async getCollateralPool(): Promise<CollateralPool | null> {
    const [collateralPoolPDA] = OathContract.getCollateralPoolPDA();
    const account = await this.connection.getAccountInfo(collateralPoolPDA);

    if (!account) {
      return null;
    }

    // 解析账户数据
    return null; // 示例返回
  }

  /**
   * 获取用户创建的所有誓言
   */
  async getUserOaths(creator: PublicKey): Promise<Oath[]> {
    // 使用 getProgramAccounts 查询所有 Oath 账户
    await this.connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 8 + 8, // discriminator + id
            bytes: creator.toBase58(),
          },
        },
      ],
    });

    // 解析并返回 Oath 数组
    // TODO: 实现账户数据解析
    return []; // 示例返回
  }
}

export default OathContract;
