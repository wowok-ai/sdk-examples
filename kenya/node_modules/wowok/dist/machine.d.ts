import { type TransactionResult } from '@mysten/sui.js/transactions';
import { Protocol, PermissionObject, RepositoryObject, PassportObject, MachineObject, MachineAddress, GuardObject, TxbObject } from './protocol';
import { PermissionIndexType } from './permission';
export type MachineNodeObject = TransactionResult | String;
export interface Machine_Forward {
    name: string;
    namedOperator?: string;
    permission?: PermissionIndexType;
    weight?: number;
    guard?: GuardObject;
}
export interface Machine_Node_Pair {
    prior_node: string;
    forwards: Machine_Forward[];
    threshold?: number;
}
export interface Machine_Node {
    name: string;
    description: string;
    pairs: Machine_Node_Pair[];
}
export declare class Machine {
    protected protocol: Protocol;
    protected object: TxbObject;
    protected permission: PermissionObject;
    get_object(): TxbObject;
    static From(protocol: Protocol, permission: PermissionObject, object: TxbObject): Machine;
    private constructor();
    static New(protocol: Protocol, permission: PermissionObject, description: string, endpoint?: string, passport?: PassportObject): Machine;
    add_node(nodes: Machine_Node[], passport?: PassportObject): void;
    add_node2(nodes: MachineNodeObject[], passport?: PassportObject): void;
    remove_node(nodes_name: string[], bTransferMyself?: boolean, passport?: PassportObject): void;
    destroy(): void;
    launch(): MachineAddress;
    set_description(description: string, passport?: PassportObject): void;
    add_repository(repository: RepositoryObject, passport?: PassportObject): void;
    remove_repository(repositories: string[], removeall?: boolean, passport?: PassportObject): void;
    clone(passport?: PassportObject): MachineObject;
    set_endpoint(endpoint?: string, passport?: PassportObject): void;
    pause(bPaused: boolean, passport?: PassportObject): void;
    publish(passport?: PassportObject): void;
    change_permission(new_permission: PermissionObject): void;
    static INITIAL_NODE_NAME: string;
    static OPERATOR_ORDER_PAYER: string;
}
//# sourceMappingURL=machine.d.ts.map