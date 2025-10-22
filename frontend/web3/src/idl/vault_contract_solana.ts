/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/vault_contract_solana.json`.
 */
export type VaultContractSolana = {
  "address": "HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv",
  "metadata": {
    "name": "vaultContractSolana",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "docs": [
    "Vault Contract Solana 程序",
    "",
    "这是一个 DeFi Vault 智能合约，提供以下功能：",
    "- 初始化全局状态",
    "- 创建 Vault",
    "- 更新 Vault 状态"
  ],
  "instructions": [
    {
      "name": "createVault",
      "docs": [
        "创建新的 Vault",
        "",
        "允许用户创建自定义的 DeFi Vault，包含策略、配置和初始状态"
      ],
      "discriminator": [
        29,
        237,
        247,
        208,
        193,
        82,
        54,
        135
      ],
      "accounts": [
        {
          "name": "vaultGlobal",
          "docs": [
            "Vault 全局状态账户（可变，需要更新计数器）"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "docs": [
            "新创建的 Vault 账户"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault_global.vault_count",
                "account": "vaultGlobal"
              }
            ]
          }
        },
        {
          "name": "creator",
          "docs": [
            "创建者账户（支付账户创建费用）"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "系统程序"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "targetApy",
          "type": "u64"
        },
        {
          "name": "strategy",
          "type": "string"
        },
        {
          "name": "initialDeposit",
          "type": "u64"
        },
        {
          "name": "vaultName",
          "type": "string"
        },
        {
          "name": "vaultSymbol",
          "type": "string"
        },
        {
          "name": "vaultDescription",
          "type": "string"
        },
        {
          "name": "curator",
          "type": "string"
        },
        {
          "name": "timelockDays",
          "type": "u64"
        },
        {
          "name": "guardianOpt",
          "type": "bool"
        },
        {
          "name": "guardianValue",
          "type": "string"
        },
        {
          "name": "feeRate",
          "type": "u64"
        },
        {
          "name": "performanceFee",
          "type": "u64"
        },
        {
          "name": "markets",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "marketAddresses",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "allocationPercentages",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "strategyName",
          "type": "string"
        },
        {
          "name": "strategyDescription",
          "type": "string"
        },
        {
          "name": "riskLevel",
          "type": "u8"
        },
        {
          "name": "supportedTokens",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "strategyType",
          "type": "string"
        },
        {
          "name": "minDuration",
          "type": "u64"
        },
        {
          "name": "maxDuration",
          "type": "u64"
        },
        {
          "name": "autoCompound",
          "type": "bool"
        },
        {
          "name": "emergencyExit",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "初始化 Vault 全局状态",
        "",
        "只能调用一次，用于设置管理员和初始化计数器"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "vaultGlobal",
          "docs": [
            "Vault 全局状态账户"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "管理员账户（支付账户创建费用）"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "系统程序"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updateVaultState",
      "docs": [
        "更新 Vault 状态",
        "",
        "只有 Vault 创建者可以更新状态"
      ],
      "discriminator": [
        6,
        239,
        235,
        198,
        248,
        227,
        17,
        41
      ],
      "accounts": [
        {
          "name": "vault",
          "docs": [
            "Vault 账户（可变，需要更新状态）",
            "必须由创建者签名"
          ],
          "writable": true
        },
        {
          "name": "creator",
          "docs": [
            "创建者账户（必须签名）"
          ],
          "signer": true,
          "relations": [
            "vault"
          ]
        }
      ],
      "args": [
        {
          "name": "newApy",
          "type": "u64"
        },
        {
          "name": "newTotalAssets",
          "type": "u64"
        },
        {
          "name": "newSharePrice",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    },
    {
      "name": "vaultGlobal",
      "discriminator": [
        132,
        178,
        91,
        253,
        135,
        214,
        215,
        45
      ]
    }
  ],
  "events": [
    {
      "name": "vaultCreatedEvent",
      "discriminator": [
        81,
        80,
        244,
        58,
        136,
        54,
        236,
        111
      ]
    }
  ],
  "types": [
    {
      "name": "allocation",
      "docs": [
        "资金分配结构",
        "记录具体市场的资金分配信息"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketAddress",
            "docs": [
              "市场地址"
            ],
            "type": "pubkey"
          },
          {
            "name": "supplyAssets",
            "docs": [
              "投入资产"
            ],
            "type": "u64"
          },
          {
            "name": "supplyAssetsUsd",
            "docs": [
              "投入资产USD价值"
            ],
            "type": "u64"
          },
          {
            "name": "expectedApy",
            "docs": [
              "预期年化收益率"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "marketAllocation",
      "docs": [
        "市场分配结构体",
        "记录 Vault 在各个 DeFi 市场的资金分配比例"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketAddress",
            "docs": [
              "市场合约地址"
            ],
            "type": "string"
          },
          {
            "name": "allocationPercentage",
            "docs": [
              "分配百分比，基点表示 (10000 = 100%)"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vault",
      "docs": [
        "Vault 主结构",
        "包含完整的 Vault 信息"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "docs": [
              "Vault 唯一 ID"
            ],
            "type": "u64"
          },
          {
            "name": "creator",
            "docs": [
              "创建者公钥"
            ],
            "type": "pubkey"
          },
          {
            "name": "strategy",
            "docs": [
              "投资策略"
            ],
            "type": {
              "defined": {
                "name": "vaultStrategy"
              }
            }
          },
          {
            "name": "configuration",
            "docs": [
              "配置信息"
            ],
            "type": {
              "defined": {
                "name": "vaultConfiguration"
              }
            }
          },
          {
            "name": "state",
            "docs": [
              "状态信息"
            ],
            "type": {
              "defined": {
                "name": "vaultState"
              }
            }
          },
          {
            "name": "allocations",
            "docs": [
              "资金分配列表"
            ],
            "type": {
              "vec": {
                "defined": {
                  "name": "allocation"
                }
              }
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "创建时间戳"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vaultConfiguration",
      "docs": [
        "Vault 配置结构",
        "包含 Vault 的基本信息和配置参数"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "docs": [
              "Vault 名称"
            ],
            "type": "string"
          },
          {
            "name": "symbol",
            "docs": [
              "Vault 符号"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "Vault 描述"
            ],
            "type": "string"
          },
          {
            "name": "strategy",
            "docs": [
              "策略名称"
            ],
            "type": "string"
          },
          {
            "name": "curator",
            "docs": [
              "策略管理员"
            ],
            "type": "string"
          },
          {
            "name": "timelock",
            "docs": [
              "时间锁定期（天数）"
            ],
            "type": "u64"
          },
          {
            "name": "guardian",
            "docs": [
              "guardian 选项"
            ],
            "type": {
              "option": "string"
            }
          },
          {
            "name": "feeRate",
            "docs": [
              "费率百分比，基点表示 (100 = 1%)"
            ],
            "type": "u64"
          },
          {
            "name": "performanceFee",
            "docs": [
              "表现费百分比，基点表示 (100 = 1%)"
            ],
            "type": "u64"
          },
          {
            "name": "markets",
            "docs": [
              "市场地址列表"
            ],
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "allocations",
            "docs": [
              "分配比例"
            ],
            "type": {
              "vec": {
                "defined": {
                  "name": "marketAllocation"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "vaultCreatedEvent",
      "docs": [
        "Vault 创建事件",
        "当新的 Vault 被创建时触发"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "docs": [
              "Vault 唯一 ID"
            ],
            "type": "u64"
          },
          {
            "name": "creator",
            "docs": [
              "创建者公钥"
            ],
            "type": "pubkey"
          },
          {
            "name": "name",
            "docs": [
              "Vault 名称"
            ],
            "type": "string"
          },
          {
            "name": "symbol",
            "docs": [
              "Vault 符号"
            ],
            "type": "string"
          },
          {
            "name": "targetApy",
            "docs": [
              "目标年化收益率"
            ],
            "type": "u64"
          },
          {
            "name": "initialDeposit",
            "docs": [
              "初始存款"
            ],
            "type": "u64"
          },
          {
            "name": "strategyType",
            "docs": [
              "策略类型"
            ],
            "type": "string"
          },
          {
            "name": "riskLevel",
            "docs": [
              "风险等级"
            ],
            "type": "u8"
          },
          {
            "name": "createdAt",
            "docs": [
              "创建时间戳"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "vaultGlobal",
      "docs": [
        "Vault 全局状态",
        "用于跟踪所有 Vault 的计数和管理员权限"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "管理员公钥"
            ],
            "type": "pubkey"
          },
          {
            "name": "vaultCount",
            "docs": [
              "Vault 计数器，用于生成唯一 ID"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vaultState",
      "docs": [
        "Vault 状态结构",
        "记录 Vault 的实时状态信息"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "apy",
            "docs": [
              "目标年化收益率 (基点表示, 6630 = 6.63%)"
            ],
            "type": "u64"
          },
          {
            "name": "currentApy",
            "docs": [
              "当前年化收益率 (基点表示, 6630 = 6.63%)"
            ],
            "type": "u64"
          },
          {
            "name": "totalAssets",
            "docs": [
              "总资产数量"
            ],
            "type": "u64"
          },
          {
            "name": "totalAssetsUsd",
            "docs": [
              "总资产USD价值"
            ],
            "type": "u64"
          },
          {
            "name": "totalSupply",
            "docs": [
              "总份额"
            ],
            "type": "u64"
          },
          {
            "name": "sharePrice",
            "docs": [
              "份额价格（精度为6位小数）"
            ],
            "type": "u64"
          },
          {
            "name": "performanceFeeCollected",
            "docs": [
              "已收取的表现费"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vaultStrategy",
      "docs": [
        "Vault 投资策略结构体",
        "定义 Vault 的投资策略和风险参数"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "docs": [
              "策略名称"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "策略描述"
            ],
            "type": "string"
          },
          {
            "name": "riskLevel",
            "docs": [
              "风险等级 (0-低风险, 1-中风险, 2-高风险)"
            ],
            "type": "u8"
          },
          {
            "name": "supportedTokens",
            "docs": [
              "支持的代币列表"
            ],
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "strategyType",
            "docs": [
              "策略类型 (defi, arbitrage, yield_farming 等)"
            ],
            "type": "string"
          },
          {
            "name": "minDuration",
            "docs": [
              "最小投资期限（天数）"
            ],
            "type": "u64"
          },
          {
            "name": "maxDuration",
            "docs": [
              "最大投资期限（天数）"
            ],
            "type": "u64"
          },
          {
            "name": "autoCompound",
            "docs": [
              "是否自动复投"
            ],
            "type": "bool"
          },
          {
            "name": "emergencyExit",
            "docs": [
              "是否支持紧急退出"
            ],
            "type": "bool"
          }
        ]
      }
    }
  ]
};