import { GuardObject, PassportObject, PermissionObject, RepositoryObject, MachineObject, ServiceAddress, ServiceObject, DiscountObject, OrderObject, OrderAddress, CoinObject, Protocol, TxbObject } from './protocol';
export type Service_Guard_Percent = {
    guard: GuardObject;
    percent: number;
};
export type Service_Sale = {
    item: string;
    price: number;
    stock: number;
    endpoint?: string;
};
export declare enum Service_Discount_Type {
    ratio = 0,
    minus = 1
}
export type Service_Discount = {
    name: string;
    type: Service_Discount_Type;
    off: number;
    duration_minutes: number;
    time_start?: number;
    price_greater?: number;
};
export type Service_Buy_RequiredInfo = {
    pubkey: string;
    customer_info: string[];
};
export type Customer_RequiredInfo = {
    pubkey: string;
    customer_pubkey: string;
    customer_info_crypt: string[];
};
export declare enum BuyRequiredEnum {
    address = "address",
    phone = "phone",
    name = "name",
    postcode = "postcode"
}
export type Service_Buy = {
    item: string;
    max_price: number;
    count: number;
};
export type DicountDispatch = {
    receiver: string;
    count: number;
    discount: Service_Discount;
};
export declare class Service {
    protected pay_token_type: string;
    protected permission: PermissionObject;
    protected object: TxbObject;
    protected protocol: Protocol;
    get_pay_type(): string;
    get_object(): TxbObject;
    private constructor();
    static From(protocol: Protocol, token_type: string, permission: PermissionObject, object: TxbObject): Service;
    static New(protocol: Protocol, token_type: string, permission: PermissionObject, description: string, payee_address: string, endpoint?: string, passport?: PassportObject): Service;
    launch(): ServiceAddress;
    destroy(): void;
    set_description(description: string, passport?: PassportObject): void;
    set_price(item: string, price: number, bNotFoundAssert?: boolean, passport?: PassportObject): void;
    set_stock(item: string, stock: number, bNotFoundAssert?: boolean, passport?: PassportObject): void;
    add_stock(item: string, stock_add: number, bNotFoundAssert?: boolean, passport?: PassportObject): void;
    reduce_stock(item: string, stock_reduce: number, bNotFoundAssert?: boolean, passport?: PassportObject): void;
    set_sale_endpoint(item: string, endpoint?: string, bNotFoundAssert?: boolean, passport?: PassportObject): void;
    set_payee(payee: string, passport?: PassportObject): void;
    repository_add(repository: RepositoryObject, passport?: PassportObject): void;
    repository_remove(repository_address?: string[], removeall?: boolean, passport?: PassportObject): void;
    add_withdraw_guards(guards: Service_Guard_Percent[], passport?: PassportObject): void;
    remove_withdraw_guards(guard_address?: string[], removeall?: boolean, passport?: PassportObject): void;
    add_refund_guards(guards: Service_Guard_Percent[], passport?: PassportObject): void;
    remove_refund_guards(guard_address?: string[], removeall?: boolean, passport?: PassportObject): void;
    is_valid_sale(sales: Service_Sale[]): boolean;
    add_sale(sales: Service_Sale[], bExistAssert?: boolean, passport?: PassportObject): void;
    remove_sales(sales?: string[], passport?: PassportObject): void;
    discount_transfer(discount_dispatch: DicountDispatch[], passport?: PassportObject): void;
    withdraw(order: OrderObject, passport?: PassportObject): void;
    set_buy_guard(guard?: GuardObject, passport?: PassportObject): void;
    set_machine(machine?: MachineObject, passport?: PassportObject): void;
    set_endpoint(endpoint?: string, passport?: PassportObject): void;
    publish(passport?: PassportObject): void;
    clone(passport?: PassportObject): ServiceObject;
    set_customer_required(pubkey: string, customer_required: BuyRequiredEnum[], passport?: PassportObject): void;
    remove_customer_required(passport?: PassportObject): void;
    change_required_pubkey(pubkey: string, passport?: PassportObject): void;
    change_order_required_pubkey(order: OrderObject, pubkey: string, passport?: PassportObject): void;
    pause(pause: boolean, passport?: PassportObject): void;
    customer_refund(order: OrderObject, passport?: PassportObject): void;
    update_order_required_info(order: OrderObject, customer_info_crypto: Customer_RequiredInfo): void;
    buy(buy_items: Service_Buy[], coin: CoinObject, discount?: DiscountObject, machine?: MachineObject, customer_info_crypto?: Customer_RequiredInfo, passport?: PassportObject): OrderAddress;
    order_bind_machine(order: OrderObject, machine: MachineObject): void;
    change_permission(new_permission: PermissionObject): void;
    static MAX_DISCOUNT_COUNT_ONCE: number;
    static MAX_DISCOUNT_RECEIVER_COUNT: number;
    static MAX_GUARD_COUNT: number;
    static MAX_REPOSITORY_COUNT: number;
    static parseObjectType: (chain_type: string | undefined | null) => string;
    static endpoint: (service_endpoint: string, item_endpoint: string, item_name: string) => string | undefined;
}
//# sourceMappingURL=service.d.ts.map