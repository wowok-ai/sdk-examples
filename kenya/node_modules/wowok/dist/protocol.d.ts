import { SuiClient, SuiObjectResponse, SuiObjectDataOptions, SuiTransactionBlockResponseOptions, SuiTransactionBlockResponse } from '@mysten/sui.js/client';
import { TransactionBlock, TransactionResult } from '@mysten/sui.js/transactions';
import { GuardConstant } from './guard';
export declare enum MODULES {
    machine = "machine",
    node = "node",
    progress = "progress",
    community = "community",
    repository = "repository",
    permission = "permission",
    passport = "passport",
    guard = "guard",
    vote = "vote",
    demand = "demand",
    order = "order",
    reward = "reward",
    service = "service",
    resource = "resource",
    entity = "entity",
    wowok = "wowok"
}
export type PermissionAddress = TransactionResult;
export type PermissionObject = TransactionResult | string;
export type RepositoryAddress = TransactionResult;
export type RepositoryObject = TransactionResult | string;
export type GuardAddress = TransactionResult;
export type GuardObject = TransactionResult | string;
export type MachineAddress = TransactionResult;
export type MachineObject = TransactionResult | string;
export type PassportObject = TransactionResult;
export type DemandAddress = TransactionResult;
export type DemandObject = TransactionResult | string;
export type ServiceObject = TransactionResult | string;
export type ServiceAddress = TransactionResult;
export type ProgressObject = TransactionResult | string;
export type ProgressAddress = TransactionResult;
export type RewardObject = TransactionResult | string;
export type RewardAddress = TransactionResult;
export type OrderObject = TransactionResult | string;
export type OrderAddress = TransactionResult;
export type DiscountObject = TransactionResult | string;
export type CoinObject = TransactionResult | string;
export type VoteObject = TransactionResult | string;
export type VoteAddress = TransactionResult;
export type ResourceObject = TransactionResult | string;
export type ResourceAddress = TransactionResult;
export type EntityObject = TransactionResult | string;
export type EntityAddress = TransactionResult;
export type TxbObject = string | TransactionResult | GuardObject | RepositoryObject | PermissionObject | MachineObject | PassportObject | DemandObject | ServiceObject | RewardObject | OrderObject | DiscountObject | VoteObject | DemandObject | ResourceObject | EntityObject;
export type WowokObject = TransactionResult;
export type FnCallType = `${string}::${string}::${string}`;
export declare enum OperatorType {
    TYPE_QUERY = 1,
    TYPE_LOGIC_AS_U256_GREATER = 11,
    TYPE_LOGIC_AS_U256_GREATER_EQUAL = 12,
    TYPE_LOGIC_AS_U256_LESSER = 13,
    TYPE_LOGIC_AS_U256_LESSER_EQUAL = 14,
    TYPE_LOGIC_AS_U256_EQUAL = 15,
    TYPE_LOGIC_EQUAL = 16,
    TYPE_LOGIC_HAS_SUBSTRING = 17,
    TYPE_LOGIC_ALWAYS_TRUE = 18,
    TYPE_LOGIC_NOT = 19,
    TYPE_LOGIC_AND = 20,
    TYPE_LOGIC_OR = 21
}
export declare enum ValueType {
    TYPE_BOOL = 100,
    TYPE_ADDRESS = 101,
    TYPE_U64 = 102,
    TYPE_U8 = 103,
    TYPE_VEC_U8 = 104,
    TYPE_U128 = 105,
    TYPE_VEC_ADDRESS = 106,
    TYPE_VEC_BOOL = 107,
    TYPE_VEC_VEC_U8 = 108,
    TYPE_VEC_U64 = 109,
    TYPE_VEC_U128 = 110,
    TYPE_OPTION_ADDRESS = 111,
    TYPE_OPTION_BOOL = 112,
    TYPE_OPTION_U8 = 113,
    TYPE_OPTION_U64 = 114,
    TYPE_OPTION_U128 = 115,
    TYPE_OPTION_U256 = 116,
    TYPE_OPTION_STRING = 117,
    TYPE_OPTION_VEC_U8 = 118,
    TYPE_VEC_U256 = 119,
    TYPE_STRING = 120,
    TYPE_VEC_STRING = 121,
    TYPE_U256 = 122
}
export declare enum RepositoryValueType {
    Address = 200,
    Address_Vec = 201,
    PositiveNumber = 202,
    PositiveNumber_Vec = 203,
    String = 204,
    String_Vec = 205
}
export declare const RepositoryValueTypeInfo: {
    type: RepositoryValueType;
    name: string;
    description: string;
}[];
export declare const ValueTypeInfo: {
    type: ValueType;
    name: string;
}[];
export declare const OperatorTypeArray: number[];
export declare const ValueTypeArray: number[];
export declare const IsValidOperatorType: (type: number) => boolean;
export declare const IsValidValueType: (type: number) => boolean;
interface ValueTypeString {
    type: ValueType;
    name: string;
    description: string;
}
export declare const SER_VALUE: ValueTypeString[];
export declare enum ContextType {
    TYPE_SIGNER = 60,
    TYPE_CLOCK = 61,
    TYPE_WITNESS_ID = 62,
    TYPE_CONSTANT = 80
}
export type ConstantType = ValueType | ContextType.TYPE_WITNESS_ID;
export type Data_Type = ValueType | OperatorType | ContextType;
export declare enum ENTRYPOINT {
    mainnet = "mainnet",
    testnet = "testnet",
    devnet = "devnet",
    localnet = "localnet"
}
export interface CoinTypeInfo {
    symbol: string;
    type: string;
    decimals: number;
}
export declare class Protocol {
    protected network: string;
    protected package: string;
    protected signer: string;
    protected wowok_object: string;
    protected entity_object: string;
    protected graphql: string;
    protected txb: TransactionBlock | undefined;
    static _instance: any;
    constructor(network?: ENTRYPOINT);
    static Instance(): Protocol;
    static Client(): SuiClient;
    UseNetwork(network?: ENTRYPOINT): void;
    Package(): string;
    WowokObject(): string;
    EntityObject(): string;
    GraphqlUrl(): string;
    NetworkUrl(): string;
    MachineFn: (fn: any) => string;
    NodeFn: (fn: any) => string;
    ProgressFn: (fn: any) => string;
    CommunityFn: (fn: any) => string;
    RepositoryFn: (fn: any) => string;
    PermissionFn: (fn: any) => string;
    PassportFn: (fn: any) => string;
    GuardFn: (fn: any) => string;
    VoteFn: (fn: any) => string;
    DemandFn: (fn: any) => string;
    OrderFn: (fn: any) => string;
    RewardFn: (fn: any) => string;
    ServiceFn: (fn: any) => string;
    ResourceFn: (fn: any) => string;
    EntityFn: (fn: any) => string;
    WowokFn: (fn: any) => string;
    Query: (objects: Query_Param[], options?: SuiObjectDataOptions) => Promise<SuiObjectResponse[]>;
    Query_Raw: (objects: string[], options?: SuiObjectDataOptions) => Promise<SuiObjectResponse[]>;
    NewSession: () => TransactionBlock;
    CurrentSession: () => TransactionBlock;
    SignExcute: (exes: ((protocol: Protocol, param: any) => void)[], priv_key: string, param?: any, options?: SuiTransactionBlockResponseOptions) => Promise<SuiTransactionBlockResponse>;
    static SUI_TOKEN_TYPE: string;
    static SUI_COIN_TYPE: string;
    WOWOK_TOKEN_TYPE: () => string;
    WOWOK_COIN_TYPE: () => string;
    COINS_TYPE: () => CoinTypeInfo[];
    Update_CoinType: (token_type: string, decimals: number, symbol: string) => void;
    ExplorerUrl: (objectid: string, type?: 'object' | 'txblock' | 'account') => string;
    CoinTypes_Testnet: CoinTypeInfo[];
    CoinTypes_Mainnet: CoinTypeInfo[];
    GetCoinTypeInfo: (token_type: string, handler: (info: CoinTypeInfo) => void) => CoinTypeInfo | 'loading';
    static CLOCK_OBJECT: {
        Object: {
            ImmOrOwned: {
                digest: string;
                objectId: string;
                version: string | number | bigint;
            };
        } | {
            Shared: {
                objectId: string;
                initialSharedVersion: string | number;
                mutable: boolean;
            };
        } | {
            Receiving: {
                digest: string;
                objectId: string;
                version: string | number | bigint;
            };
        };
    };
    static TXB_OBJECT(txb: TransactionBlock, arg: TxbObject): TransactionResult;
    static IsValidObjects: (arr: TxbObject[]) => boolean;
    WOWOK_OBJECTS_TYPE: () => string[];
    WOWOK_OBJECTS_PREFIX_TYPE: () => string[];
    object_name_from_type_repr: (type_repr: string) => string;
}
export declare class RpcResultParser {
    static Object_Type_Extra: () => string[];
    static objectids_from_response: (protocol: Protocol, response: SuiTransactionBlockResponse, concat_result?: Map<string, TxbObject[]>) => Map<string, TxbObject[]>;
}
export type Query_Param = {
    objectid: string;
    callback: (protocol: Protocol, response: SuiObjectResponse, param: Query_Param, option: SuiObjectDataOptions) => void;
    parser?: (result: any[], guardid: string, chain_sense_bsc: Uint8Array, constant?: GuardConstant) => boolean;
    data?: any;
    constants?: GuardConstant;
};
export {};
//# sourceMappingURL=protocol.d.ts.map