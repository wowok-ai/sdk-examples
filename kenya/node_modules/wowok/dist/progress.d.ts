import { PermissionObject, RepositoryObject, PassportObject, MachineObject, ProgressObject, ProgressAddress, Protocol, TxbObject } from './protocol';
export type ProgressNext = {
    next_node_name: string;
    forward: string;
};
export type ParentProgress = {
    parent_id: string;
    parent_session_id: number;
};
export declare class Progress {
    protected permission: PermissionObject;
    protected machine: MachineObject;
    protected object: TxbObject;
    protected protocol: Protocol;
    get_object(): TxbObject;
    private constructor();
    static From(protocol: Protocol, machine: MachineObject, permission: PermissionObject, object: TxbObject): Progress;
    static New(protocol: Protocol, machine: MachineObject, permission: PermissionObject, passport?: PassportObject): Progress;
    launch(): ProgressAddress;
    launch_as_child(parent: ProgressObject, parent_next: ProgressNext): ProgressAddress;
    destroy(): void;
    set_namedOperator(name: string, addresses: string[], passport?: PassportObject): void;
    bind_task(task_address: string, passport?: PassportObject): void;
    set_context_repository(repository?: RepositoryObject, passport?: PassportObject): void;
    unhold(next: ProgressNext, passport?: PassportObject): void;
    parent(parent: ParentProgress, passport?: PassportObject): void;
    next(next: ProgressNext, deliverables_address?: string, sub_id?: string, passport?: PassportObject): void;
    hold(next: ProgressNext, hold: boolean): void;
    static MAX_NAMED_OPERATOR_COUNT: number;
    static IsValidProgressNext: (next: ProgressNext) => boolean;
}
//# sourceMappingURL=progress.d.ts.map