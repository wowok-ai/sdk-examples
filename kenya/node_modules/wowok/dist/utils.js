import { BCS, getSuiMoveConfig } from '@mysten/bcs';
import { ERROR, Errors } from './exception';
import { isValidSuiAddress } from '@mysten/sui.js/utils';
import { RepositoryValueType, ValueType } from './protocol';
export const MAX_U8 = BigInt('256');
export const MAX_U64 = BigInt('18446744073709551615');
export const MAX_U128 = BigInt('340282366920938463463374607431768211455');
export const MAX_U256 = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935');
export const OPTION_NONE = 0;
export const ValueTypeConvert = (type) => {
    if (type === ValueType.TYPE_U8 || type === ValueType.TYPE_U64 || type === ValueType.TYPE_U128 ||
        type === ValueType.TYPE_U256 || type === ValueType.TYPE_BOOL) {
        return RepositoryValueType.PositiveNumber;
    }
    else if (type === ValueType.TYPE_VEC_U8 || type === ValueType.TYPE_VEC_U64 || type === ValueType.TYPE_VEC_U128 ||
        type === ValueType.TYPE_VEC_U256 || type === ValueType.TYPE_VEC_BOOL) {
        return RepositoryValueType.PositiveNumber_Vec;
    }
    else if (type === ValueType.TYPE_ADDRESS) {
        return RepositoryValueType.Address;
    }
    else if (type === ValueType.TYPE_VEC_ADDRESS) {
        return RepositoryValueType.Address_Vec;
    }
    else if (type === ValueType.TYPE_STRING) {
        return RepositoryValueType.String;
    }
    else if (type === ValueType.TYPE_VEC_STRING) {
        return RepositoryValueType.String_Vec;
    }
    return -1;
};
export const ResolveRepositoryData = (dataType, data) => {
    if (dataType === RepositoryValueType.String) {
        return { type: ValueType.TYPE_STRING, data: Bcs.getInstance().ser(ValueType.TYPE_VEC_U8, new TextEncoder().encode(data.toString())) };
    }
    else if (dataType === RepositoryValueType.PositiveNumber) {
        try {
            const value = BigInt(data.toString());
            var t = ValueType.TYPE_U8;
            if (value <= MAX_U8) {
            }
            else if (value <= MAX_U64) {
                t = ValueType.TYPE_U64;
            }
            else if (value <= MAX_U128) {
                t = ValueType.TYPE_U128;
            }
            else if (value <= MAX_U256) {
                t = ValueType.TYPE_U256;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            console.log(e);
            return undefined;
        }
        return { type: t, data: Bcs.getInstance().ser(t, data) };
    }
    else if (dataType === RepositoryValueType.Address) {
        return { type: ValueType.TYPE_ADDRESS, data: Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, data) };
    }
    //@ todo vector....
    return undefined;
};
export const readOption = (arr, de) => {
    let o = arr.splice(0, 1);
    if (o[0] == 1) { // true
        return { bNone: false, value: Bcs.getInstance().de(de, Uint8Array.from(arr)) };
    }
    else if (o[0] == 0) {
        return { bNone: true, value: OPTION_NONE };
    }
    else {
        ERROR(Errors.Fail, 'readOption: option invalid');
        return { bNone: true, value: OPTION_NONE };
    }
};
export const readOptionString = (arr) => {
    let o = arr.splice(0, 1);
    if (o[0] == 1) { // true
        let r = ulebDecode(Uint8Array.from(arr));
        let value = Bcs.getInstance().de(ValueType.TYPE_STRING, Uint8Array.from(arr));
        arr.splice(0, r.value + r.length);
        return { bNone: false, value: value };
    }
    else if (o[0] == 0) {
        return { bNone: true, value: OPTION_NONE };
    }
    else {
        ERROR(Errors.Fail, 'readOption: option invalid');
        return { bNone: true, value: OPTION_NONE };
    }
};
export const ulebDecode = (arr) => {
    let total = 0;
    let shift = 0;
    let len = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        let byte = arr[len];
        len += 1;
        total |= (byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) {
            break;
        }
        shift += 7;
    }
    return {
        value: total,
        length: len,
    };
};
export const readVec = (arr, cb) => {
    let r = ulebDecode(Uint8Array.from(arr));
    arr.splice(0, r.length);
    let result = [];
    for (let i = 0; i < r.value; i++) {
        result.push(cb(arr, i, r.value));
    }
    return result;
};
export const cb_U8 = (arr, i, length) => {
    return arr.shift();
};
export const cb_U64 = (arr, i, length) => {
    return arr.splice(0, 8);
};
export const cb_U128 = (arr, i, length) => {
    return arr.splice(0, 16);
};
export const cb_U256 = (arr, i, length) => {
    return arr.splice(0, 32);
};
export const concatenate = (resultConstructor, ...arrays) => {
    let totalLength = 0;
    for (const arr of arrays) {
        totalLength += arr.length;
    }
    const result = new resultConstructor(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
};
export const array_equal = (arr1, arr2) => {
    // Array.some(): 有一项不满足，返回false
    if (arr1.length !== arr2.length) {
        return false;
    }
    return !arr1.some((item) => !arr2.includes(item));
};
export const array_unique = (arr) => {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
        if (newArr.indexOf(arr[i]) == -1) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
};
export function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
}
// for: "0xsdjfkskf<0x2::sui::coin<xxx>, 0xfdfff<>>"
export function parse_object_type(object_data) {
    var object_type = [];
    let type_pos = object_data.indexOf('<');
    if (type_pos >= 0) {
        let t = object_data.slice((type_pos + 1), object_data.length - 1);
        object_type = t.split(',');
    }
    return object_type;
}
export class Bcs {
    bcs = new BCS(getSuiMoveConfig());
    static _instance;
    constructor() {
        this.bcs.registerEnumType('Option<T>', {
            'none': null,
            'some': 'T',
        });
        this.bcs.registerStructType('EntStruct', {
            'avatar': 'vector<u8>',
            'resource': "Option<address>",
            'like': BCS.U32,
            'dislike': BCS.U32,
        });
        this.bcs.registerStructType('PersonalInfo', {
            'name': 'vector<u8>',
            'description': 'vector<u8>',
            'avatar': BCS.STRING,
            'twitter': BCS.STRING,
            'discord': BCS.STRING,
            'homepage': BCS.STRING,
        });
    }
    static getInstance() {
        if (!Bcs._instance) {
            Bcs._instance = new Bcs();
        }
        ;
        return Bcs._instance;
    }
    ser(type, data) {
        switch (type) {
            case ValueType.TYPE_BOOL:
                return this.bcs.ser(BCS.BOOL, data).toBytes();
            case ValueType.TYPE_ADDRESS:
                return this.bcs.ser(BCS.ADDRESS, data).toBytes();
            case ValueType.TYPE_U64:
                return this.bcs.ser(BCS.U64, data).toBytes();
            case ValueType.TYPE_U8:
                return this.bcs.ser(BCS.U8, data).toBytes();
            case ValueType.TYPE_VEC_U8:
                return this.bcs.ser('vector<u8>', data).toBytes();
            case ValueType.TYPE_U128:
                return this.bcs.ser(BCS.U128, data).toBytes();
            case ValueType.TYPE_VEC_ADDRESS:
                return this.bcs.ser('vector<address>', data).toBytes();
            case ValueType.TYPE_VEC_BOOL:
                return this.bcs.ser('vector<bool>', data).toBytes();
            case ValueType.TYPE_VEC_VEC_U8:
                return this.bcs.ser('vector<vector<u8>>', data).toBytes();
            case ValueType.TYPE_VEC_U64:
                return this.bcs.ser('vector<u64>', data).toBytes();
            case ValueType.TYPE_VEC_U128:
                return this.bcs.ser('vector<u128>', data).toBytes();
            case ValueType.TYPE_OPTION_ADDRESS:
                return this.bcs.ser('Option<address>', { 'some': data }).toBytes();
            case ValueType.TYPE_OPTION_BOOL:
                return this.bcs.ser('Option<bool>', { 'some': data }).toBytes();
            case ValueType.TYPE_OPTION_U8:
                return this.bcs.ser('Option<u8>', { 'some': data }).toBytes();
            case ValueType.TYPE_OPTION_U64:
                return this.bcs.ser('Option<u64>', { 'some': data }).toBytes();
            case ValueType.TYPE_OPTION_U128:
                return this.bcs.ser('Option<u128>', { 'some': data }).toBytes();
            case ValueType.TYPE_OPTION_U256:
                return this.bcs.ser('Option<u256>', { 'some': data }).toBytes();
            case ValueType.TYPE_OPTION_STRING:
                return this.bcs.ser('Option<string>', { 'some': data }).toBytes();
            case ValueType.TYPE_VEC_U256:
                return this.bcs.ser('vector<u256>', data).toBytes();
            case ValueType.TYPE_U256:
                return this.bcs.ser(BCS.U256, data).toBytes();
            case ValueType.TYPE_STRING:
                return this.bcs.ser(BCS.STRING, data).toBytes();
            case ValueType.TYPE_VEC_STRING:
                return this.bcs.ser('vector<string>', data).toBytes();
            default:
                ERROR(Errors.bcsTypeInvalid, 'ser');
        }
        return new Uint8Array();
    }
    de(type, data) {
        switch (type) {
            case ValueType.TYPE_BOOL:
                return this.bcs.de(BCS.BOOL, data);
            case ValueType.TYPE_ADDRESS:
                return this.bcs.de(BCS.ADDRESS, data);
            case ValueType.TYPE_U64:
                return this.bcs.de(BCS.U64, data);
            case ValueType.TYPE_U8:
                console.log(data);
                return this.bcs.de(BCS.U8, data);
            case ValueType.TYPE_VEC_U8:
                return this.bcs.de('vector<u8>', data);
            case ValueType.TYPE_U128:
                return this.bcs.de(BCS.U128, data);
            case ValueType.TYPE_VEC_ADDRESS:
                return this.bcs.de('vector<address>', data);
            case ValueType.TYPE_VEC_BOOL:
                return this.bcs.de('vector<bool>', data);
            case ValueType.TYPE_VEC_VEC_U8:
                return this.bcs.de('vector<vector<u8>>', data);
            case ValueType.TYPE_VEC_U64:
                return this.bcs.de('vector<u64>', data);
            case ValueType.TYPE_VEC_U128:
                return this.bcs.de('vector<u128>', data);
            case ValueType.TYPE_OPTION_ADDRESS:
                return this.bcs.de('Option<address>', data);
            case ValueType.TYPE_OPTION_BOOL:
                return this.bcs.de('Option<bool>', data);
            case ValueType.TYPE_OPTION_U8:
                return this.bcs.de('Option<u8>', data);
            case ValueType.TYPE_OPTION_U64:
                return this.bcs.de('Option<u64>', data);
            case ValueType.TYPE_OPTION_U128:
                return this.bcs.de('Option<u128>', data);
            case ValueType.TYPE_OPTION_U256:
                return this.bcs.de('Option<u256>', data);
            case ValueType.TYPE_OPTION_STRING:
                return this.bcs.de('Option<string>', data);
            case ValueType.TYPE_VEC_U256:
                return this.bcs.de('vector<u256>', data);
            case ValueType.TYPE_STRING:
                return this.bcs.de(BCS.STRING, data);
            case ValueType.TYPE_VEC_STRING:
                return this.bcs.de('vector<string>', data);
            case ValueType.TYPE_U256:
                return this.bcs.de(BCS.U256, data);
            default:
                ERROR(Errors.bcsTypeInvalid, 'de');
        }
    }
    de_ent(data) {
        const struct_vec = this.bcs.de('vector<u8>', data);
        return this.bcs.de('EntStruct', Uint8Array.from(struct_vec));
        /*        const reader = new BcsReader(data);
                const total_len = reader.readULEB();
                console.log(avatar_len)
                const avatar = reader.readBytes(avatar_len);
                console.log(avatar)
                const option_resource = reader.read8();
                var resource = '';
                if (option_resource != 0) {
                    resource = reader.read256();
                }
                const like = reader.read32();
                const dislike = reader.read32();
                return {avatar:avatar, resource:resource, like:like, dislike:dislike}*/
    }
    de_entInfo(data) {
        let r = this.bcs.de('PersonalInfo', data);
        r.name = new TextDecoder().decode(Uint8Array.from(r.name));
        r.description = new TextDecoder().decode(Uint8Array.from(r.description));
        return r;
    }
}
export function stringToUint8Array(str) {
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array;
}
export function numToUint8Array(num) {
    if (!num)
        return new Uint8Array(0);
    const a = [];
    a.unshift(num & 255);
    while (num >= 256) {
        num = num >>> 8;
        a.unshift(num & 255);
    }
    return new Uint8Array(a);
}
export const isArr = (origin) => {
    let str = '[object Array]';
    return Object.prototype.toString.call(origin) == str ? true : false;
};
export const deepClone = (origin, target) => {
    let tar = target || {};
    for (const key in origin) {
        if (Object.prototype.hasOwnProperty.call(origin, key)) {
            if (typeof origin[key] === 'object' && origin[key] !== null) {
                tar[key] = isArr(origin[key]) ? [] : {};
                deepClone(origin[key], tar[key]);
            }
            else {
                tar[key] = origin[key];
            }
        }
    }
    return tar;
};
export const MAX_DESCRIPTION_LENGTH = 1024;
export const MAX_NAME_LENGTH = 64;
export const MAX_ENDPOINT_LENGTH = 1024;
// export const OptionNone = (txb:TransactionBlock) : TransactionArgument => { return txb.pure([], BCS.U8) };
export const IsValidDesription = (description) => { return description?.length <= MAX_DESCRIPTION_LENGTH; };
export const IsValidName = (name) => { if (!name)
    return false; return name.length <= MAX_NAME_LENGTH && name.length != 0; };
export const IsValidName_AllowEmpty = (name) => { return name.length <= MAX_NAME_LENGTH; };
export const IsValidEndpoint = (endpoint) => { if (!endpoint)
    return false; return endpoint.length <= MAX_ENDPOINT_LENGTH; };
export const IsValidAddress = (addr) => {
    if (!addr || !isValidSuiAddress(addr)) {
        return false;
    }
    return true;
};
export const IsValidTokenType = (argType) => {
    if (!argType || argType.length === 0) {
        return false;
    }
    let arr = argType.split('::');
    if (arr.length !== 3) {
        return false;
    }
    if ((!IsValidAddress(arr[0]) && arr[0] != '0x2') || arr[1].length === 0 || arr[2].length === 0) {
        return false;
    }
    return true;
};
export const IsValidArgType = (argType) => {
    if (!argType || argType.length === 0) {
        return false;
    }
    let arr = argType.split('::');
    if (arr.length < 3) {
        return false;
    }
    return true;
};
export const IsValidUint = (value) => {
    if (typeof (value) === 'string') {
        value = parseInt(value);
    }
    return Number.isSafeInteger(value) && value > 0;
};
export const IsValidInt = (value) => {
    if (typeof (value) === 'string') {
        value = parseInt(value);
    }
    return Number.isSafeInteger(value);
};
export const IsValidPercent = (value) => {
    if (typeof (value) === 'string') {
        value = parseInt(value);
    }
    return Number.isSafeInteger(value) && value > 0 && value <= 100;
};
export const IsValidArray = (arr, validFunc) => {
    for (let i = 0; i < arr.length; ++i) {
        if (!validFunc(arr[i])) {
            return false;
        }
    }
    return true;
};
export const ResolveU64 = (value) => {
    const max = MAX_U64;
    if (value > max) {
        return max;
    }
    else {
        return value;
    }
};
export const ResolveBalance = (balance, decimals) => {
    if (!balance)
        return '';
    if (balance === '0')
        return '0';
    if (decimals <= 0)
        return balance;
    var pos = decimals - balance.length;
    if (pos === 0) {
        return '.' + balance;
    }
    else if (pos < 0) {
        let start = balance.slice(0, Math.abs(pos));
        let end = balance.slice(Math.abs(pos));
        return start + '.' + end;
    }
    else {
        return '.' + balance.padStart(pos, '0');
    }
};
export const OptionNone = (txb) => { return txb.pure([], BCS.U8); };
export const ParseType = (type) => {
    if (type) {
        const COIN = '0x2::coin::Coin<';
        let i = type.indexOf(COIN);
        if (i >= 0) {
            let coin = type.slice(i + COIN.length, type.length - 1);
            if (coin.indexOf('<') === -1) {
                while (coin[coin.length - 1] == '>') {
                    coin = coin.slice(0, -1);
                }
                ;
                let t = coin.lastIndexOf('::');
                return { isCoin: true, coin: coin, token: coin.slice(t + 2) };
            }
        }
    }
    return { isCoin: false, coin: '', token: '' };
};
export function toFixed(x) {
    let res = '';
    if (Math.abs(x) < 1.0) {
        var e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            res = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    }
    else {
        var e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            res = x + (new Array(e + 1)).join('0');
        }
    }
    return res;
}
export function isValidHttpUrl(url) {
    let r;
    try {
        r = new URL(url);
    }
    catch (_) {
        return false;
    }
    return r.protocol === "http:" || r.protocol === "https:" || r.protocol === 'ipfs:';
}
