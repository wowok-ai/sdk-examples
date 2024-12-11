import { BCS } from '@mysten/bcs';
import { Protocol, ValueType } from './protocol';
import { Bcs, array_unique, IsValidName, IsValidAddress, IsValidArray, OptionNone, IsValidInt } from './utils';
import { ERROR, Errors } from './exception';
export class Progress {
    permission;
    machine;
    object;
    protocol;
    get_object() { return this.object; }
    constructor(protocol, machine, permission) {
        this.permission = permission;
        this.protocol = protocol;
        this.machine = machine;
        this.object = '';
    }
    static From(protocol, machine, permission, object) {
        let p = new Progress(protocol, machine, permission);
        p.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return p;
    }
    static New(protocol, machine, permission, passport) {
        if (!Protocol.IsValidObjects([machine, permission])) {
            ERROR(Errors.IsValidObjects, 'machine & permission');
        }
        let p = new Progress(protocol, machine, permission);
        let txb = protocol.CurrentSession();
        if (passport) {
            p.object = txb.moveCall({
                target: protocol.ProgressFn('new_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        else {
            p.object = txb.moveCall({
                target: protocol.ProgressFn('new'),
                arguments: [Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        return p;
    }
    launch() {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.ProgressFn('create'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        });
    }
    launch_as_child(parent, parent_next) {
        if (!Protocol.IsValidObjects([parent])) {
            ERROR(Errors.IsValidObjects, 'parent');
        }
        if (!Progress.IsValidProgressNext(parent_next)) {
            ERROR(Errors.InvalidParam, 'parent_next');
        }
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.ProgressFn('create_as_child'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, parent),
                txb.pure(parent_next.next_node_name), txb.pure(parent_next.forward)],
        });
    }
    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ProgressFn('destroy'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        });
    }
    set_namedOperator(name, addresses, passport) {
        if (!IsValidName(name)) {
            ERROR(Errors.IsValidName, 'name');
        }
        if (!addresses || addresses.length > Progress.MAX_NAMED_OPERATOR_COUNT || !IsValidArray(addresses, IsValidAddress)) {
            ERROR(Errors.InvalidParam, 'addresses');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ProgressFn('namedOperator_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING),
                    txb.pure(array_unique(addresses), 'vector<address>'),
                    Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ProgressFn('namedOperator_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING),
                    txb.pure(array_unique(addresses), 'vector<address>'),
                    Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
            });
        }
    }
    bind_task(task_address, passport) {
        if (!IsValidAddress(task_address)) {
            ERROR(Errors.IsValidAddress);
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ProgressFn('task_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                    txb.pure(task_address, BCS.ADDRESS), Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ProgressFn('task_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(task_address, BCS.ADDRESS),
                    Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
            });
        }
    }
    set_context_repository(repository, passport) {
        if (repository && !Protocol.IsValidObjects([repository])) {
            ERROR(Errors.IsValidObjects, 'repository');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (repository) {
                txb.moveCall({
                    target: this.protocol.ProgressFn('context_repository_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, repository),
                        Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ProgressFn('context_repository_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                        Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
                });
            }
        }
        else {
            if (repository) {
                txb.moveCall({
                    target: this.protocol.ProgressFn('context_repository_set'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, repository),
                        Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ProgressFn('context_repository_none'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
                });
            }
        }
    }
    unhold(next, passport) {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'next');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ProgressFn('unhold_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                    Protocol.TXB_OBJECT(txb, this.machine), txb.pure(next.next_node_name),
                    txb.pure(next.forward), Protocol.TXB_OBJECT(txb, this.permission)],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ProgressFn('unhold'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine),
                    txb.pure(next.next_node_name), txb.pure(next.forward),
                    Protocol.TXB_OBJECT(txb, this.permission)],
            });
        }
    }
    parent(parent, passport) {
        if (!IsValidAddress(parent.parent_id) || !IsValidInt(parent.parent_session_id)) {
            ERROR(Errors.InvalidParam, 'parent');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (parent.parent_id) {
                txb.moveCall({
                    target: this.protocol.ProgressFn('parent_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine),
                        txb.pure(parent.parent_id, BCS.ADDRESS),
                        txb.pure(parent.parent_session_id, BCS.U64),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ProgressFn('parent_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                        Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
                });
            }
        }
        else {
            if (parent.parent_id) {
                txb.moveCall({
                    target: this.protocol.ProgressFn('parent_set'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine),
                        txb.pure(parent.parent_id, BCS.ADDRESS),
                        txb.pure(parent.parent_session_id, BCS.U64),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ProgressFn('parent_none'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                });
            }
        }
    }
    next(next, deliverables_address, sub_id, passport) {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'next');
        }
        if (deliverables_address && !IsValidAddress(deliverables_address)) {
            ERROR(Errors.IsValidAddress, 'deliverables_address');
        }
        if (sub_id && !IsValidAddress(sub_id)) {
            ERROR(Errors.IsValidAddress, 'sub_id');
        }
        let txb = this.protocol.CurrentSession();
        let diliverable = deliverables_address ? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_ADDRESS, deliverables_address)) : OptionNone(txb);
        let sub = sub_id ? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_ADDRESS, sub_id)) : OptionNone(txb);
        if (passport) {
            txb.moveCall({
                target: this.protocol.ProgressFn('next_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine),
                    txb.pure(next.next_node_name, BCS.STRING),
                    txb.pure(next.forward, BCS.STRING), diliverable, sub,
                    Protocol.TXB_OBJECT(txb, this.permission)],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ProgressFn('next'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine), txb.pure(next.next_node_name, BCS.STRING),
                    txb.pure(next.forward, BCS.STRING), diliverable, sub, Protocol.TXB_OBJECT(txb, this.permission)],
            });
        }
    }
    hold(next, hold) {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'next');
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ProgressFn('hold'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine), txb.pure(next.next_node_name),
                txb.pure(next.forward), txb.pure(hold, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
        });
    }
    static MAX_NAMED_OPERATOR_COUNT = 100;
    static IsValidProgressNext = (next) => {
        return IsValidName(next.forward) && IsValidName(next.next_node_name);
    };
}
