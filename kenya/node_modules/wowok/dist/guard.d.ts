import { Protocol, GuardAddress, Data_Type, MODULES, ContextType, ValueType, OperatorType, ConstantType } from './protocol';
export type GuardConstant = Map<number, Guard_Vriable>;
export interface Guard_Vriable {
    type: ConstantType;
    value?: Uint8Array;
    witness?: Uint8Array;
}
export declare class Guard {
    static MAX_INPUT_LENGTH: number;
    static launch(protocol: Protocol, description: string, maker: GuardMaker): GuardAddress;
    static signer_guard(protocol: Protocol): GuardAddress;
    static everyone_guard(protocol: Protocol): GuardAddress;
    static QUERIES: any[];
    static BoolCmd: any[];
    static IsBoolCmd: (cmd: number) => boolean;
    static GetCmd: (cmd: number) => any;
}
export declare class GuardConstantHelper {
    static IsValidIndentifier: (identifier: number) => boolean;
    static get_constant_value(constants: GuardConstant, identifier: number, type: ConstantType): Uint8Array | undefined;
    static get_constant_witness(constants: GuardConstant, identifier: number): Uint8Array | undefined;
    static add_future_constant(constants: GuardConstant, identifier: number, witness: any, value?: any, bNeedSerialize?: boolean): void;
    static add_constant(constants: GuardConstant, identifier: number, type: ValueType, value: any, bNeedSerialize?: boolean): false | undefined;
}
export declare class GuardMaker {
    protected data: Uint8Array[];
    protected type_validator: Data_Type[];
    protected constant: GuardConstant;
    private static index;
    private static get_index;
    constructor();
    add_constant(type: ConstantType, value: any, bNeedSerialize?: boolean): number;
    private serValueParam;
    add_param(type: ValueType | ContextType, param?: any): GuardMaker;
    add_query(module: MODULES, query_name: string, object_address_from: string | number, bWitness?: boolean): GuardMaker;
    add_logic(type: OperatorType): GuardMaker;
    build(bNot?: boolean): GuardMaker;
    IsReady(): boolean;
    combine(otherBuilt: GuardMaker, bAnd?: boolean, bCombinConstant?: boolean): GuardMaker;
    get_constant(): GuardConstant;
    get_input(): Uint8Array[];
    static input_combine(input1: Uint8Array, input2: Uint8Array, bAnd?: boolean): Uint8Array;
    static input_not(input: Uint8Array): Uint8Array;
    static match_u256(type: number): boolean;
}
//# sourceMappingURL=guard.d.ts.map