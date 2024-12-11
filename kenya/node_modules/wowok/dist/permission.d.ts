import { TxbObject, PermissionAddress, GuardObject, Protocol } from './protocol';
export declare enum PermissionIndex {
    repository = 100,
    repository_set_description_set = 101,
    repository_set_policy_mode = 102,
    repository_add_policies = 103,
    repository_remove_policies = 103,
    repository_set_policy_description = 105,
    repository_set_policy_permission = 106,
    repository_reference_add = 107,
    repository_reference_remove = 107,
    repository_reference_removeall = 107,
    vote = 150,
    vote_set_description = 151,
    vote_set_reference = 152,
    vote_add_guard = 153,
    vote_remove_guard = 154,
    vote_add_option = 155,
    vote_remove_option = 156,
    vote_set_max_choice_count = 157,
    vote_open_voting = 158,
    vote_lock_deadline = 159,
    vote_expand_deadline = 160,
    vote_lock_guard = 161,
    service = 200,
    service_set_description = 201,
    service_set_price = 202,
    service_set_stock = 203,
    service_add_stock = 203,
    service_reduce_stock = 203,
    service_set_sale_endpoint = 204,
    service_set_payee = 205,
    service_repository_add = 206,
    service_repository_remove = 207,
    service_add_withdraw_guards = 208,
    service_remove_withdraw_guards = 208,
    service_removeall_withdraw_guards = 208,
    service_add_refund_guards = 210,
    service_remove_refund_guards = 210,
    service_removeall_refund_guards = 210,
    service_add_sales = 212,
    service_remove_sales = 213,
    service_discount_transfer = 214,
    service_withdraw = 216,
    service_set_buy_guard = 217,
    service_set_machine = 218,
    service_set_endpoint = 219,
    service_publish = 220,
    service_clone = 221,
    service_set_customer_required = 222,
    service_remove_customer_required = 222,
    service_change_required_pubkey = 222,
    service_change_order_required_pubkey = 224,
    service_pause = 225,
    reward = 240,
    reward_refund = 241,
    reward_expand_time = 242,
    reward_add_guard = 243,
    reward_remove_guard = 243,
    reward_set_description = 245,
    reward_lock_guards = 246,
    demand = 260,
    demand_refund = 261,
    demand_expand_time = 262,
    demand_set_guard = 263,
    demand_set_description = 264,
    demand_yes = 265,
    machine = 600,
    machine_set_description = 601,
    machine_add_repository = 602,
    machine_remove_repository = 603,
    machine_clone = 604,
    machine_add_node = 606,
    machine_add_node2 = 606,
    machine_remove_node = 607,
    machine_set_endpoint = 608,
    machine_pause = 609,
    machine_publish = 610,
    progress = 650,
    progress_set_namedOperator = 651,
    progress_bind_task = 652,
    progress_set_context_repository = 653,
    progress_unhold = 654,
    user_defined_start = 10000
}
export interface PermissionInfoType {
    index: number;
    name: string;
    description: string;
    module: string;
    guard?: string;
}
export declare const PermissionInfo: PermissionInfoType[];
export type PermissionIndexType = PermissionIndex | number;
export type Permission_Index = {
    index: PermissionIndexType;
    guard?: TxbObject;
};
export type Permission_Entity = {
    entity_address: string;
    permissions: Permission_Index[];
};
export declare class Permission {
    protected protocol: Protocol;
    protected object: TxbObject;
    get_object(): TxbObject;
    private constructor();
    static From(protocol: Protocol, object: TxbObject): Permission;
    static New(protocol: Protocol, description: string): Permission;
    launch(): PermissionAddress;
    destroy(): void;
    add_userdefine(index: number, name: string): void;
    remove_userdefine(index: number): void;
    change_entity(old_entity: string, new_entity: string): void;
    add_entity2(entities: string[], index?: PermissionIndexType): void;
    add_entity(entities: Permission_Entity[]): void;
    set_guard(entity_address: string, index: PermissionIndexType, guard?: GuardObject): void;
    remove_index(entity_address: string, index: PermissionIndexType[]): void;
    remove_entity(entity_address: string[]): void;
    set_description(description: string): void;
    add_admin(admin: string[]): void;
    remove_admin(admin?: string[], removeall?: boolean): void;
    change_owner(new_owner: string): void;
    static MAX_ADMIN_COUNT: number;
    static MAX_ENTITY_COUNT: number;
    static MAX_PERMISSION_INDEX_COUNT: number;
    static MAX_PERSONAL_PERMISSION_COUNT: number;
    static IsValidUserDefinedIndex: (index: number) => boolean;
    static IsValidPermissionIndex: (index: PermissionIndexType) => boolean;
}
//# sourceMappingURL=permission.d.ts.map