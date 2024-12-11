import { type TransactionResult } from '@mysten/sui.js/transactions';
import { Protocol, PassportObject, PermissionObject, GuardObject, DemandAddress, TxbObject } from './protocol';
export declare class Demand {
    protected bounty_type: string;
    protected permission: PermissionObject;
    protected object: TxbObject;
    protected protocol: Protocol;
    get_bounty_type(): string;
    get_object(): TxbObject;
    static From(protocol: Protocol, bounty_type: string, permission: PermissionObject, object: TxbObject): Demand;
    private constructor();
    static New(protocol: Protocol, bounty_type: string, permission: PermissionObject, description: string, bounty: TransactionResult | string, passport?: PassportObject): Demand;
    launch(): DemandAddress;
    destroy(): void;
    refund(passport?: PassportObject): void;
    expand_time(minutes_duration: boolean, time: number, passport?: PassportObject): void;
    set_guard(guard?: GuardObject, passport?: PassportObject): void;
    set_description(description: string, passport?: PassportObject): void;
    yes(service_address: string, passport?: PassportObject): void;
    deposit(bounty: TxbObject): void;
    present(service_address: string, service_pay_type: string, tips: string, passport?: PassportObject): void;
    change_permission(new_permission: PermissionObject): void;
    static parseObjectType: (chain_type: string) => string;
    static MAX_BOUNTY_COUNT: number;
    static MAX_PRESENTERS_COUNT: number;
}
//# sourceMappingURL=demand.d.ts.map