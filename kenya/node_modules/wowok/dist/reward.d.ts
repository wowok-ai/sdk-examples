import { type TransactionResult } from '@mysten/sui.js/transactions';
import { GuardObject, PassportObject, PermissionObject, RewardAddress, Protocol, TxbObject } from './protocol';
export type CoinReward = TransactionResult;
export type RewardGuardPortions = {
    guard: GuardObject;
    portions: number;
};
export declare class Reward {
    protected earnest_type: string;
    protected permission: PermissionObject;
    protected object: TxbObject;
    protected protocol: Protocol;
    get_earnest_type(): string;
    get_object(): TxbObject;
    private constructor();
    static From(protocol: Protocol, earnest_type: string, permission: PermissionObject, object: TxbObject): Reward;
    static New(protocol: Protocol, earnest_type: string, permission: PermissionObject, description: string, ms_expand: boolean, time: number, passport?: PassportObject): Reward;
    launch(): RewardAddress;
    destroy(): void;
    refund(passport?: PassportObject): void;
    expand_time(ms_expand: boolean, time: number, passport?: PassportObject): void;
    add_guard(gurads: RewardGuardPortions[], passport?: PassportObject): void;
    remove_guard(guards: string[], removeall?: boolean, passport?: PassportObject): void;
    allow_repeat_claim(allow_repeat_claim: boolean, passport?: PassportObject): void;
    set_description(description: string, passport?: PassportObject): void;
    lock_guards(passport?: PassportObject): void;
    claim(passport?: PassportObject): void;
    deposit(rewards: TransactionResult[]): void;
    allow_claim(bAllowClaim: boolean, passport?: PassportObject): void;
    change_permission(new_permission: PermissionObject): void;
    static parseObjectType: (chain_type: string) => string;
    static MAX_PORTIONS_COUNT: number;
    static MAX_GUARD_COUNT: number;
}
//# sourceMappingURL=reward.d.ts.map