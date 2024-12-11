import { Protocol, TxbObject, ResourceAddress } from './protocol';
import { Resource } from './resource';
export interface Entity_Info {
    name: string;
    description?: string;
    avatar?: string;
    twitter?: string;
    discord?: string;
    homepage?: string;
}
export declare class Entity {
    protected object: TxbObject;
    protected protocol: Protocol;
    get_object(): TxbObject;
    private constructor();
    static From(protocol: Protocol): Entity;
    mark(resource: Resource, address: string, like: 'like' | 'dislike'): void;
    update(info: Entity_Info): void;
    create_resource(): ResourceAddress;
    destroy_resource(resource: Resource): import("@mysten/sui.js/transactions").TransactionResult;
    transfer_resource(resource: Resource, new_address: string): import("@mysten/sui.js/transactions").TransactionResult;
    query_ent(address_queried: string): void;
}
//# sourceMappingURL=entity.d.ts.map