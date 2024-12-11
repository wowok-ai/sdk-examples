import { SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromHEX } from '@mysten/bcs';
import { TransactionBlock, Inputs } from '@mysten/sui.js/transactions';
import { capitalize, IsValidArray } from './utils';
import { isValidSuiObjectId } from '@mysten/sui.js/utils';
export var MODULES;
(function (MODULES) {
    MODULES["machine"] = "machine";
    MODULES["node"] = "node";
    MODULES["progress"] = "progress";
    MODULES["community"] = "community";
    MODULES["repository"] = "repository";
    MODULES["permission"] = "permission";
    MODULES["passport"] = "passport";
    MODULES["guard"] = "guard";
    MODULES["vote"] = "vote";
    MODULES["demand"] = "demand";
    MODULES["order"] = "order";
    MODULES["reward"] = "reward";
    MODULES["service"] = "service";
    MODULES["resource"] = "resource";
    MODULES["entity"] = "entity";
    MODULES["wowok"] = "wowok";
})(MODULES || (MODULES = {}));
export var OperatorType;
(function (OperatorType) {
    OperatorType[OperatorType["TYPE_QUERY"] = 1] = "TYPE_QUERY";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_GREATER"] = 11] = "TYPE_LOGIC_AS_U256_GREATER";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_GREATER_EQUAL"] = 12] = "TYPE_LOGIC_AS_U256_GREATER_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_LESSER"] = 13] = "TYPE_LOGIC_AS_U256_LESSER";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_LESSER_EQUAL"] = 14] = "TYPE_LOGIC_AS_U256_LESSER_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_EQUAL"] = 15] = "TYPE_LOGIC_AS_U256_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_EQUAL"] = 16] = "TYPE_LOGIC_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_HAS_SUBSTRING"] = 17] = "TYPE_LOGIC_HAS_SUBSTRING";
    OperatorType[OperatorType["TYPE_LOGIC_ALWAYS_TRUE"] = 18] = "TYPE_LOGIC_ALWAYS_TRUE";
    OperatorType[OperatorType["TYPE_LOGIC_NOT"] = 19] = "TYPE_LOGIC_NOT";
    OperatorType[OperatorType["TYPE_LOGIC_AND"] = 20] = "TYPE_LOGIC_AND";
    OperatorType[OperatorType["TYPE_LOGIC_OR"] = 21] = "TYPE_LOGIC_OR";
})(OperatorType || (OperatorType = {}));
export var ValueType;
(function (ValueType) {
    ValueType[ValueType["TYPE_BOOL"] = 100] = "TYPE_BOOL";
    ValueType[ValueType["TYPE_ADDRESS"] = 101] = "TYPE_ADDRESS";
    ValueType[ValueType["TYPE_U64"] = 102] = "TYPE_U64";
    ValueType[ValueType["TYPE_U8"] = 103] = "TYPE_U8";
    ValueType[ValueType["TYPE_VEC_U8"] = 104] = "TYPE_VEC_U8";
    ValueType[ValueType["TYPE_U128"] = 105] = "TYPE_U128";
    ValueType[ValueType["TYPE_VEC_ADDRESS"] = 106] = "TYPE_VEC_ADDRESS";
    ValueType[ValueType["TYPE_VEC_BOOL"] = 107] = "TYPE_VEC_BOOL";
    ValueType[ValueType["TYPE_VEC_VEC_U8"] = 108] = "TYPE_VEC_VEC_U8";
    ValueType[ValueType["TYPE_VEC_U64"] = 109] = "TYPE_VEC_U64";
    ValueType[ValueType["TYPE_VEC_U128"] = 110] = "TYPE_VEC_U128";
    ValueType[ValueType["TYPE_OPTION_ADDRESS"] = 111] = "TYPE_OPTION_ADDRESS";
    ValueType[ValueType["TYPE_OPTION_BOOL"] = 112] = "TYPE_OPTION_BOOL";
    ValueType[ValueType["TYPE_OPTION_U8"] = 113] = "TYPE_OPTION_U8";
    ValueType[ValueType["TYPE_OPTION_U64"] = 114] = "TYPE_OPTION_U64";
    ValueType[ValueType["TYPE_OPTION_U128"] = 115] = "TYPE_OPTION_U128";
    ValueType[ValueType["TYPE_OPTION_U256"] = 116] = "TYPE_OPTION_U256";
    ValueType[ValueType["TYPE_OPTION_STRING"] = 117] = "TYPE_OPTION_STRING";
    ValueType[ValueType["TYPE_OPTION_VEC_U8"] = 118] = "TYPE_OPTION_VEC_U8";
    ValueType[ValueType["TYPE_VEC_U256"] = 119] = "TYPE_VEC_U256";
    ValueType[ValueType["TYPE_STRING"] = 120] = "TYPE_STRING";
    ValueType[ValueType["TYPE_VEC_STRING"] = 121] = "TYPE_VEC_STRING";
    ValueType[ValueType["TYPE_U256"] = 122] = "TYPE_U256";
})(ValueType || (ValueType = {}));
export var RepositoryValueType;
(function (RepositoryValueType) {
    RepositoryValueType[RepositoryValueType["Address"] = 200] = "Address";
    RepositoryValueType[RepositoryValueType["Address_Vec"] = 201] = "Address_Vec";
    RepositoryValueType[RepositoryValueType["PositiveNumber"] = 202] = "PositiveNumber";
    RepositoryValueType[RepositoryValueType["PositiveNumber_Vec"] = 203] = "PositiveNumber_Vec";
    RepositoryValueType[RepositoryValueType["String"] = 204] = "String";
    RepositoryValueType[RepositoryValueType["String_Vec"] = 205] = "String_Vec";
})(RepositoryValueType || (RepositoryValueType = {}));
export const RepositoryValueTypeInfo = [
    { type: RepositoryValueType.Address, name: 'Address', description: 'Object id or Personal address.' },
    { type: RepositoryValueType.Address_Vec, name: 'Address vector', description: 'Vector of address.' },
    { type: RepositoryValueType.String, name: 'String', description: 'String.' },
    { type: RepositoryValueType.String_Vec, name: 'String vector', description: 'Vector of string.' },
    { type: RepositoryValueType.PositiveNumber, name: 'Positive number', description: 'Positive number. including u8, u16 ,..., u256' },
    { type: RepositoryValueType.PositiveNumber_Vec, name: 'Positive number vector', description: 'Vector of positive number' },
];
export const ValueTypeInfo = [
    { type: ValueType.TYPE_BOOL, name: 'bool' },
    { type: ValueType.TYPE_ADDRESS, name: 'address' },
    { type: ValueType.TYPE_U64, name: 'u64' },
    { type: ValueType.TYPE_U8, name: 'u8' },
    { type: ValueType.TYPE_VEC_U8, name: 'vec-u8' },
    { type: ValueType.TYPE_U128, name: 'u128' },
    { type: ValueType.TYPE_VEC_ADDRESS, name: 'vec-address' },
    { type: ValueType.TYPE_VEC_BOOL, name: 'vec-bool' },
    { type: ValueType.TYPE_VEC_VEC_U8, name: 'vec-vec-u8' },
    { type: ValueType.TYPE_VEC_U64, name: 'vec-u64' },
    { type: ValueType.TYPE_VEC_U128, name: 'vec-u128' },
    { type: ValueType.TYPE_OPTION_ADDRESS, name: 'opt-address' },
    { type: ValueType.TYPE_OPTION_BOOL, name: 'opt-bool' },
    { type: ValueType.TYPE_OPTION_U8, name: 'opt-u8' },
    { type: ValueType.TYPE_OPTION_U64, name: 'opt-u64' },
    { type: ValueType.TYPE_OPTION_U128, name: 'opt-u128' },
    { type: ValueType.TYPE_OPTION_U256, name: 'opt-u256' },
    { type: ValueType.TYPE_OPTION_STRING, name: 'opt-string' },
    { type: ValueType.TYPE_OPTION_VEC_U8, name: 'opt-vec-u8' },
    { type: ValueType.TYPE_VEC_U256, name: 'vec-u256' },
    { type: ValueType.TYPE_STRING, name: 'string' },
    { type: ValueType.TYPE_VEC_STRING, name: 'vec-string' },
    { type: ValueType.TYPE_U256, name: 'u256' },
];
export const OperatorTypeArray = Object.values(OperatorType).filter((v) => typeof (v) === 'number');
export const ValueTypeArray = Object.values(ValueType).filter((v) => typeof (v) === 'number');
export const IsValidOperatorType = (type) => { return OperatorTypeArray.includes(type); };
export const IsValidValueType = (type) => { return ValueTypeArray.includes(type); };
export const SER_VALUE = [
    { type: ValueType.TYPE_BOOL, name: 'bool', description: 'boolean. eg:true or false' },
    { type: ValueType.TYPE_ADDRESS, name: 'address', description: 'address or object-id. eg:0x6789af' },
    { type: ValueType.TYPE_U64, name: 'number', description: 'unsigned-64 number. eg:23870233' },
    { type: ValueType.TYPE_U8, name: 'number', description: 'unsigned-8 number. eg:255' },
    { type: ValueType.TYPE_VEC_U8, name: '[number]', description: 'unsigned-8 number array. eg:"[1,2,3]"' },
    { type: ValueType.TYPE_U128, name: 'number', description: 'unsigned-8 number. eg:12348900999' },
    { type: ValueType.TYPE_VEC_ADDRESS, name: '[address]', description: 'address array. eg:[0x2277f2, 0x3344af]' },
    { type: ValueType.TYPE_VEC_BOOL, name: '[bool]', description: 'boolean array. eg:[true, false, true]' },
    { type: ValueType.TYPE_VEC_VEC_U8, name: '[[number]]', description: 'array of unsigned-8 number array. eg:["i", "like", "wowok"]' },
    { type: ValueType.TYPE_VEC_U64, name: '[number]', description: 'unsigned-64 number array. eg:[123, 778888, 42312]' },
    { type: ValueType.TYPE_VEC_U128, name: '[number]', description: 'unsigned-128 number array. eg:[123, 778888, 42312]' },
    { type: ValueType.TYPE_OPTION_ADDRESS, name: 'option', description: 'option of address. eg:none or address' },
    { type: ValueType.TYPE_OPTION_BOOL, name: 'option', description: 'option of bool. eg:none or boolean value' },
    { type: ValueType.TYPE_OPTION_U8, name: 'option', description: 'option of u8. eg:none or u8 value' },
    { type: ValueType.TYPE_OPTION_U64, name: 'option', description: 'option of u64. eg:none or u64 value' },
    { type: ValueType.TYPE_OPTION_U128, name: 'option', description: 'option of u128. eg:none or u128 value' },
    { type: ValueType.TYPE_OPTION_U256, name: 'option', description: 'option of u256. eg:none or u256 value' },
    { type: ValueType.TYPE_VEC_U256, name: '[number]', description: 'unsigned-256 number array. eg:[123, 778888, 42312]' },
    { type: ValueType.TYPE_VEC_STRING, name: '[string]', description: 'ascii string array. eg:["abc", "hi"]' },
    { type: ValueType.TYPE_STRING, name: 'string', description: 'ascii string. eg:"wowok"' },
    { type: ValueType.TYPE_OPTION_STRING, name: 'option', description: 'option of string. eg:none or string value' },
    { type: ValueType.TYPE_U256, name: 'number', description: 'unsigned-256 number. eg:12345678901233' },
];
export var ContextType;
(function (ContextType) {
    ContextType[ContextType["TYPE_SIGNER"] = 60] = "TYPE_SIGNER";
    ContextType[ContextType["TYPE_CLOCK"] = 61] = "TYPE_CLOCK";
    ContextType[ContextType["TYPE_WITNESS_ID"] = 62] = "TYPE_WITNESS_ID";
    ContextType[ContextType["TYPE_CONSTANT"] = 80] = "TYPE_CONSTANT";
})(ContextType || (ContextType = {}));
export var ENTRYPOINT;
(function (ENTRYPOINT) {
    ENTRYPOINT["mainnet"] = "mainnet";
    ENTRYPOINT["testnet"] = "testnet";
    ENTRYPOINT["devnet"] = "devnet";
    ENTRYPOINT["localnet"] = "localnet";
})(ENTRYPOINT || (ENTRYPOINT = {}));
const TESTNET = {
    package: "0x852fa17575b1ae11932b475110bf46981458fdb67a2f07b922022e1516560fad",
    wowok_object: '0xf98cc6d8bd9feadc5dce7365270b4ffb32f69a5320ab739193d301103e686e8c',
    entity_object: '0xe0469c187499273ec39a575cc28d4d93f0a66b11e1b92028c61bc69bfc1167c6',
};
const MAINNET = {
    package: "",
    wowok_object: '',
    entity_object: '',
};
export class Protocol {
    network = '';
    package = '';
    signer = '';
    wowok_object = '';
    entity_object = '';
    graphql = '';
    txb;
    static _instance;
    constructor(network = ENTRYPOINT.testnet) {
        this.UseNetwork(network);
        this.NewSession();
    }
    static Instance() {
        if (!Protocol._instance) {
            Protocol._instance = new Protocol();
        }
        ;
        return Protocol._instance;
    }
    static Client() {
        return new SuiClient({ url: Protocol.Instance().NetworkUrl() });
    }
    UseNetwork(network = ENTRYPOINT.testnet) {
        this.network = network;
        switch (network) {
            case ENTRYPOINT.localnet:
                break;
            case ENTRYPOINT.devnet:
                break;
            case ENTRYPOINT.testnet:
                this.package = TESTNET.package;
                this.wowok_object = TESTNET.wowok_object;
                this.entity_object = TESTNET.entity_object;
                this.graphql = 'https://sui-testnet.mystenlabs.com/graphql';
                break;
            case ENTRYPOINT.mainnet:
                this.package = MAINNET.package;
                this.wowok_object = MAINNET.wowok_object;
                this.entity_object = MAINNET.entity_object;
                this.graphql = 'https://sui-mainnet.mystenlabs.com/graphql';
                break;
        }
        ;
    }
    Package() { return this.package; }
    WowokObject() { return this.wowok_object; }
    EntityObject() { return this.entity_object; }
    GraphqlUrl() { return this.graphql; }
    NetworkUrl() {
        switch (this.network) {
            case ENTRYPOINT.localnet:
                return "http://127.0.0.1:9000";
            case ENTRYPOINT.devnet:
                return "https://fullnode.devnet.sui.io:443";
            case ENTRYPOINT.testnet:
                return "https://fullnode.testnet.sui.io:443";
            case ENTRYPOINT.mainnet:
                return "https://fullnode.mainnet.sui.io:443";
        }
        ;
        return "";
    }
    ;
    MachineFn = (fn) => { return `${this.package}::${MODULES.machine}::${fn}`; };
    NodeFn = (fn) => { return `${this.package}::${MODULES.node}::${fn}`; };
    ProgressFn = (fn) => { return `${this.package}::${MODULES.progress}::${fn}`; };
    CommunityFn = (fn) => { return `${this.package}::${MODULES.community}::${fn}`; };
    RepositoryFn = (fn) => { return `${this.package}::${MODULES.repository}::${fn}`; };
    PermissionFn = (fn) => { return `${this.package}::${MODULES.permission}::${fn}`; };
    PassportFn = (fn) => { return `${this.package}::${MODULES.passport}::${fn}`; };
    GuardFn = (fn) => { return `${this.package}::${MODULES.guard}::${fn}`; };
    VoteFn = (fn) => { return `${this.package}::${MODULES.vote}::${fn}`; };
    DemandFn = (fn) => { return `${this.package}::${MODULES.demand}::${fn}`; };
    OrderFn = (fn) => { return `${this.package}::${MODULES.order}::${fn}`; };
    RewardFn = (fn) => { return `${this.package}::${MODULES.reward}::${fn}`; };
    ServiceFn = (fn) => { return `${this.package}::${MODULES.service}::${fn}`; };
    ResourceFn = (fn) => { return `${this.package}::${MODULES.resource}::${fn}`; };
    EntityFn = (fn) => { return `${this.package}::${MODULES.entity}::${fn}`; };
    WowokFn = (fn) => { return `${this.package}::${MODULES.wowok}::${fn}`; };
    Query = async (objects, options = { showContent: true }) => {
        const client = new SuiClient({ url: this.NetworkUrl() });
        const ids = objects.map((value) => value.objectid);
        const res = await client.call('sui_multiGetObjects', [ids, options]);
        let ret = [];
        for (let i = 0; i < res.length; i++) {
            objects.forEach((object) => {
                object.callback(this, res[i], object, options);
            });
        }
        return res;
    };
    Query_Raw = async (objects, options = { showContent: true }) => {
        const client = new SuiClient({ url: this.NetworkUrl() });
        return await client.call('sui_multiGetObjects', [objects, options]);
    };
    NewSession = () => {
        this.txb = new TransactionBlock();
        return this.txb;
    };
    CurrentSession = () => { return this.txb ? this.txb : this.NewSession(); };
    SignExcute = async (exes, priv_key, param, options = { showObjectChanges: true }) => {
        const client = new SuiClient({ url: this.NetworkUrl() });
        exes.forEach((e) => { e(this, param); });
        const privkey = fromHEX(priv_key);
        const keypair = Ed25519Keypair.fromSecretKey(privkey);
        const response = await client.signAndExecuteTransactionBlock({
            transactionBlock: this.CurrentSession(),
            signer: keypair,
            options,
        });
        this.txb = undefined; // reset the txb to undefine
        return response;
    };
    // used in service, discount, order, because service has COIN wrapper for TOKEN
    static SUI_TOKEN_TYPE = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'; // TOKEN_TYPE
    // used in demand, reward, ...
    static SUI_COIN_TYPE = '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x2::sui::SUI>'; // COIN TYPE
    WOWOK_TOKEN_TYPE = () => { return this.package + '::wowok::WOWOK'; };
    WOWOK_COIN_TYPE = () => { return '0x2::coin::Coin<' + this.package + '::wowok::WOWOK>'; };
    COINS_TYPE = () => {
        switch (this.network) {
            case ENTRYPOINT.testnet:
                return this.CoinTypes_Testnet;
            case ENTRYPOINT.mainnet:
                return this.CoinTypes_Mainnet;
        }
        ;
        return [];
    };
    Update_CoinType = (token_type, decimals, symbol) => {
        if (!symbol || !token_type)
            return;
        switch (this.network) {
            case ENTRYPOINT.testnet:
                var r = this.CoinTypes_Testnet.filter((v) => v?.type !== token_type);
                r.push({ symbol: symbol, type: token_type, decimals: decimals });
                this.CoinTypes_Testnet = r;
                break;
            case ENTRYPOINT.mainnet:
                var r = this.CoinTypes_Mainnet.filter((v) => v?.type !== token_type);
                r.push({ symbol: symbol, type: token_type, decimals: decimals });
                this.CoinTypes_Mainnet = r;
                break;
        }
        ;
    };
    ExplorerUrl = (objectid, type = 'object') => {
        if (this.network === ENTRYPOINT.testnet) {
            return 'https://testnet.suivision.xyz/' + type + '/' + objectid;
        }
        else if (this.network === ENTRYPOINT.mainnet) {
            return 'https://suivision.xyz/' + type + '/' + objectid;
        }
        ;
        return '';
    };
    CoinTypes_Testnet = [
        { symbol: 'SUI', type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI', decimals: 9 },
        { symbol: 'SUI', type: '0x2::sui::SUI', decimals: 9 },
        { symbol: 'WOW', type: TESTNET.package + '::wowok::WOWOK', decimals: 9 },
        { symbol: 'USDT', type: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN', decimals: 6 },
        { symbol: 'USDC', type: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN', decimals: 6 },
        { symbol: 'WETH', type: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN', decimals: 8 },
        { symbol: 'WBNB', type: '0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f::coin::COIN', decimals: 8 },
    ];
    CoinTypes_Mainnet = [];
    GetCoinTypeInfo = (token_type, handler) => {
        let r = this.COINS_TYPE().find((v) => v?.type === token_type);
        if (!r) {
            Protocol.Client().getCoinMetadata({ coinType: token_type }).then((res) => {
                if (res?.decimals && res?.symbol) {
                    this.Update_CoinType(token_type, res?.decimals, res?.symbol);
                    handler({ symbol: res.symbol, decimals: res.decimals, type: token_type });
                }
            }).catch((e) => {
                console.log(e);
            });
        }
        else {
            return r;
        }
        ;
        return 'loading';
    };
    static CLOCK_OBJECT = Inputs.SharedObjectRef({
        objectId: "0x6",
        mutable: false,
        initialSharedVersion: 1,
    });
    static TXB_OBJECT(txb, arg) {
        if (typeof arg == 'string')
            return txb.object(arg);
        return arg;
    }
    static IsValidObjects = (arr) => {
        return IsValidArray(arr, (v) => {
            if (!v)
                return false;
            if (typeof (v) === 'string' && !isValidSuiObjectId(v)) {
                return false;
            }
            return true;
        });
    };
    WOWOK_OBJECTS_TYPE = () => Object.keys(MODULES).map((key) => { let i = this.package + '::' + key + '::'; return i + capitalize(key); });
    WOWOK_OBJECTS_PREFIX_TYPE = () => Object.keys(MODULES).map((key) => { return this.package + '::' + key + '::'; });
    object_name_from_type_repr = (type_repr) => {
        if (!type_repr)
            return '';
        let i = type_repr.indexOf('::');
        if (i > 0 && type_repr.slice(0, i) === this.package) {
            i = type_repr.indexOf('<');
            if (i > 0) {
                type_repr = type_repr.slice(0, i);
            }
            let n = type_repr.lastIndexOf('::');
            if (n > 0) {
                return type_repr.slice(n + 2);
            }
        }
        return '';
    };
}
export class RpcResultParser {
    static Object_Type_Extra = () => {
        let names = Object.keys(MODULES).map((key) => { return key + '::' + capitalize(key); });
        names.push('order::Discount');
        return names;
    };
    static objectids_from_response = (protocol, response, concat_result) => {
        // console.log(response)
        let ret = new Map();
        if (response?.objectChanges) {
            response.objectChanges.forEach((change) => {
                RpcResultParser.Object_Type_Extra().forEach((name) => {
                    let type = protocol.Package() + '::' + name;
                    if (change.type == 'created' && change.objectType.includes(type)) {
                        if (ret.has(name)) {
                            ret.get(name)?.push(change.objectId);
                        }
                        else {
                            ret.set(name, [change.objectId]);
                        }
                    }
                });
            });
        }
        if (concat_result) {
            ret.forEach((value, key) => {
                if (concat_result.has(key)) {
                    concat_result.set(key, concat_result.get(key).concat(value));
                }
                else {
                    concat_result.set(key, value);
                }
            });
        }
        return ret;
    };
}
