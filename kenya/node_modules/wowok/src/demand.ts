import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { FnCallType, Protocol, PassportObject, PermissionObject, GuardObject, DemandAddress, TxbObject } from './protocol';
import { IsValidDesription, IsValidAddress, IsValidArgType, IsValidU64, parseObjectType } from './utils'
import { Errors, ERROR}  from './exception'

export class Demand {
    protected bounty_type;
    protected permission ;
    protected object : TxbObject;
    protected txb;

    get_bounty_type() {  return this.bounty_type }
    get_object() { return this.object }

    static From(txb:TransactionBlock, bounty_type:string, permission:PermissionObject, object:TxbObject) : Demand {
        let d = new Demand(txb,  bounty_type, permission)
        d.object = Protocol.TXB_OBJECT(txb, object)
        return d
    }   

    private constructor(txb:TransactionBlock, bounty_type:string, permission:PermissionObject) {
        this.bounty_type = bounty_type;
        this.permission = permission;
        this.txb = txb;
        this.object = '';
    }
    static New(txb:TransactionBlock, bounty_type:string, ms_expand:boolean, time:number, permission:PermissionObject, description:string, 
        bounty:TransactionResult | string, passport?:PassportObject) : Demand {
        if (!Protocol.IsValidObjects([permission, bounty])) {
            ERROR(Errors.IsValidObjects, 'permission, bounty');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        } 
        if (!IsValidArgType(bounty_type)) {
            ERROR(Errors.IsValidArgType, bounty_type);
        }
        if (!IsValidU64(time)) {
            ERROR(Errors.IsValidUint, 'time')
        }
        
        let  d = new Demand(txb, bounty_type, permission);
        const clock = txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            d.object = txb.moveCall({
                target:Protocol.Instance().DemandFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure.string(description), txb.object(bounty), txb.pure.bool(ms_expand), txb.pure.u64(time), 
                    txb.object(clock), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[bounty_type],
            })        
        } else {
            d.object = txb.moveCall({
                target:Protocol.Instance().DemandFn('new') as FnCallType,
                arguments:[txb.pure.string(description), txb.object(bounty), txb.pure.bool(ms_expand), txb.pure.u64(time), 
                    txb.object(clock), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[bounty_type],
            })        
        }
        return d
    }

    launch() : DemandAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().DemandFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments:[this.bounty_type],
        })
    }
    
    refund(passport?:PassportObject)  {
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().DemandFn('refund_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().DemandFn('refund') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })            
        }
    }
    
    // minutes_duration TRUE , time is minutes count; otherwise, the deadline time
    expand_time(minutes_duration:boolean, time: number, passport?:PassportObject) {
        if (!IsValidU64(time)) {
            ERROR(Errors.IsValidUint, 'time');
        }
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().DemandFn('time_expand_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(minutes_duration),
                    this.txb.pure.u64(time), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().DemandFn('time_expand') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object),  this.txb.pure.bool(minutes_duration),
                    this.txb.pure.u64(time), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })          
        }
    }
    
   set_guard(guard?:GuardObject, passport?:PassportObject)  {  
        if (guard && !Protocol.IsValidObjects([guard])) {
            ERROR(Errors.IsValidObjects, 'guard');
        }
        
        if (passport) {
            if (guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().DemandFn('guard_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.bounty_type],
                })            
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().DemandFn('guard_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.bounty_type],
                })               
            }
        } else {
            if (guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().DemandFn('guard_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.bounty_type],
                })            
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().DemandFn('guard_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.bounty_type],
                })               
            }        
        }
    }
    
    set_description(description:string, passport?:PassportObject) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
    
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().DemandFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })    
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().DemandFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })    
        }
    }
    
    yes(service_address:string, passport?:PassportObject) {
        if (!IsValidAddress(service_address)) {
            ERROR(Errors.IsValidAddress)
        }
    
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().DemandFn('yes_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.address(service_address), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })    
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().DemandFn('yes') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.address(service_address), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })    
        }
    }
    
    deposit(bounty:TxbObject)  {
        if (!Protocol.IsValidObjects([bounty])) {
            ERROR(Errors.IsValidObjects)
        }
        
        this.txb.moveCall({
            target:Protocol.Instance().DemandFn('deposit') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, bounty)],
            typeArguments:[this.bounty_type],
        })    
    }
    
    present(service_address: string, service_pay_type:string, tips:string, passport?:PassportObject) {
        if (!IsValidDesription(tips)) {
            ERROR(Errors.IsValidDesription, 'tips')
        }
        if (!IsValidAddress(service_address)) {
            ERROR(Errors.IsValidAddress, 'service_address')
        }
        if (!IsValidArgType(service_pay_type)) {
            ERROR(Errors.IsValidArgType, 'service_pay_type')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().DemandFn('present_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, service_address), 
                    this.txb.pure.string(tips)],
                typeArguments:[this.bounty_type, service_pay_type],
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().DemandFn('present') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, service_address), 
                    this.txb.pure.string(tips)],
                typeArguments:[this.bounty_type, service_pay_type],
            })   
        } 
    }
    change_permission(new_permission:PermissionObject)  {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }
    
        this.txb.moveCall({
            target:Protocol.Instance().DemandFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments:[this.bounty_type]            
        })    
        this.permission = new_permission
    }
    static parseObjectType = (chain_type?:string | null) : string =>  {
        return parseObjectType(chain_type, 'demand::Demand<')
    }

    static MAX_BOUNTY_COUNT = 300;
    static MAX_PRESENTERS_COUNT = 200;
}

