import { BCS } from '@mysten/bcs';
import { TransactionBlock, TransactionArgument } from '@mysten/sui.js/transactions';
import { RepositoryValueType, ValueType } from './protocol';
export declare const MAX_U8: bigint;
export declare const MAX_U64: bigint;
export declare const MAX_U128: bigint;
export declare const MAX_U256: bigint;
export declare const OPTION_NONE = 0;
export declare const ValueTypeConvert: (type: ValueType | null | undefined) => RepositoryValueType | number;
export declare const ResolveRepositoryData: (dataType: RepositoryValueType, data: Uint8Array) => {
    type: ValueType;
    data: Uint8Array;
} | undefined;
export declare const readOption: (arr: number[], de: ValueType) => {
    bNone: boolean;
    value: any;
};
export declare const readOptionString: (arr: number[]) => {
    bNone: boolean;
    value: any;
};
export declare const ulebDecode: (arr: Uint8Array) => {
    value: number;
    length: number;
};
export declare const readVec: (arr: any[], cb: (arr: any[], i: number, length: number) => any) => any[];
export declare const cb_U8: (arr: any[], i: number, length: number) => any;
export declare const cb_U64: (arr: any[], i: number, length: number) => any;
export declare const cb_U128: (arr: any[], i: number, length: number) => any;
export declare const cb_U256: (arr: any[], i: number, length: number) => any;
export declare const concatenate: (resultConstructor: any, ...arrays: any[]) => any;
export declare const array_equal: (arr1: any[], arr2: any[]) => boolean;
export declare const array_unique: (arr: any[]) => any[];
export declare function capitalize(s: string): string;
export declare function parse_object_type(object_data: string): string[];
export declare class Bcs {
    bcs: BCS;
    private static _instance;
    private constructor();
    static getInstance(): Bcs;
    ser(type: ValueType, data: Uint8Array | any): Uint8Array;
    de(type: ValueType, data: Uint8Array | any): any;
    de_ent(data: Uint8Array): any;
    de_entInfo(data: Uint8Array): any;
}
export declare function stringToUint8Array(str: string): Uint8Array;
export declare function numToUint8Array(num: number): Uint8Array;
export declare const isArr: (origin: any) => boolean;
export declare const deepClone: <T>(origin: T, target?: T | Record<string, any> | undefined) => T;
export declare const MAX_DESCRIPTION_LENGTH = 1024;
export declare const MAX_NAME_LENGTH = 64;
export declare const MAX_ENDPOINT_LENGTH = 1024;
export declare const IsValidDesription: (description: string) => boolean;
export declare const IsValidName: (name: string) => boolean;
export declare const IsValidName_AllowEmpty: (name: string) => boolean;
export declare const IsValidEndpoint: (endpoint: string) => boolean;
export declare const IsValidAddress: (addr: string) => boolean;
export declare const IsValidTokenType: (argType: string) => boolean;
export declare const IsValidArgType: (argType: string) => boolean;
export declare const IsValidUint: (value: number | string) => boolean;
export declare const IsValidInt: (value: number | string) => boolean;
export declare const IsValidPercent: (value: number | string) => boolean;
export declare const IsValidArray: (arr: any[], validFunc: any) => boolean;
export declare const ResolveU64: (value: bigint) => bigint;
export declare const ResolveBalance: (balance: string, decimals: number) => string;
export declare const OptionNone: (txb: TransactionBlock) => TransactionArgument;
export type ArgType = {
    isCoin: boolean;
    coin: string;
    token: string;
};
export declare const ParseType: (type: string) => ArgType;
export declare function toFixed(x: number): string;
export declare function isValidHttpUrl(url: string): boolean;
//# sourceMappingURL=utils.d.ts.map