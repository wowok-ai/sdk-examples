import { Protocol, ValueType, RepositoryValueType, RepositoryAddress, PermissionObject, PassportObject, TxbObject } from './protocol';
import { PermissionIndexType } from './permission';
export declare enum Repository_Policy_Mode {
    POLICY_MODE_FREE = 0,
    POLICY_MODE_STRICT = 1
}
export type Repository_Policy = {
    key: string;
    description: string;
    data_type: RepositoryValueType;
    permission?: PermissionIndexType;
};
export type Repository_Policy_Data = {
    key: string;
    data: Repository_Value[];
    value_type?: ValueType;
};
export type Repository_Value = {
    address: string;
    bcsBytes: Uint8Array;
};
export declare class Repository {
    protected permission: PermissionObject;
    protected object: TxbObject;
    protected protocol: Protocol;
    get_object(): TxbObject;
    private constructor();
    static From(protocol: Protocol, permission: PermissionObject, object: TxbObject): Repository;
    static New(protocol: Protocol, permission: PermissionObject, description: string, policy_mode: Repository_Policy_Mode, passport?: PassportObject): Repository;
    launch(): RepositoryAddress;
    destroy(): false | undefined;
    add_data(data: Repository_Policy_Data): void;
    remove(address: string, key: string): void;
    add_reference(references: string[], passport?: PassportObject): void;
    remove_reference(references: string[], removeall?: boolean, passport?: PassportObject): void;
    add_policies(policies: Repository_Policy[], passport?: PassportObject): void;
    remove_policies(policy_keys: string[], passport?: PassportObject): void;
    rename_policy(policy_key: string, new_policy_key: string, passport?: PassportObject): void;
    set_description(description: string, passport?: PassportObject): void;
    set_policy_mode(policy_mode: Repository_Policy_Mode, passport?: PassportObject): void;
    set_policy_description(policy: string, description: string, passport?: PassportObject): void;
    set_policy_permission(policy: string, permission_index?: number, passport?: PassportObject): void;
    change_permission(new_permission: PermissionObject): void;
    static MAX_POLICY_COUNT: number;
    static MAX_KEY_LENGTH: number;
    static MAX_VALUE_LENGTH: number;
    static MAX_REFERENCE_COUNT: number;
    static IsValidName: (key: string) => boolean;
    static IsValidValue: (value: Uint8Array) => boolean;
    static parseObjectType: (chain_type: string) => string;
}
//# sourceMappingURL=repository.d.ts.map