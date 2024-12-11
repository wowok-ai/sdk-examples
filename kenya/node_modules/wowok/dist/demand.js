import { BCS } from '@mysten/bcs';
import { Protocol } from './protocol';
import { IsValidDesription, IsValidUint, IsValidAddress, IsValidArgType, } from './utils';
import { Errors, ERROR } from './exception';
export class Demand {
    bounty_type;
    permission;
    object;
    protocol;
    get_bounty_type() { return this.bounty_type; }
    get_object() { return this.object; }
    static From(protocol, bounty_type, permission, object) {
        let d = new Demand(protocol, bounty_type, permission);
        d.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return d;
    }
    constructor(protocol, bounty_type, permission) {
        this.bounty_type = bounty_type;
        this.permission = permission;
        this.protocol = protocol;
        this.object = '';
    }
    static New(protocol, bounty_type, permission, description, bounty, passport) {
        if (!Protocol.IsValidObjects([permission, bounty])) {
            ERROR(Errors.IsValidObjects, 'permission, bounty');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        if (!IsValidArgType(bounty_type)) {
            ERROR(Errors.IsValidArgType, bounty_type);
        }
        let d = new Demand(protocol, bounty_type, permission);
        let txb = protocol.CurrentSession();
        if (passport) {
            d.object = txb.moveCall({
                target: protocol.DemandFn('new_with_passport'),
                arguments: [passport, txb.pure(description), txb.object(bounty), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [bounty_type],
            });
        }
        else {
            d.object = txb.moveCall({
                target: protocol.DemandFn('new'),
                arguments: [txb.pure(description), txb.object(bounty), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [bounty_type],
            });
        }
        return d;
    }
    launch() {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.DemandFn('create'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
            typeArguments: [this.bounty_type],
        });
    }
    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.DemandFn('destroy'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
            typeArguments: [this.bounty_type]
        });
    }
    refund(passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.DemandFn('refund_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.DemandFn('refund'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
    }
    // minutes_duration TRUE , time is minutes count; otherwise, the deadline time
    expand_time(minutes_duration, time, passport) {
        if (!IsValidUint(time)) {
            ERROR(Errors.IsValidUint, 'time');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.DemandFn('time_expand_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(minutes_duration, BCS.BOOL),
                    txb.pure(time, BCS.U64),
                    txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.DemandFn('time_expand'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(minutes_duration, BCS.BOOL),
                    txb.pure(time, BCS.U64),
                    txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
    }
    set_guard(guard, passport) {
        if (guard && !Protocol.IsValidObjects([guard])) {
            ERROR(Errors.IsValidObjects, 'guard');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (guard) {
                txb.moveCall({
                    target: this.protocol.DemandFn('guard_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.bounty_type],
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.DemandFn('guard_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.bounty_type],
                });
            }
        }
        else {
            if (guard) {
                txb.moveCall({
                    target: this.protocol.DemandFn('guard_set'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.bounty_type],
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.DemandFn('guard_none'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.bounty_type],
                });
            }
        }
    }
    set_description(description, passport) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.DemandFn('description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(description),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.DemandFn('description_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
    }
    yes(service_address, passport) {
        if (!IsValidAddress(service_address)) {
            ERROR(Errors.IsValidAddress);
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.DemandFn('yes_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                    txb.pure(service_address, BCS.ADDRESS),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.DemandFn('yes'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object),
                    txb.pure(service_address, BCS.ADDRESS),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
    }
    deposit(bounty) {
        if (!Protocol.IsValidObjects([bounty])) {
            ERROR(Errors.IsValidObjects);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.DemandFn('deposit'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, bounty)],
            typeArguments: [this.bounty_type],
        });
    }
    present(service_address, service_pay_type, tips, passport) {
        if (!IsValidDesription(tips)) {
            ERROR(Errors.IsValidDesription, 'tips');
        }
        if (!IsValidAddress(service_address)) {
            ERROR(Errors.IsValidAddress, 'service_address');
        }
        if (!IsValidArgType(service_pay_type)) {
            ERROR(Errors.IsValidArgType, 'service_pay_type');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.DemandFn('present_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, service_address),
                    txb.pure(tips, BCS.STRING)],
                typeArguments: [this.bounty_type, service_pay_type],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.DemandFn('present'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, service_address),
                    txb.pure(tips, BCS.STRING)],
                typeArguments: [this.bounty_type, service_pay_type],
            });
        }
    }
    change_permission(new_permission) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.DemandFn('permission_set'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission), Protocol.TXB_OBJECT(txb, new_permission)],
            typeArguments: [this.bounty_type]
        });
        this.permission = new_permission;
    }
    static parseObjectType = (chain_type) => {
        if (chain_type) {
            const s = 'demand::Demand<';
            const i = chain_type.indexOf(s);
            if (i > 0) {
                let r = chain_type.slice(i + s.length, chain_type.length - 1);
                return r;
            }
        }
        return '';
    };
    static MAX_BOUNTY_COUNT = 200;
    static MAX_PRESENTERS_COUNT = 200;
}
