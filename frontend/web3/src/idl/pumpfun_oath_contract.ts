/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pumpfun_oath_contract.json`.
 */
export type PumpfunOathContract = {
  "address": "Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ",
  "metadata": {
    "name": "pumpfunOathContract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "completeOath",
      "docs": [
        "完成誓言"
      ],
      "discriminator": [
        49,
        230,
        35,
        247,
        153,
        202,
        176,
        116
      ],
      "accounts": [
        {
          "name": "oath",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  97,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "oath.id",
                "account": "oath"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "collateralPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  97,
                  116,
                  101,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "completeOathArgs"
            }
          }
        }
      ]
    },
    {
      "name": "createOath",
      "docs": [
        "创建誓言"
      ],
      "discriminator": [
        18,
        53,
        143,
        138,
        106,
        66,
        255,
        195
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "oath",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  97,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "global_state.next_oath_id",
                "account": "globalState"
              }
            ]
          }
        },
        {
          "name": "collateralPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  97,
                  116,
                  101,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "createOathArgs"
            }
          }
        }
      ]
    },
    {
      "name": "getOathList",
      "docs": [
        "获取誓言列表（验证查询参数）"
      ],
      "discriminator": [
        199,
        131,
        107,
        168,
        228,
        95,
        200,
        128
      ],
      "accounts": [
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "getOathListArgs"
            }
          }
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "初始化合约"
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
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "collateralPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  97,
                  116,
                  101,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "slashOath",
      "docs": [
        "削减誓言（管理员功能）"
      ],
      "discriminator": [
        211,
        115,
        8,
        55,
        131,
        55,
        255,
        7
      ],
      "accounts": [
        {
          "name": "oath",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  97,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "oath.id",
                "account": "oath"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "collateralPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  97,
                  116,
                  101,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "slashOathArgs"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "collateralPool",
      "discriminator": [
        186,
        4,
        253,
        240,
        93,
        243,
        212,
        195
      ]
    },
    {
      "name": "globalState",
      "discriminator": [
        163,
        46,
        74,
        168,
        216,
        123,
        133,
        98
      ]
    },
    {
      "name": "oath",
      "discriminator": [
        222,
        97,
        48,
        50,
        185,
        60,
        175,
        24
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "contractPaused",
      "msg": "Contract is paused"
    },
    {
      "code": 6001,
      "name": "invalidStartTime",
      "msg": "Invalid start time"
    },
    {
      "code": 6002,
      "name": "invalidEndTime",
      "msg": "Invalid end time"
    },
    {
      "code": 6003,
      "name": "contentTooLong",
      "msg": "Content too long"
    },
    {
      "code": 6004,
      "name": "categoryTooLong",
      "msg": "Category too long"
    },
    {
      "code": 6005,
      "name": "tooManyTokens",
      "msg": "Too many tokens"
    },
    {
      "code": 6006,
      "name": "insufficientCollateral",
      "msg": "Insufficient collateral"
    },
    {
      "code": 6007,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6008,
      "name": "oathNotFound",
      "msg": "Oath not found"
    },
    {
      "code": 6009,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6010,
      "name": "oathAlreadyCompleted",
      "msg": "Oath already completed"
    },
    {
      "code": 6011,
      "name": "oathExpired",
      "msg": "Oath expired"
    },
    {
      "code": 6012,
      "name": "invalidEvidence",
      "msg": "Invalid evidence"
    },
    {
      "code": 6013,
      "name": "invalidLimit",
      "msg": "Invalid limit"
    },
    {
      "code": 6014,
      "name": "invalidOffset",
      "msg": "Invalid offset"
    },
    {
      "code": 6015,
      "name": "invalidAddress",
      "msg": "Invalid address"
    }
  ],
  "types": [
    {
      "name": "collateralPool",
      "docs": [
        "抵押池账户",
        "用于管理所有抵押资产"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "totalStableCollateral",
            "type": "u64"
          },
          {
            "name": "totalTokenCollateral",
            "type": "u64"
          },
          {
            "name": "supportedTokens",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "compensationInfo",
      "docs": [
        "补偿信息结构体",
        "当系统需要补偿用户时记录相关信息"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "compensationAmount",
            "type": "u64"
          },
          {
            "name": "compensationTime",
            "type": "u64"
          },
          {
            "name": "compensatedTo",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "completeOathArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "evidence",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "createOathArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "endTime",
            "type": "u64"
          },
          {
            "name": "solCollateral",
            "type": "u64"
          },
          {
            "name": "tokenAddress",
            "type": "pubkey"
          },
          {
            "name": "targetMarketCap",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "getOathListArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offset",
            "type": "u64"
          },
          {
            "name": "limit",
            "type": "u64"
          },
          {
            "name": "filterByCreator",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "filterByStatus",
            "type": {
              "option": {
                "defined": {
                  "name": "oathStatus"
                }
              }
            }
          },
          {
            "name": "filterByCategory",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "globalState",
      "docs": [
        "全局状态账户",
        "用于管理合约的全局设置和统计信息"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "nextOathId",
            "type": "u64"
          },
          {
            "name": "totalOaths",
            "type": "u64"
          },
          {
            "name": "totalCollateral",
            "type": "u64"
          },
          {
            "name": "isPaused",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "oath",
      "docs": [
        "Oath 誓言结构体",
        "表示用户创建的去中心化誓言，包含承诺内容、抵押信息和执行状态"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "endTime",
            "type": "u64"
          },
          {
            "name": "solCollateral",
            "type": "u64"
          },
          {
            "name": "tokenAddress",
            "type": "pubkey"
          },
          {
            "name": "targetMarketCap",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "oathStatus"
              }
            }
          },
          {
            "name": "evidence",
            "type": "string"
          },
          {
            "name": "slashingInfo",
            "type": {
              "option": {
                "defined": {
                  "name": "slashingInfo"
                }
              }
            }
          },
          {
            "name": "compensationInfo",
            "type": {
              "option": {
                "defined": {
                  "name": "compensationInfo"
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "oathStatus",
      "docs": [
        "誓言状态枚举"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "completed"
          },
          {
            "name": "expired"
          },
          {
            "name": "failed"
          }
        ]
      }
    },
    {
      "name": "slashOathArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reason",
            "type": "string"
          },
          {
            "name": "slashedPercentage",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "slashingInfo",
      "docs": [
        "削减信息结构体",
        "当用户违约时记录惩罚信息"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "slashedAmount",
            "type": "u64"
          },
          {
            "name": "slashingTime",
            "type": "u64"
          },
          {
            "name": "reason",
            "type": "string"
          }
        ]
      }
    }
  ]
};
