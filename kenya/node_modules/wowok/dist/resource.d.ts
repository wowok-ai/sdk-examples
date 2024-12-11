import { Protocol, TxbObject } from './protocol';
export interface Tags {
    address: string;
    nick: string;
    tags: string[];
}
export interface ResourceData {
    name: string;
    address: string[];
}
export declare class Resource {
    static MAX_ADDRESS_COUNT: number;
    static MAX_TAGS: number;
    static LikeName: string;
    static DislikeName: string;
    static FavorName: string;
    protected object: TxbObject;
    protected protocol: Protocol;
    get_object(): TxbObject;
    private constructor();
    static From(protocol: Protocol, object: TxbObject): Resource;
    add(name: string, object: string[]): void;
    add2(object: string, name: string[]): void;
    remove(name: string, object?: string[], removeall?: boolean): void;
    remove2(object: string, name: string[]): void;
    rename(old_name: string, new_name: string): void;
    add_tags(object: string, nick: string, tags: string[]): void;
    remove_tags(object: string): void;
}
//# sourceMappingURL=resource.d.ts.map