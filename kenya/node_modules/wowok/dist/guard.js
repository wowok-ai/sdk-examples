import { BCS } from '@mysten/bcs';
import { MODULES, ContextType, ValueType, OperatorType, SER_VALUE } from './protocol';
import { concatenate, array_equal } from './utils';
import { IsValidDesription, Bcs, IsValidInt, IsValidAddress } from './utils';
import { ERROR, Errors } from './exception';
export class Guard {
    static MAX_INPUT_LENGTH = 2048;
    static launch(protocol, description, maker) {
        if (!maker.IsReady()) {
            ERROR(Errors.InvalidParam, 'launch maker');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let bcs_input = maker.get_input()[0];
        let constants = maker.get_constant();
        if (bcs_input.length == 0 || bcs_input.length > Guard.MAX_INPUT_LENGTH) {
            ERROR(Errors.InvalidParam, 'launch input');
        }
        let bValid = true;
        constants?.forEach((v, k) => {
            if (!GuardConstantHelper.IsValidIndentifier(k))
                bValid = false;
            if (!v.value && !v.witness)
                bValid = false;
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'launch constants');
        }
        let txb = protocol.CurrentSession();
        let input = new Uint8Array(bcs_input); // copy new uint8array to reserve!
        // reserve the  bytes for guard
        let guard = txb.moveCall({
            target: protocol.GuardFn('new'),
            arguments: [txb.pure(description, BCS.STRING), txb.pure([].slice.call(input.reverse()))],
        });
        constants?.forEach((v, k) => {
            if (v.type == ContextType.TYPE_WITNESS_ID) {
                if (!v.witness) {
                    ERROR(Errors.InvalidParam, 'constants type');
                }
                txb.moveCall({
                    target: protocol.GuardFn("constant_add"),
                    arguments: [guard, txb.pure(k, BCS.U8), txb.pure(v.type, BCS.U8), txb.pure([].slice.call(v.witness)), txb.pure(true, BCS.BOOL)]
                });
            }
            else {
                if (!v.value) {
                    ERROR(Errors.InvalidParam, 'constants type');
                }
                txb.moveCall({
                    target: protocol.GuardFn("constant_add"),
                    arguments: [guard, txb.pure(k, BCS.U8), txb.pure(v.type, BCS.U8), txb.pure([].slice.call(v.value)), txb.pure(true, BCS.BOOL)]
                });
            }
        });
        return txb.moveCall({
            target: protocol.GuardFn("create"),
            arguments: [guard]
        });
    }
    static signer_guard(protocol) {
        return protocol.CurrentSession().moveCall({
            target: protocol.GuardFn('signer_guard'),
            arguments: []
        });
    }
    static everyone_guard(protocol) {
        return protocol.CurrentSession().moveCall({
            target: protocol.GuardFn('everyone_guard'),
            arguments: []
        });
    }
    static QUERIES = [
        // module, 'name', 'id', [input], output
        [MODULES.permission, 'builder', 1, [], ValueType.TYPE_ADDRESS],
        [MODULES.permission, 'is_admin', 2, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.permission, 'has_rights', 3, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL],
        [MODULES.permission, 'contains_address', 4, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.permission, 'contains_index', 5, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL],
        [MODULES.permission, 'contains_guard', 6, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL],
        [MODULES.permission, 'contains_guard', 7, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_ADDRESS],
        [MODULES.permission, 'entity_count', 8, [], ValueType.TYPE_U64],
        [MODULES.permission, 'admin_count', 9, [], ValueType.TYPE_U64],
        [MODULES.repository, 'permission', 11, [], ValueType.TYPE_ADDRESS],
        [MODULES.repository, 'policy_contains', 12, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.repository, 'policy_has_permission_index', 13, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.repository, 'policy_permission_index', 14, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64],
        [MODULES.repository, 'policy_value_type', 15, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U8],
        [MODULES.repository, 'contains_id', 16, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.repository, 'contains_value', 17, [ValueType.TYPE_ADDRESS, ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.repository, 'value_without_type', 18, [ValueType.TYPE_ADDRESS, ValueType.TYPE_VEC_U8], ValueType.TYPE_VEC_U8],
        [MODULES.repository, 'value', 19, [ValueType.TYPE_ADDRESS, ValueType.TYPE_VEC_U8], ValueType.TYPE_VEC_U8],
        [MODULES.repository, 'type', 20, [], ValueType.TYPE_U8],
        [MODULES.repository, 'policy_mode', 21, [], ValueType.TYPE_U8],
        [MODULES.repository, 'reference_count', 22, [], ValueType.TYPE_U64],
        [MODULES.repository, 'has_reference', 23, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.machine, 'permission', 31, [], ValueType.TYPE_ADDRESS],
        [MODULES.machine, 'has_paused', 32, [], ValueType.TYPE_BOOL],
        [MODULES.machine, 'has_published', 33, [], ValueType.TYPE_BOOL],
        [MODULES.machine, 'consensus_repositories_contains', 34, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.machine, 'has_endpoint', 35, [], ValueType.TYPE_BOOL],
        [MODULES.machine, 'endpoint', 36, [], ValueType.TYPE_VEC_U8],
        [MODULES.progress, 'machine', 51, [], ValueType.TYPE_ADDRESS],
        [MODULES.progress, 'current', 52, [], ValueType.TYPE_VEC_U8],
        [MODULES.progress, 'has_parent', 53, [], ValueType.TYPE_BOOL],
        [MODULES.progress, 'parent', 54, [], ValueType.TYPE_ADDRESS],
        [MODULES.progress, 'has_task', 55, [], ValueType.TYPE_BOOL],
        [MODULES.progress, 'task', 56, [], ValueType.TYPE_ADDRESS],
        [MODULES.progress, 'has_namedOperator', 57, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.progress, 'namedOperator_contains', 58, [ValueType.TYPE_VEC_U8, ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.progress, 'has_context_repository', 59, [], ValueType.TYPE_BOOL],
        [MODULES.progress, 'context_repository', 60, [], ValueType.TYPE_ADDRESS],
        [MODULES.demand, 'permission', 71, [], ValueType.TYPE_ADDRESS],
        [MODULES.demand, 'has_time_expire', 72, [], ValueType.TYPE_BOOL],
        [MODULES.demand, 'time_expire', 73, [], ValueType.TYPE_U64],
        [MODULES.demand, 'earnest_count', 74, [], ValueType.TYPE_U64],
        [MODULES.demand, 'has_guard', 75, [], ValueType.TYPE_BOOL],
        [MODULES.demand, 'guard', 76, [], ValueType.TYPE_ADDRESS],
        [MODULES.demand, 'has_yes', 77, [], ValueType.TYPE_BOOL],
        [MODULES.demand, 'yes', 78, [], ValueType.TYPE_ADDRESS],
        [MODULES.demand, 'presenters_count', 79, [], ValueType.TYPE_U64],
        [MODULES.demand, 'has_presenter', 80, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.demand, 'persenter', 81, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS],
        [MODULES.order, 'amount', 91, [], ValueType.TYPE_U64],
        [MODULES.order, 'payer', 92, [], ValueType.TYPE_ADDRESS],
        [MODULES.order, 'service', 93, [], ValueType.TYPE_ADDRESS],
        [MODULES.order, 'has_progress', 94, [], ValueType.TYPE_BOOL],
        [MODULES.order, 'progress', 95, [], ValueType.TYPE_ADDRESS],
        [MODULES.order, 'has_requred_info', 96, [], ValueType.TYPE_BOOL],
        [MODULES.order, 'requred_info_service_pubkey', 97, [], ValueType.TYPE_VEC_U8],
        [MODULES.order, 'requred_info_customer_pubkey', 98, [], ValueType.TYPE_VEC_U8],
        [MODULES.order, 'requred_info_info', 99, [], ValueType.TYPE_VEC_VEC_U8],
        [MODULES.order, 'has_discount', 100, [], ValueType.TYPE_BOOL],
        [MODULES.order, 'discount', 101, [], ValueType.TYPE_ADDRESS],
        [MODULES.order, 'balance', 102, [], ValueType.TYPE_U64],
        [MODULES.order, 'bRefunded', 103, [], ValueType.TYPE_U8],
        [MODULES.order, 'bWithdrawed', 104, [], ValueType.TYPE_U8],
        [MODULES.service, 'permission', 111, [], ValueType.TYPE_ADDRESS],
        [MODULES.service, 'payee', 112, [], ValueType.TYPE_ADDRESS],
        [MODULES.service, 'has_buy_guard', 113, [], ValueType.TYPE_BOOL],
        [MODULES.service, 'buy_guard', 114, [], ValueType.TYPE_ADDRESS],
        [MODULES.service, 'repository_contains', 115, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.service, 'has_withdraw_guard', 116, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.service, 'withdraw_guard_percent', 117, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.service, 'has_refund_guard', 118, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.service, 'refund_guard_percent', 119, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.service, 'has_sale', 120, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.service, 'sale_price', 121, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64],
        [MODULES.service, 'sale_stock', 122, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64],
        [MODULES.service, 'has_machine', 123, [], ValueType.TYPE_BOOL],
        [MODULES.service, 'machine', 124, [], ValueType.TYPE_ADDRESS],
        [MODULES.service, 'bPaused', 125, [], ValueType.TYPE_BOOL],
        [MODULES.service, 'bPublished', 126, [], ValueType.TYPE_BOOL],
        [MODULES.service, 'has_required', 127, [], ValueType.TYPE_BOOL],
        [MODULES.service, 'requrired_pubkey', 128, [], ValueType.TYPE_VEC_U8],
        [MODULES.service, 'requrired_info', 129, [], ValueType.TYPE_VEC_VEC_U8],
        [MODULES.reward, 'permission', 151, [], ValueType.TYPE_ADDRESS],
        [MODULES.reward, 'rewards_count_remain', 152, [], ValueType.TYPE_U64],
        [MODULES.reward, 'rewards_count_supplied', 153, [], ValueType.TYPE_U64],
        [MODULES.reward, 'guard_count', 154, [], ValueType.TYPE_U64],
        [MODULES.reward, 'has_guard', 155, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.reward, 'guard_portions', 156, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.reward, 'time_expire', 157, [], ValueType.TYPE_U64],
        [MODULES.reward, 'has_claimed', 158, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.reward, 'claimed', 159, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.reward, 'has_claimed_count', 160, [], ValueType.TYPE_U64],
        [MODULES.reward, 'is_sponsor', 161, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.reward, 'sponsor', 162, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.reward, 'sponsor_count', 163, [], ValueType.TYPE_U64],
        [MODULES.reward, 'bAllowRepeatClaim', 164, [], ValueType.TYPE_BOOL],
        [MODULES.reward, 'claimed_portions_count', 165, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.vote, 'permission', 171, [], ValueType.TYPE_ADDRESS],
        [MODULES.vote, 'bOptions_locked_for_voting', 172, [], ValueType.TYPE_BOOL],
        [MODULES.vote, 'bdeadline_locked', 173, [], ValueType.TYPE_BOOL],
        [MODULES.vote, 'bLockedGuard', 174, [], ValueType.TYPE_BOOL],
        [MODULES.vote, 'max_choice_count', 175, [], ValueType.TYPE_U8],
        [MODULES.vote, 'deadline', 176, [], ValueType.TYPE_U64],
        [MODULES.vote, 'has_reference', 177, [], ValueType.TYPE_BOOL],
        [MODULES.vote, 'reference', 178, [], ValueType.TYPE_ADDRESS],
        [MODULES.vote, 'has_guard', 179, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.vote, 'guard', 180, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.vote, 'voted', 181, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.vote, 'voted_weight', 182, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.vote, 'has_agree', 183, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.vote, 'agree_has_object', 184, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.vote, 'agree_object', 185, [ValueType.TYPE_VEC_U8], ValueType.TYPE_ADDRESS],
        [MODULES.vote, 'agree_count', 186, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64],
        [MODULES.vote, 'agree_votes', 187, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64],
        [MODULES.vote, 'voted_count', 188, [], ValueType.TYPE_U64],
        [MODULES.vote, 'top1_name_by_count', 189, [], ValueType.TYPE_VEC_U8],
        [MODULES.vote, 'top1_count', 190, [], ValueType.TYPE_U64],
        [MODULES.vote, 'top1_name_by_votes', 191, [], ValueType.TYPE_VEC_U8],
        [MODULES.vote, 'top1_votes', 192, [], ValueType.TYPE_U64],
        [MODULES.wowok, 'initor', 210, [], ValueType.TYPE_ADDRESS],
        [MODULES.wowok, 'everyone_guard', 211, [], ValueType.TYPE_ADDRESS],
        [MODULES.wowok, 'entities', 212, [], ValueType.TYPE_ADDRESS],
        [MODULES.wowok, 'grantor_count', 213, [], ValueType.TYPE_U64],
        [MODULES.wowok, 'has_grantor', 214, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.wowok, 'grantor_name', 215, [ValueType.TYPE_ADDRESS], ValueType.TYPE_VEC_U8],
        [MODULES.wowok, 'grantor_register_time', 216, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.wowok, 'grantor_expired_time', 217, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.wowok, 'grantor_grantee', 218, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS],
        [MODULES.entity, 'has_entity', 230, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.entity, 'entity_like', 231, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.entity, 'entity_dislike', 232, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.entity, 'entity_infomation', 233, [ValueType.TYPE_ADDRESS], ValueType.TYPE_VEC_U8],
    ];
    static BoolCmd = Guard.QUERIES.filter(q => q[4] == ValueType.TYPE_BOOL);
    static IsBoolCmd = (cmd) => { return Guard.BoolCmd.includes((q) => { return q[2] == cmd; }); };
    static GetCmd = (cmd) => {
        return Guard.QUERIES.find((q) => { return q[2] == cmd; });
    };
}
export class GuardConstantHelper {
    static IsValidIndentifier = (identifier) => {
        if (!IsValidInt(identifier) || identifier > 255)
            return false;
        return true;
    };
    static get_constant_value(constants, identifier, type) {
        if (constants.has(identifier)) {
            let v = constants.get(identifier);
            if (v?.value && v.type == type) {
                return v.value;
            }
        }
    }
    static get_constant_witness(constants, identifier) {
        if (constants.has(identifier)) {
            let v = constants.get(identifier);
            if (v?.witness && v.type == ContextType.TYPE_WITNESS_ID) {
                return v.witness;
            }
        }
    }
    static add_future_constant(constants, identifier, witness, value, bNeedSerialize = true) {
        if (!GuardConstantHelper.IsValidIndentifier(identifier))
            ERROR(Errors.IsValidIndentifier, 'add_future_constant');
        if (!witness && !value)
            ERROR(Errors.InvalidParam, 'both witness and value invalid');
        let v = constants.get(identifier);
        if (!v || v.type == ContextType.TYPE_WITNESS_ID) {
            if (bNeedSerialize) {
                constants.set(identifier, { type: ContextType.TYPE_WITNESS_ID, value: value ? Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, value) : undefined,
                    witness: witness ? Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, witness) : undefined });
            }
            else {
                constants.set(identifier, { type: ContextType.TYPE_WITNESS_ID, value: value ? value : undefined, witness: witness ? witness : undefined });
            }
        }
    }
    static add_constant(constants, identifier, type, value, bNeedSerialize = true) {
        if (!GuardConstantHelper.IsValidIndentifier(identifier))
            return false;
        if (!value)
            return false;
        switch (type) {
            case ValueType.TYPE_BOOL:
            case ValueType.TYPE_ADDRESS:
            case ValueType.TYPE_U64:
            case ValueType.TYPE_U8:
            case ValueType.TYPE_U128:
            case ValueType.TYPE_U256:
            case ValueType.TYPE_VEC_U64:
            case ValueType.TYPE_VEC_VEC_U8:
            case ValueType.TYPE_OPTION_ADDRESS:
            case ValueType.TYPE_OPTION_BOOL:
            case ValueType.TYPE_OPTION_U128:
            case ValueType.TYPE_OPTION_U256:
            case ValueType.TYPE_OPTION_U64:
            case ValueType.TYPE_OPTION_U8:
            case ValueType.TYPE_VEC_ADDRESS:
            case ValueType.TYPE_VEC_BOOL:
            case ValueType.TYPE_VEC_U128:
            case ValueType.TYPE_VEC_U256:
                let ser = SER_VALUE.find(s => s.type == type);
                if (!ser)
                    ERROR(Errors.Fail, 'add_constant: invalid type');
                bNeedSerialize ? constants.set(identifier, { type: type, value: Bcs.getInstance().ser(ser.type, value) }) :
                    constants.set(identifier, { type: type, value: value });
                return;
            case ValueType.TYPE_VEC_U8:
                if (typeof (value) === 'string') {
                    constants.set(identifier, { type: type, value: Bcs.getInstance().ser(ValueType.TYPE_STRING, value) });
                }
                else {
                    constants.set(identifier, { type: type, value: value });
                }
                return;
            default:
                ERROR(Errors.Fail, 'add_constant  serialize not impl yet');
        }
    }
}
export class GuardMaker {
    data = [];
    type_validator = [];
    constant = new Map();
    static index = 0;
    static get_index() {
        if (GuardMaker.index == 256) {
            GuardMaker.index = 0;
        }
        return GuardMaker.index++;
    }
    constructor() { }
    add_constant(type, value, bNeedSerialize = true) {
        let identifier = GuardMaker.get_index();
        if (type == ContextType.TYPE_WITNESS_ID) {
            // add witness to constant
            GuardConstantHelper.add_future_constant(this.constant, identifier, value, undefined, bNeedSerialize);
        }
        else {
            GuardConstantHelper.add_constant(this.constant, identifier, type, value, bNeedSerialize);
        }
        return identifier;
    }
    serValueParam(type, param) {
        if (!param)
            ERROR(Errors.InvalidParam, 'param');
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
        let ser = SER_VALUE.find(s => s.type == type);
        if (!ser)
            ERROR(Errors.Fail, 'serValueParam: invalid type');
        this.data.push(Bcs.getInstance().ser(ser.type, param));
        this.type_validator.push(type);
    }
    // serialize const & data
    add_param(type, param) {
        switch (type) {
            case ValueType.TYPE_ADDRESS:
            case ValueType.TYPE_BOOL:
            case ValueType.TYPE_U8:
            case ValueType.TYPE_U64:
            case ValueType.TYPE_U128:
            case ValueType.TYPE_U256:
            case ValueType.TYPE_VEC_ADDRESS:
            case ValueType.TYPE_VEC_BOOL:
            case ValueType.TYPE_VEC_U128:
            case ValueType.TYPE_VEC_U64:
            case ValueType.TYPE_VEC_VEC_U8:
            case ValueType.TYPE_OPTION_U64:
            case ValueType.TYPE_OPTION_ADDRESS:
            case ValueType.TYPE_OPTION_BOOL:
            case ValueType.TYPE_OPTION_U128:
            case ValueType.TYPE_OPTION_U256:
            case ValueType.TYPE_OPTION_U8:
            case ValueType.TYPE_VEC_U256:
                this.serValueParam(type, param);
                break;
            case ValueType.TYPE_VEC_U8:
                if (!param)
                    ERROR(Errors.InvalidParam, 'param');
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
                if (typeof (param) == 'string') {
                    this.data.push(Bcs.getInstance().ser(ValueType.TYPE_STRING, param));
                }
                else {
                    this.data.push(Bcs.getInstance().ser(ValueType.TYPE_VEC_U8, param));
                }
                this.type_validator.push(type);
                break;
            case ContextType.TYPE_SIGNER:
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
                this.type_validator.push(ValueType.TYPE_ADDRESS);
                break;
            case ContextType.TYPE_CLOCK:
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
                this.type_validator.push(ValueType.TYPE_U64);
                break;
            case ContextType.TYPE_WITNESS_ID:
                if (!param)
                    ERROR(Errors.InvalidParam, 'param');
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, param));
                this.type_validator.push(ValueType.TYPE_ADDRESS);
                break;
            case ContextType.TYPE_CONSTANT:
                if (!param) {
                    ERROR(Errors.InvalidParam, 'param invalid');
                }
                if (typeof (param) != 'number' || !IsValidInt(param) || param > 255) {
                    ERROR(Errors.InvalidParam, 'add_param param');
                }
                var v = this.constant.get(param);
                if (!v)
                    ERROR(Errors.Fail, 'identifier not in constant');
                this.type_validator.push(v.type);
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, param));
                break;
            default:
                ERROR(Errors.InvalidParam, 'add_param type');
        }
        ;
        return this;
    }
    // object_address_from: string for static address; number as identifier  inconstant
    add_query(module, query_name, object_address_from, bWitness = false) {
        let query_index = Guard.QUERIES.findIndex((q) => { return q[0] == module && q[1] == query_name; });
        if (query_index == -1) {
            ERROR(Errors.InvalidParam, 'query_name');
        }
        if (typeof (object_address_from) == 'number') {
            if (!GuardConstantHelper.IsValidIndentifier(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from');
            }
        }
        else {
            if (!IsValidAddress(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from');
            }
        }
        let offset = this.type_validator.length - Guard.QUERIES[query_index][3].length;
        if (offset < 0) {
            ERROR(Errors.InvalidParam, 'query_name');
        }
        let types = this.type_validator.slice(offset);
        if (!array_equal(types, Guard.QUERIES[query_index][3])) { // type validate 
            ERROR(Errors.Fail, 'array_equal');
        }
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_QUERY)); // QUERY TYPE
        if (typeof (object_address_from) == 'string') {
            bWitness ? this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ContextType.TYPE_WITNESS_ID)) :
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ValueType.TYPE_ADDRESS));
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, object_address_from)); // object address            
        }
        else {
            let v = this.constant.get(object_address_from);
            if (!v)
                ERROR(Errors.Fail, 'object_address_from not in constant');
            if ((bWitness && v?.type == ContextType.TYPE_WITNESS_ID) || (!bWitness && v?.type == ValueType.TYPE_ADDRESS)) {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ContextType.TYPE_CONSTANT));
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, object_address_from)); // object identifer in constants
            }
            else {
                ERROR(Errors.Fail, 'type bWitness not match');
            }
        }
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, Guard.QUERIES[query_index][2])); // cmd
        this.type_validator.splice(offset, Guard.QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(Guard.QUERIES[query_index][4]); // add the return value type to type stack
        return this;
    }
    add_logic(type) {
        let splice_len = 2;
        switch (type) {
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                if (this.type_validator.length < splice_len) {
                    ERROR(Errors.Fail, 'type_validator.length');
                }
                if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - 1])) {
                    ERROR(Errors.Fail, 'type_validator check');
                }
                if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - 2])) {
                    ERROR(Errors.Fail, 'type_validator check');
                }
                break;
            case OperatorType.TYPE_LOGIC_EQUAL:
                if (this.type_validator.length < splice_len) {
                    ERROR(Errors.Fail, 'type_validator.length');
                }
                break;
            case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                if (this.type_validator.length < splice_len) {
                    ERROR(Errors.Fail, 'type_validator.length');
                }
                break;
            case OperatorType.TYPE_LOGIC_NOT:
                splice_len = 1;
                if (this.type_validator.length < splice_len) {
                    ERROR(Errors.Fail, 'type_validator.length');
                }
                if (this.type_validator[this.type_validator.length - 1] != ValueType.TYPE_BOOL) {
                    ERROR(Errors.Fail, 'type_validator check');
                }
                break;
            case OperatorType.TYPE_LOGIC_AND:
            case OperatorType.TYPE_LOGIC_OR:
                if (this.type_validator.length < splice_len) {
                    ERROR(Errors.Fail, 'type_validator.length');
                }
                if (this.type_validator[this.type_validator.length - 1] != ValueType.TYPE_BOOL) {
                    ERROR(Errors.Fail, 'type_validator check');
                }
                if (this.type_validator[this.type_validator.length - 2] != ValueType.TYPE_BOOL) {
                    ERROR(Errors.Fail, 'type_validator check');
                }
                break;
            default:
                ERROR(Errors.InvalidParam, 'type');
        }
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type)); // TYPE     
        this.type_validator.splice(this.type_validator.length - splice_len); // delete type stack   
        this.type_validator.push(ValueType.TYPE_BOOL); // add bool to type stack
        return this;
    }
    build(bNot = false) {
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != ValueType.TYPE_BOOL) {
            ERROR(Errors.Fail, 'type_validator check');
        } // ERROR
        if (bNot) {
            this.add_logic(OperatorType.TYPE_LOGIC_NOT);
        }
        this.data.push(concatenate(Uint8Array, ...this.data));
        this.data.splice(0, this.data.length - 1);
        return this;
    }
    IsReady() {
        return this.type_validator.length == 1 && this.type_validator[0] == ValueType.TYPE_BOOL && this.data.length == 1;
    }
    combine(otherBuilt, bAnd = true, bCombinConstant = false) {
        if (!otherBuilt.IsReady() || !this.IsReady()) {
            ERROR(Errors.Fail, 'both should built yet');
        }
        ;
        let maker = new GuardMaker();
        this.constant.forEach((v, k) => {
            maker.constant.set(k, { type: v.type, value: v.value, witness: v.witness });
        });
        otherBuilt.constant.forEach((v, k) => {
            if (maker.constant.has(k) && !bCombinConstant) {
                ERROR(Errors.Fail, 'constant identifier exist');
            }
            maker.constant.set(k, { type: v.type, value: v.value, witness: v.witness });
        });
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND : OperatorType.TYPE_LOGIC_OR;
        maker.data.push(concatenate(Uint8Array, ...this.data, ...otherBuilt.data, Bcs.getInstance().ser(ValueType.TYPE_U8, op)));
        this.data.splice(0, this.data.length - 1);
        maker.type_validator = this.type_validator;
        return maker;
    }
    get_constant() { return this.constant; }
    get_input() { return this.data; }
    static input_combine(input1, input2, bAnd = true) {
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND : OperatorType.TYPE_LOGIC_OR;
        return concatenate(Uint8Array, input1, input2, Bcs.getInstance().ser(ValueType.TYPE_U8, op));
    }
    static input_not(input) {
        return concatenate(Uint8Array, input, Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_LOGIC_NOT));
    }
    static match_u256(type) {
        if (type == ValueType.TYPE_U8 ||
            type == ValueType.TYPE_U64 ||
            type == ValueType.TYPE_U128 ||
            type == ValueType.TYPE_U256) {
            return true;
        }
        return false;
    }
}
