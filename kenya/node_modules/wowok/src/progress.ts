
import { FnCallType, PermissionObject, RepositoryObject, PassportObject, MachineObject, 
    ProgressObject, ProgressAddress, Protocol, ValueType,
    TxbObject} from './protocol';
import { Bcs, array_unique,IsValidName, IsValidAddress, IsValidArray, IsValidInt  } from './utils'
import { ERROR, Errors } from './exception';
import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';


export type ProgressNext = {
    next_node_name: string;
    forward: string;
}

export type ParentProgress = {
    parent_id: string;
    parent_session_id: number;
    next_node: string;
    forward: string;
}

export type CurrentSessionId = TransactionResult;
export interface Holder {
    forward: string;
    who?:string;
    sub_progress?:string;
    deliverables?:string;
    accomplished:boolean;
}
export interface Session {
    id?:number; // for parent progress's history
    next_node: string;
    holders: Holder[];
    weights: number;
    threshold: number;
    node?:string;
    bComplete?: boolean;
}

export class Progress {
    protected permission ;
    protected machine;
    protected object : TxbObject;
    protected txb;

    get_object() { return this.object }
    private constructor(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject) {
        this.permission = permission;
        this.txb = txb;
        this.machine = machine;
        this.object = '';
    }
    static From(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, object:TxbObject) : Progress{
        let p = new Progress(txb, machine, permission)
        p.object = Protocol.TXB_OBJECT(txb, object);
        return p
    }
    static New(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, task?:string | null, passport?:PassportObject) : Progress {
        if (!Protocol.IsValidObjects([machine, permission])) {
            ERROR(Errors.IsValidObjects, 'machine & permission')
        }

        let p = new Progress(txb, machine, permission);
        let t = txb.pure.option('address', task ? task : undefined);

        if (passport) {
            p.object = txb.moveCall({
                target:Protocol.Instance().ProgressFn('new_with_passport') as FnCallType,
                arguments: [passport, t, Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            })    
        } else {
            p.object = txb.moveCall({
                target:Protocol.Instance().ProgressFn('new') as FnCallType,
                arguments: [t, Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            })    
        }
        return p
    }

    launch() : ProgressAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().ProgressFn('create') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)],
        })   
    }

    launch_as_child(parent:ProgressObject, parent_next:ProgressNext) : ProgressAddress {
        if (!Protocol.IsValidObjects([parent])) {
            ERROR(Errors.IsValidObjects, 'parent')
        }
        if (!Progress.IsValidProgressNext(parent_next)) {
            ERROR(Errors.InvalidParam, 'parent_next')
        }
        
        return this.txb.moveCall({
            target:Protocol.Instance().ProgressFn('create_as_child') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, parent), 
                this.txb.pure.string(parent_next.next_node_name), this.txb.pure.string(parent_next.forward)],
        })   
    }

    set_namedOperator(name:string, addresses:string[], passport?:PassportObject)  {
        if (!IsValidName(name)) {
            ERROR(Errors.IsValidName, 'name')
        }
        if (addresses.length > Progress.MAX_NAMED_OPERATOR_COUNT || !IsValidArray(addresses, IsValidAddress)) {
            ERROR(Errors.InvalidParam, 'addresses')
        }

        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('namedOperator_set_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name), 
                    this.txb.pure.vector('address', array_unique(addresses)), 
                Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('namedOperator_set') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name), 
                    this.txb.pure.vector('address', array_unique(addresses)), 
                Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })  
        }  
    }

    bind_task(task_address:string, passport?:PassportObject)  {
        if (!IsValidAddress(task_address)) {
            ERROR(Errors.IsValidAddress)
        }

        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('task_set_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.address(task_address), Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('task_set') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(task_address), 
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })   
        } 
    }
    set_context_repository(repository?:RepositoryObject, passport?:PassportObject)  {
        if (repository && !Protocol.IsValidObjects([repository])) {
            ERROR(Errors.IsValidObjects, 'repository')
        }

        if (passport) {
            if (repository) {
                this.txb.moveCall({
                    target:Protocol.Instance().ProgressFn('context_repository_set_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository), 
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                })            
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ProgressFn('context_repository_none_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                })           
            }
        } else {
            if (repository) {
                this.txb.moveCall({
                    target:Protocol.Instance().ProgressFn('context_repository_set') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository), 
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                })            
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ProgressFn('context_repository_none') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                })           
            }
        }
    }
    unhold(next:ProgressNext, passport?:PassportObject)  {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'unhold')
        }
        
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('unhold_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name), 
                    this.txb.pure.string(next.forward), Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            })     
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('unhold') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), 
                    this.txb.pure.string(next.next_node_name), this.txb.pure.string(next.forward), 
                    Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            })           
        }
    }
    parent_none(passport?:PassportObject) {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('parent_none_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            }) 
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('parent_none') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            }) 
        }
    }

    parent(parent:ParentProgress, passport?:PassportObject)  {
        if (!IsValidAddress(parent.parent_id) || !IsValidInt(parent.parent_session_id)) {
            ERROR(Errors.InvalidParam, 'parent')
        }
        if (!parent.next_node || !parent.forward) {
            ERROR(Errors.InvalidParam, 'parent')
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('parent_set_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), 
                    this.txb.object(parent.parent_id), 
                    this.txb.pure.u64(parent.parent_session_id), 
                    this.txb.pure.string(parent.next_node),
                    this.txb.pure.string(parent.forward),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('parent_set') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), 
                    this.txb.object(parent.parent_id), 
                    this.txb.pure.u64(parent.parent_session_id), 
                    this.txb.pure.string(parent.next_node),
                    this.txb.pure.string(parent.forward),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            })  
        }
    }

    next(next:ProgressNext, deliverables_address?:string, sub_id?:string, passport?:PassportObject) : CurrentSessionId {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'next')
        }
        if (deliverables_address && !IsValidAddress(deliverables_address)) {
            ERROR(Errors.IsValidAddress, 'deliverables_address');
        }
        if (sub_id && !IsValidAddress(sub_id)) {
            ERROR(Errors.IsValidAddress, 'sub_id');
        }
        
        const diliverable = this.txb.pure.option('address', deliverables_address ? deliverables_address  : undefined);
        const sub = this.txb.pure.option('address', sub_id ? sub_id : undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        if (passport) {
            return this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('next_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), 
                    this.txb.pure.string(next.next_node_name), 
                    this.txb.pure.string(next.forward), diliverable, sub, 
                    Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            })    
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().ProgressFn('next') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name), 
                    this.txb.pure.string(next.forward), diliverable, sub, Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            })               
        }
    }

    hold(next:ProgressNext, hold:boolean)  : CurrentSessionId  {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'hold')
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        return this.txb.moveCall({
            target:Protocol.Instance().ProgressFn('hold') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name), 
                this.txb.pure.string(next.forward), this.txb.pure.bool(hold), Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
        })  
    }

    static rpc_de_sessions = (session: any) : Session[] => {
        let sessions : Session[] = [];
        session?.fields?.contents?.forEach((v:any) => {
            var s:Session = {next_node: v.fields.key, holders:[], weights:v.fields.value.fields.weights, threshold:v.fields.value.fields.threshold};
            v.fields.value.fields.forwards.fields.contents.forEach((i:any) => {
              s.holders.push({forward:i.fields.key, accomplished:i.fields.value.fields.accomplished, 
                who:i.fields.value.fields.who, deliverables:i.fields.value.fields.deliverables ?? undefined,
                sub_progress: i.fields.value.fields.sub_progress ?? undefined
              })
            })
            sessions.push(s);
        })
        return sessions;
    }

    static rpc_de_history = (fields: any) : Session[] => {
        let sessions : Session[] = [];
        fields?.forEach((v:any) => {
          const next_node = v.data.content.fields.value.fields.next_node;
          v.data.content.fields.value.fields.session.fields.contents.forEach((i:any) => {
            var s:Session = {id:v.data.content.fields.name,
                node:v.data.content.fields.value.fields.node, next_node: i.fields.key, holders:[], 
              weights:i.fields.value.fields.weights, threshold:i.fields.value.fields.threshold, bComplete:i.fields.key === next_node};
              i.fields.value.fields.forwards.fields.contents.forEach((k:any) => {
              s.holders.push({forward:k.fields.key, who:k.fields.value.fields.who, accomplished:k.fields.value.fields.accomplished,
                sub_progress:k.fields.value.fields.sub_progress ?? undefined, deliverables:k.fields.value.fields.deliverables ?? undefined});
            })
            sessions.push(s);
          })
        })
        return sessions;
    }

    static MAX_NAMED_OPERATOR_COUNT = 20;
    static IsValidProgressNext = (next:ProgressNext) => {
        return IsValidName(next.forward)  && IsValidName(next.next_node_name);
    }
}