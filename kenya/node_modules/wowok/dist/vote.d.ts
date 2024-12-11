import { PassportObject, PermissionObject, GuardObject, VoteAddress, Protocol, TxbObject } from './protocol';
export declare const MAX_AGREES_COUNT = 200;
export declare const MAX_CHOICE_COUNT = 200;
export type VoteOption = {
    name: string;
    reference_address?: string;
};
export declare class Vote {
    protected permission: PermissionObject;
    protected object: TxbObject;
    protected protocol: Protocol;
    get_object(): TxbObject;
    private constructor();
    static From(protocol: Protocol, permission: PermissionObject, object: TxbObject): Vote;
    static New(protocol: Protocol, permission: PermissionObject, description: string, minutes_duration: boolean, time: number, max_choice_count?: number, reference_address?: string, passport?: PassportObject): Vote;
    launch(): VoteAddress;
    destroy(): void;
    set_description(description: string, passport?: PassportObject): void;
    set_reference(reference_address?: string, passport?: PassportObject): void;
    add_guard(guard: GuardObject, weight: number, passport?: PassportObject): void;
    remove_guard(guard_address: string[], removeall?: boolean, passport?: PassportObject): void;
    add_option(options: VoteOption[], passport?: PassportObject): void;
    remove_option(options: string[], removeall?: boolean, passport?: PassportObject): void;
    set_max_choice_count(max_choice_count: number, passport?: PassportObject): void;
    open_voting(passport?: PassportObject): void;
    lock_deadline(passport?: PassportObject): void;
    expand_deadline(ms_expand: boolean, time: number, passport?: PassportObject): void;
    lock_guard(passport?: PassportObject): void;
    agree(options: string[], passport?: PassportObject): void;
    change_permission(new_permission: PermissionObject): void;
}
//# sourceMappingURL=vote.d.ts.map