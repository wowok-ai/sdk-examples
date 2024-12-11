import { Inputs } from '@mysten/sui.js/transactions';
import { Protocol, ContextType, OperatorType, ValueType, SER_VALUE } from './protocol';
import { parse_object_type, array_unique, Bcs, ulebDecode, IsValidAddress, IsValidArray, readOption, readOptionString } from './utils';
import { ERROR, Errors } from './exception';
import { Guard } from './guard';
export class GuardParser {
    guard_list = [];
    protocol;
    guards;
    index = 0;
    get_index() { return this.index++; }
    constructor(protocol, guards) {
        this.protocol = protocol;
        this.guards = guards.map(g => protocol.CurrentSession().object(g));
    }
    guardlist = () => { return this.guard_list; };
    static DeGuardObject_FromData = (guard_constants, guard_input_bytes) => {
        let constants = [];
        guard_constants.forEach((c) => {
            let value;
            let v = c?.fields ?? c; // graphql dosnot 'fields', but rpcall has.
            switch (v.type) {
                case ContextType.TYPE_WITNESS_ID:
                case ValueType.TYPE_ADDRESS:
                    value = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(v.value)).toString();
                    break;
                case ValueType.TYPE_BOOL:
                case ValueType.TYPE_U8:
                case ValueType.TYPE_U64:
                case ValueType.TYPE_U128:
                case ValueType.TYPE_U256:
                case ValueType.TYPE_VEC_U8:
                case ValueType.TYPE_VEC_U64:
                case ValueType.TYPE_VEC_U128:
                case ValueType.TYPE_VEC_ADDRESS:
                case ValueType.TYPE_VEC_BOOL:
                case ValueType.TYPE_VEC_VEC_U8:
                case ValueType.TYPE_OPTION_ADDRESS:
                case ValueType.TYPE_OPTION_BOOL:
                case ValueType.TYPE_OPTION_U128:
                case ValueType.TYPE_OPTION_U8:
                case ValueType.TYPE_OPTION_U64:
                case ValueType.TYPE_OPTION_U256:
                case ValueType.TYPE_VEC_U256:
                    let de = SER_VALUE.find(s => s.type == v.type);
                    if (!de)
                        ERROR(Errors.Fail, 'GuardObject de error');
                    value = Bcs.getInstance().de(de.type, Uint8Array.from(v.value));
                    break;
                default:
                    ERROR(Errors.Fail, 'GuardObject constant type invalid');
            }
            constants.push({ identifier: v.identifier, type: v.type, value: value });
        });
        // console.log(constants)
        let bytes = Uint8Array.from(guard_input_bytes);
        let arr = [].slice.call(bytes.reverse());
        let data = [];
        while (arr.length > 0) {
            let type = arr.shift();
            let value;
            let cmd;
            let identifier;
            switch (type) {
                case ContextType.TYPE_SIGNER:
                case ContextType.TYPE_CLOCK:
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                case OperatorType.TYPE_LOGIC_EQUAL:
                case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                case OperatorType.TYPE_LOGIC_NOT:
                case OperatorType.TYPE_LOGIC_AND:
                case OperatorType.TYPE_LOGIC_OR:
                    break;
                case ContextType.TYPE_CONSTANT:
                    identifier = arr.shift(); // identifier
                    break;
                case ContextType.TYPE_WITNESS_ID: // add to constant 
                case ValueType.TYPE_ADDRESS:
                    value = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                    arr.splice(0, 32); // address     
                    break;
                case ValueType.TYPE_BOOL:
                case ValueType.TYPE_U8:
                    value = Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.shift();
                    break;
                case ValueType.TYPE_U64:
                    value = Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, 8);
                    break;
                case ValueType.TYPE_U128:
                    value = Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, 16);
                    break;
                case ValueType.TYPE_U256:
                    value = Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, 32);
                    break;
                case ValueType.TYPE_VEC_U8:
                case ValueType.TYPE_VEC_BOOL:
                case ValueType.TYPE_STRING:
                    let r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, r.value + r.length);
                    break;
                case ValueType.TYPE_VEC_ADDRESS:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, r.value * 32 + r.length);
                    break;
                case ValueType.TYPE_VEC_U128:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, r.value * 16 + r.length);
                    break;
                case ValueType.TYPE_VEC_U256:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, r.value * 32 + r.length);
                    break;
                case ValueType.TYPE_VEC_U64:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, r.value * 8 + r.length);
                    break;
                case ValueType.TYPE_VEC_VEC_U8:
                case ValueType.TYPE_VEC_STRING:
                    r = ulebDecode(Uint8Array.from(arr));
                    arr.splice(0, r.length);
                    let res = [];
                    for (let i = 0; i < r.value; i++) {
                        let r2 = ulebDecode(Uint8Array.from(arr));
                        res.push(Bcs.getInstance().de(ValueType.TYPE_VEC_U8, Uint8Array.from(arr)));
                        arr.splice(0, r2.length + r2.value);
                    }
                    value = res;
                    break;
                case OperatorType.TYPE_QUERY:
                    let t = arr.splice(0, 1); // data-type
                    if (t[0] == ValueType.TYPE_ADDRESS || t[0] == ContextType.TYPE_WITNESS_ID) {
                        let addr = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                        arr.splice(0, 32); // address            
                        value = addr;
                        cmd = arr.shift(); // cmd
                    }
                    else if (t[0] == ContextType.TYPE_CONSTANT) {
                        let id = arr.splice(0, 1); // key
                        let v = constants.find((v) => (v.identifier == id[0]) &&
                            ((v.type == ValueType.TYPE_ADDRESS) || (v.type == ContextType.TYPE_WITNESS_ID)));
                        if (!v) {
                            ERROR(Errors.Fail, 'GuardObject: indentifier not in  constant');
                        }
                        identifier = id[0];
                        cmd = arr.shift(); // cmd
                    }
                    else {
                        ERROR(Errors.Fail, 'GuardObject: constant type invalid');
                    }
                    break;
                case ValueType.TYPE_OPTION_ADDRESS:
                    let read = readOption(arr, ValueType.TYPE_ADDRESS);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 32);
                    break;
                case ValueType.TYPE_OPTION_BOOL:
                    read = readOption(arr, ValueType.TYPE_BOOL);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 1);
                    break;
                case ValueType.TYPE_OPTION_U8:
                    read = readOption(arr, ValueType.TYPE_U8);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 1);
                    break;
                case ValueType.TYPE_OPTION_U128:
                    read = readOption(arr, ValueType.TYPE_U128);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 16);
                    break;
                case ValueType.TYPE_OPTION_U256:
                    read = readOption(arr, ValueType.TYPE_U256);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 32);
                    break;
                case ValueType.TYPE_OPTION_U64:
                    read = readOption(arr, ValueType.TYPE_U64);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 8);
                    break;
                case ValueType.TYPE_OPTION_STRING:
                    read = readOptionString(arr); // splice in it
                    value = read.value;
                    break;
                default:
                    ERROR(Errors.Fail, 'GuardObject: parse_bcs types');
            }
            data.push({ type: type, value: value, cmd: cmd, identifier: identifier, child: [] });
        }
        // console.log(data);
        if (!data || data.length == 0)
            ERROR(Errors.Fail, 'GuardObject: data parsed error');
        let stack = [];
        data.forEach((d) => {
            this.ResolveData(constants, stack, d);
        });
        if (stack.length != 1) {
            ERROR(Errors.Fail, 'GuardObject: parse error');
        }
        return { object: stack.pop(), constant: constants };
    };
    /// convert guard-on-chain to js object
    static DeGuardObject = async (protocol, guard) => {
        if (!IsValidAddress(guard)) {
            ERROR(Errors.IsValidAddress, 'GuardObject guard');
        }
        let res = await protocol.Query_Raw([guard]);
        if (res.length == 0 || !res[0].data || res[0].data?.objectId != guard) {
            ERROR(Errors.Fail, 'GuardObject query error');
        }
        // console.log(res[0].data?.content);
        let content = res[0].data.content;
        if (content?.type != protocol.Package() + '::guard::Guard') {
            ERROR(Errors.Fail, 'GuardObject object invalid');
        }
        return GuardParser.DeGuardObject_FromData(content.fields.constants, content.fields.input.fields.bytes);
    };
    static ResolveData = (constants, stack, current) => {
        switch (current.type) {
            case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                current.ret_type = ValueType.TYPE_BOOL;
                return;
            case OperatorType.TYPE_LOGIC_NOT:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < 1)
                    ERROR(Errors.Fail, 'ResolveData: TYPE_LOGIC_NOT');
                let param = stack.pop();
                if (!param.ret_type || param.ret_type != ValueType.TYPE_BOOL) {
                    ERROR(Errors.Fail, 'ResolveData: TYPE_LOGIC_NOT type invalid');
                }
                current.child.push(param);
                stack.push(current);
                return;
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < 2)
                    ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                for (let i = 0; i < 2; ++i) {
                    let p = stack.pop();
                    if (!p.ret_type)
                        ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    if (p.ret_type != ValueType.TYPE_U8 && p.ret_type != ValueType.TYPE_U64 &&
                        p.ret_type != ValueType.TYPE_U128 && p.ret_type != ValueType.TYPE_U256) {
                        ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    }
                    ;
                    current.child.push(p);
                }
                stack.push(current);
                return;
            case OperatorType.TYPE_LOGIC_EQUAL:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < 2)
                    ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                var p1 = stack.pop();
                var p2 = stack.pop();
                if (!p1.ret_type || !p2.ret_type)
                    ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                if (p1.ret_type != p2.ret_type)
                    ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' param type not match');
                current.child.push(p1);
                current.child.push(p2);
                stack.push(current);
                return;
            case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < 2)
                    ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                var p1 = stack.pop();
                var p2 = stack.pop();
                if (!p1.ret_type || !p2.ret_type)
                    ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                if (p1.ret_type != ValueType.TYPE_VEC_U8 || p2.ret_type != ValueType.TYPE_VEC_U8) {
                    ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' param type not match');
                }
                current.child.push(p1);
                current.child.push(p2);
                stack.push(current);
                return;
            case OperatorType.TYPE_LOGIC_AND:
            case OperatorType.TYPE_LOGIC_OR:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < 2)
                    ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                var p1 = stack.pop();
                var p2 = stack.pop();
                if (!p1.ret_type || !p2.ret_type)
                    ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                if (p1.ret_type != ValueType.TYPE_BOOL || p2.ret_type != ValueType.TYPE_BOOL) {
                    ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' param type not match');
                }
                current.child.push(p1);
                current.child.push(p2);
                stack.push(current);
                return;
            case OperatorType.TYPE_QUERY:
                if (!current?.cmd)
                    ERROR(Errors.Fail, 'OperateParamCount: cmd invalid ' + current.type);
                let r = Guard.GetCmd(current.cmd);
                if (!r)
                    ERROR(Errors.Fail, 'OperateParamCount: cmd not supported ' + current.type);
                current.ret_type = r[4];
                if (stack.length < r[3].length)
                    ERROR(Errors.Fail, 'OperateParamCount: cmd param lost ' + current.type);
                r[3].forEach((e) => {
                    let d = stack.pop();
                    if (!d?.ret_type || d.ret_type != e) {
                        ERROR(Errors.Fail, 'OperateParamCount: cmd param not match ' + current.type);
                    }
                    current.child.push(d);
                });
                stack.push(current);
                return;
            case ValueType.TYPE_ADDRESS:
            case ValueType.TYPE_BOOL:
            case ValueType.TYPE_U128:
            case ValueType.TYPE_U256:
            case ValueType.TYPE_U64:
            case ValueType.TYPE_U8:
            case ValueType.TYPE_VEC_ADDRESS:
            case ValueType.TYPE_VEC_BOOL:
            case ValueType.TYPE_VEC_U128:
            case ValueType.TYPE_VEC_U256:
            case ValueType.TYPE_VEC_U64:
            case ValueType.TYPE_VEC_U8:
            case ValueType.TYPE_VEC_VEC_U8:
            case ValueType.TYPE_OPTION_ADDRESS:
            case ValueType.TYPE_OPTION_BOOL:
            case ValueType.TYPE_OPTION_U128:
            case ValueType.TYPE_OPTION_U256:
            case ValueType.TYPE_OPTION_U64:
            case ValueType.TYPE_OPTION_U8:
                current.ret_type = current.type;
                stack.push(current);
                return;
            case ContextType.TYPE_CLOCK:
                current.ret_type = ValueType.TYPE_U64;
                stack.push(current);
                return;
            case ContextType.TYPE_SIGNER:
            case ContextType.TYPE_WITNESS_ID: /// notice!! convert witness type to address type
                current.ret_type = ValueType.TYPE_ADDRESS;
                stack.push(current);
                return;
            case ContextType.TYPE_CONSTANT:
                let v = constants.find((e) => e.identifier == current?.identifier);
                if (!v)
                    ERROR(Errors.Fail, 'OperateParamCount: identifier  invalid ' + current.type);
                current.ret_type = v?.type;
                if (v?.type == ContextType.TYPE_WITNESS_ID) {
                    current.ret_type = ValueType.TYPE_ADDRESS;
                }
                stack.push(current);
                return;
        }
        ERROR(Errors.Fail, 'OperateParamCount: type  invalid ' + current.type);
    };
    /// create GuardParser ayncly
    static CreateAsync = async (protocol, guards) => {
        if (!IsValidArray(guards, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guards');
        }
        let guard_list = array_unique(guards);
        const me = new GuardParser(protocol, guards);
        let res = await protocol.Query_Raw(guard_list);
        res.forEach((r) => {
            let c = r.data?.content;
            if (!c)
                return;
            let index = protocol.WOWOK_OBJECTS_TYPE().findIndex(v => { return v.includes('guard::Guard') && v == c.type; });
            if (index == -1)
                return;
            let info = { id: c.fields.id.id, query_list: [], constant: [], input_witness: [] };
            me.parse_constant(info, c.fields.constants);
            if (c.fields.input.type == (protocol.Package() + '::bcs::BCS')) {
                me.parse_bcs(info, Uint8Array.from(c.fields.input.fields.bytes));
            }
            me.guard_list.push(info);
        });
        return me;
    };
    parse_constant = (info, constants) => {
        constants.forEach((v) => {
            if (v.type == (this.protocol.Package() + '::guard::Constant')) {
                // ValueType.TYPE_ADDRESS: Query_Cmd maybe used the address, so save it for using
                if (v.fields.type == ContextType.TYPE_WITNESS_ID || v.fields.type == ValueType.TYPE_ADDRESS) {
                    info.constant.push({ identifier: v.fields.identifier, index: this.get_index(), type: v.fields.type,
                        value_or_witness: '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(v.fields.value)) });
                }
            }
        });
    };
    parse_bcs = (info, chain_bytes) => {
        var arr = [].slice.call(chain_bytes.reverse());
        while (arr.length > 0) {
            var type = arr.shift();
            // console.log(type);
            switch (type) {
                case ContextType.TYPE_SIGNER:
                case ContextType.TYPE_CLOCK:
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                case OperatorType.TYPE_LOGIC_EQUAL:
                case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                case OperatorType.TYPE_LOGIC_NOT:
                case OperatorType.TYPE_LOGIC_AND:
                case OperatorType.TYPE_LOGIC_OR:
                    break;
                case ContextType.TYPE_CONSTANT:
                    arr.splice(0, 1); // identifier of constant
                    break;
                case ContextType.TYPE_WITNESS_ID: // add to constant 
                    let addr = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                    arr.splice(0, 32); // address     
                    info.input_witness.push({ index: this.get_index(), type: ContextType.TYPE_WITNESS_ID, value_or_witness: addr });
                    break;
                case ValueType.TYPE_BOOL:
                case ValueType.TYPE_U8:
                    arr.splice(0, 1); // identifier
                    break;
                case ValueType.TYPE_ADDRESS:
                    arr.splice(0, 32);
                    break;
                case ValueType.TYPE_U64:
                    arr.splice(0, 8);
                    break;
                case ValueType.TYPE_U128:
                    arr.splice(0, 16);
                    break;
                case ValueType.TYPE_U256:
                    arr.splice(0, 32);
                    break;
                case ValueType.TYPE_VEC_U8:
                    let { value, length } = ulebDecode(Uint8Array.from(arr));
                    arr.splice(0, value + length);
                    break;
                case OperatorType.TYPE_QUERY:
                    let type = arr.splice(0, 1);
                    if (type[0] == ValueType.TYPE_ADDRESS || type[0] == ContextType.TYPE_WITNESS_ID) {
                        let addr = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                        arr.splice(0, 33); // address + cmd              
                        if (type[0] == ValueType.TYPE_ADDRESS) {
                            info.query_list.push(addr);
                        }
                        else if (type[0] == ContextType.TYPE_WITNESS_ID) {
                            info.query_list.push({ index: this.get_index(), type: type[0], value_or_witness: addr });
                        }
                    }
                    else if (type[0] == ContextType.TYPE_CONSTANT) {
                        let identifer = arr.splice(0, 2); // key + cmd
                        let constant = info.constant.find((v) => (v.identifier == identifer[0]) &&
                            ((v.type == ValueType.TYPE_ADDRESS) || (v.type == ContextType.TYPE_WITNESS_ID)));
                        if (!constant) {
                            ERROR(Errors.Fail, 'indentifier not in  constant');
                        }
                        if (constant?.type == ValueType.TYPE_ADDRESS) {
                            info.query_list.push(constant.value_or_witness);
                        }
                        else if (constant?.type == ContextType.TYPE_WITNESS_ID) {
                            info.query_list.push({ identifier: identifer[0], type: constant.type, value_or_witness: constant.value_or_witness, index: this.get_index() });
                        }
                    }
                    else {
                        ERROR(Errors.Fail, 'constant type invalid');
                    }
                    break;
                default:
                    ERROR(Errors.Fail, 'parse_bcs types');
            }
        }
    };
    get_object(guardid, info, fill) {
        let r = fill?.find(i => guardid == i.guard && i.index == info.index);
        if (!r || !r.future) {
            if (!info.future) {
                ERROR(Errors.InvalidParam, 'index invalid for fill');
            }
        }
        else {
            info.future = r.future;
        }
        return info.future;
    }
    done = async (fill) => {
        let objects = [];
        this.guard_list.forEach((g) => {
            g.constant.filter(v => v.type == ContextType.TYPE_WITNESS_ID).forEach((q) => {
                objects.push(this.get_object(g.id, q, fill));
            });
            let list = g.query_list.map((q) => {
                if (typeof (q) === "string") {
                    objects.push(q);
                    return q;
                }
                else {
                    let r = this.get_object(g.id, q, fill);
                    objects.push(r);
                    return r;
                }
            });
            g.query_list = list;
            g.input_witness.forEach((q) => {
                objects.push(this.get_object(g.id, q, fill));
            });
        });
        // objects info
        let res = await this.protocol.Query_Raw(array_unique(objects), { showType: true });
        let query = [];
        let witness = [];
        this.guard_list.forEach(g => {
            g.query_list.forEach(q => {
                let r = res.find(r => r.data?.objectId == q);
                if (!r) {
                    ERROR(Errors.Fail, 'query object not match');
                }
                let object = this.object_query(r.data);
                if (!object) {
                    ERROR(Errors.Fail, 'query object fail');
                }
                query.push(object);
            });
            res.forEach(q => {
                let r1 = g.constant.find(v => v.future == q.data?.objectId);
                let r2 = g.input_witness.find(v => v.future == q.data?.objectId);
                // not match r1 || r2 means query-cmd, not witness-cmd
                if (r1 || r2) {
                    let object = this.object_query(q.data, 'witness');
                    if (!object) {
                        ERROR(Errors.Fail, 'witness object fail');
                    }
                    witness.push(object);
                }
            });
        });
        return { guard: this.guards, query: query, witness: witness };
    };
    object_query = (data, method = 'guard_query') => {
        for (let k = 0; k < this.protocol.WOWOK_OBJECTS_TYPE().length; k++) {
            if (data.type.includes(this.protocol.WOWOK_OBJECTS_TYPE()[k])) { // type: pack::m::Object<...>
                return { target: this.protocol.WOWOK_OBJECTS_PREFIX_TYPE()[k] + method,
                    object: Inputs.SharedObjectRef({
                        objectId: data.objectId,
                        mutable: false,
                        initialSharedVersion: data.version,
                    }),
                    types: parse_object_type(data.type),
                    id: data.objectId, };
            }
        }
    };
}
export class Passport {
    static MAX_GUARD_COUNT = 8;
    passport;
    protocol;
    get_object() { return this.passport; }
    // return passport object used
    constructor(protocol, query) {
        if (!query.guard || query.guard.length > Passport.MAX_GUARD_COUNT) {
            ERROR(Errors.InvalidParam, 'guards');
        }
        if (!Protocol.IsValidObjects(query.guard)) {
            ERROR(Errors.IsValidObjects, 'guards');
        }
        this.protocol = protocol;
        let txb = protocol.CurrentSession();
        this.passport = txb.moveCall({
            target: protocol.PassportFn('new'),
            arguments: []
        });
        // add others guards, if any
        query.guard.forEach((g) => {
            txb.moveCall({
                target: protocol.PassportFn('guard_add'),
                arguments: [this.passport, Protocol.TXB_OBJECT(txb, g)]
            });
        });
        // witness
        query?.witness.forEach((w) => {
            txb.moveCall({
                target: w.target,
                arguments: [this.passport, txb.object(w.object)],
                typeArguments: w.types,
            });
        });
        // rules: 'verify' & 'query' in turns；'verify' at final end.
        query?.query.forEach((q) => {
            let address = txb.moveCall({
                target: protocol.PassportFn('passport_verify'),
                arguments: [this.passport, txb.object(Protocol.CLOCK_OBJECT)]
            });
            txb.moveCall({
                target: q.target,
                arguments: [txb.object(q.object), this.passport, address],
                typeArguments: q.types,
            });
        });
        txb.moveCall({
            target: protocol.PassportFn('passport_verify'),
            arguments: [this.passport, txb.object(Protocol.CLOCK_OBJECT)]
        });
    }
    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.PassportFn('destroy'),
            arguments: [this.passport]
        });
    }
    freeze() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.PassportFn('freezen'),
            arguments: [this.passport]
        });
    }
}
