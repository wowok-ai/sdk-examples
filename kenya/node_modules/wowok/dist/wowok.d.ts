import { Protocol, TxbObject, PermissionObject } from './protocol';
export declare class Wowok {
    protected object: TxbObject;
    protected protocol: Protocol;
    get_object(): TxbObject;
    private constructor();
    static From(protocol: Protocol): Wowok;
    register_grantor(name: string, grantee_permission: PermissionObject): void;
    grantor_time_expand_1year(grantor: string): void;
    grantor_rename(new_name: string): void;
}
//# sourceMappingURL=wowok.d.ts.map