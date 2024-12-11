import { BCS } from '@mysten/bcs';
import { IsValidArray, IsValidPercent, IsValidName_AllowEmpty, Bcs, array_unique, IsValidTokenType, IsValidDesription, IsValidAddress, IsValidEndpoint, OptionNone, IsValidUint, IsValidInt, IsValidName, } from './utils';
import { Protocol, ValueType } from './protocol';
import { ERROR, Errors } from './exception';
export var Service_Discount_Type;
(function (Service_Discount_Type) {
    Service_Discount_Type[Service_Discount_Type["ratio"] = 0] = "ratio";
    Service_Discount_Type[Service_Discount_Type["minus"] = 1] = "minus";
})(Service_Discount_Type || (Service_Discount_Type = {}));
export var BuyRequiredEnum;
(function (BuyRequiredEnum) {
    BuyRequiredEnum["address"] = "address";
    BuyRequiredEnum["phone"] = "phone";
    BuyRequiredEnum["name"] = "name";
    BuyRequiredEnum["postcode"] = "postcode";
})(BuyRequiredEnum || (BuyRequiredEnum = {}));
export class Service {
    pay_token_type;
    permission;
    object;
    protocol;
    //static token2coin = (token:string) => { return '0x2::coin::Coin<' + token + '>'};
    get_pay_type() { return this.pay_token_type; }
    get_object() { return this.object; }
    constructor(protocol, pay_token_type, permission) {
        this.pay_token_type = pay_token_type;
        this.protocol = protocol;
        this.permission = permission;
        this.object = '';
    }
    static From(protocol, token_type, permission, object) {
        let s = new Service(protocol, token_type, permission);
        s.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return s;
    }
    static New(protocol, token_type, permission, description, payee_address, endpoint, passport) {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects);
        }
        if (!IsValidTokenType(token_type)) {
            ERROR(Errors.IsValidTokenType, 'New: pay_token_type');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        if (!IsValidAddress(payee_address)) {
            ERROR(Errors.IsValidAddress, 'payee_address');
        }
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint);
        }
        let pay_token_type = token_type;
        let s = new Service(protocol, pay_token_type, permission);
        let txb = protocol.CurrentSession();
        let ep = endpoint ? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_STRING, endpoint)) : OptionNone(txb);
        if (passport) {
            s.object = txb.moveCall({
                target: protocol.ServiceFn('new_with_passport'),
                arguments: [passport, txb.pure(description), txb.pure(payee_address, BCS.ADDRESS), ep, Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [pay_token_type],
            });
        }
        else {
            s.object = txb.moveCall({
                target: protocol.ServiceFn('new'),
                arguments: [txb.pure(description, BCS.STRING), txb.pure(payee_address, BCS.ADDRESS), ep, Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [pay_token_type],
            });
        }
        return s;
    }
    launch() {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.ServiceFn('create'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
            typeArguments: [this.pay_token_type]
        });
    }
    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ServiceFn('destroy'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
            typeArguments: [this.pay_token_type]
        });
    }
    set_description(description, passport) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('description_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_price(item, price, bNotFoundAssert = true, passport) {
        if (!IsValidInt(price)) {
            ERROR(Errors.IsValidInt, 'price');
        }
        if (!IsValidName(item)) {
            ERROR(Errors.IsValidName, 'item');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('price_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(price, BCS.U64),
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('price_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(price, BCS.U64),
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_stock(item, stock, bNotFoundAssert = true, passport) {
        if (!IsValidName(item)) {
            ERROR(Errors.IsValidName, 'item');
        }
        if (!IsValidInt(stock)) {
            ERROR(Errors.IsValidInt, 'stock');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('stock_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock, BCS.U64),
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('stock_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock, BCS.U64),
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    add_stock(item, stock_add, bNotFoundAssert = true, passport) {
        if (!IsValidName(item)) {
            ERROR(Errors.IsValidName, 'item');
        }
        if (!IsValidUint(stock_add)) {
            ERROR(Errors.IsValidUint, 'stock_add');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('stock_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock_add, BCS.U64),
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('stock_add'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock_add, BCS.U64),
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    reduce_stock(item, stock_reduce, bNotFoundAssert = true, passport) {
        if (!IsValidName(item)) {
            ERROR(Errors.IsValidName, 'item');
        }
        if (!IsValidUint(stock_reduce)) {
            ERROR(Errors.IsValidUint, 'stock_reduce');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('stock_reduce_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock_reduce, BCS.U64),
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('stock_reduce'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock_reduce, BCS.U64),
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_sale_endpoint(item, endpoint, bNotFoundAssert = true, passport) {
        if (!IsValidName(item)) {
            ERROR(Errors.IsValidName, 'set_sale_endpoint');
        }
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint, 'set_sale_endpoint');
        }
        let txb = this.protocol.CurrentSession();
        let ep = endpoint ? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_STRING, endpoint)) : OptionNone(txb);
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('sale_endpoint_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), ep,
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('sale_endpoint_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), ep,
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_payee(payee, passport) {
        if (!IsValidAddress(payee)) {
            ERROR(Errors.IsValidAddress, 'payee');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('payee_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(payee, BCS.ADDRESS), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('payee_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(payee, BCS.ADDRESS), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    repository_add(repository, passport) {
        if (!Protocol.IsValidObjects([repository])) {
            ERROR(Errors.IsValidObjects, 'repository_add');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('repository_add_with_passport'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, repository), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('repository_add'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, repository), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    repository_remove(repository_address, removeall, passport) {
        if (!removeall && !repository_address) {
            ERROR(Errors.AllInvalid, 'removeall & repository_address');
        }
        if (repository_address && !IsValidArray(repository_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'repository_address');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('repository_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('repository_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(repository_address), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('repository_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('repository_remove'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(repository_address), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    add_withdraw_guards(guards, passport) {
        let bValid = true;
        guards.forEach((v) => {
            if (!Protocol.IsValidObjects([v.guard]))
                bValid = false;
            if (!IsValidPercent(v.percent))
                bValid = false;
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'guards');
        }
        let txb = this.protocol.CurrentSession();
        guards.forEach((guard) => {
            if (passport) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('withdraw_guard_add_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard.guard),
                        txb.pure(guard.percent, BCS.U8), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('withdraw_guard_add'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard.guard), txb.pure(guard.percent, BCS.U8),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        });
    }
    remove_withdraw_guards(guard_address, removeall, passport) {
        if (!removeall && !guard_address) {
            ERROR(Errors.AllInvalid, 'guard_address & removeall');
        }
        if (guard_address && !IsValidArray(guard_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guard_address');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('withdraw_guard_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('withdraw_guard_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(guard_address), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('withdraw_guard_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('withdraw_guard_remove'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(guard_address), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    add_refund_guards(guards, passport) {
        let bValid = true;
        guards.forEach((v) => {
            if (!Protocol.IsValidObjects([v.guard]))
                bValid = false;
            if (!IsValidPercent(v.percent))
                bValid = false;
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'guards');
        }
        let txb = this.protocol.CurrentSession();
        guards.forEach((guard) => {
            if (passport) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('refund_guard_add_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard.guard),
                        txb.pure(guard.percent, BCS.U8), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('refund_guard_add'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard.guard), txb.pure(guard.percent, BCS.U8),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        });
    }
    remove_refund_guards(guard_address, removeall, passport) {
        if (!guard_address && !removeall) {
            ERROR(Errors.AllInvalid, 'guard_address & removeall');
        }
        if (guard_address && !IsValidArray(guard_address, IsValidAddress)) {
            ERROR(Errors.InvalidParam, 'guard_address');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('refund_guard_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('refund_guard_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(guard_address), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('refund_guard_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('refund_guard_remove'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(guard_address), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    is_valid_sale(sales) {
        let bValid = true;
        let names = [];
        sales.forEach((v) => {
            if (!IsValidName(v.item))
                bValid = false;
            if (!IsValidInt(v.price))
                bValid = false;
            if (!IsValidUint(v.stock))
                bValid = false;
            if (names.includes(v.item))
                bValid = false;
            names.push(v.item);
        });
        return bValid;
    }
    add_sale(sales, bExistAssert = false, passport) {
        if (!sales || !this.is_valid_sale(sales)) {
            ERROR(Errors.InvalidParam, 'add_sale');
        }
        let names = [];
        let price = [];
        let stock = [];
        let endpoint = [];
        sales.forEach((s) => {
            if (s.endpoint && !IsValidEndpoint(s.endpoint)) {
                ERROR(Errors.IsValidEndpoint, 'add_sale');
            }
            names.push(s.item);
            price.push(s.price);
            stock.push(s.stock);
            endpoint.push(s.endpoint ?? '');
        });
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('sales_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, names)),
                    txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, endpoint)), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, price)),
                    txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, stock)), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_BOOL, bExistAssert)),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('sales_add'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, names)),
                    txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, endpoint)),
                    txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, price)), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, stock)),
                    txb.pure(Bcs.getInstance().ser(ValueType.TYPE_BOOL, bExistAssert)),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    remove_sales(sales, passport) {
        if (!sales) {
            ERROR(Errors.AllInvalid, 'sales & removeall');
        }
        if (sales && !IsValidArray(sales, IsValidName)) {
            ERROR(Errors.IsValidArray, 'sales');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('sales_remove_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, array_unique(sales))),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('sales_remove'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, array_unique(sales))),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    discount_transfer(discount_dispatch, passport) {
        if (!discount_dispatch || discount_dispatch.length > Service.MAX_DISCOUNT_RECEIVER_COUNT) {
            ERROR(Errors.InvalidParam, 'discount_dispatch');
        }
        let bValid = true;
        discount_dispatch.forEach((v) => {
            if (!IsValidAddress(v.receiver))
                bValid = false;
            if (!IsValidUint(v.count) || v.count > Service.MAX_DISCOUNT_COUNT_ONCE)
                bValid = false;
            if (!IsValidName_AllowEmpty(v.discount.name))
                bValid = false;
            if (v.discount.type == Service_Discount_Type.ratio && !IsValidPercent(v.discount.off))
                bValid = false;
            if (!IsValidUint(v.discount.duration_minutes))
                bValid = false;
            if (v.discount?.time_start && !IsValidUint(v.discount.time_start))
                bValid = false;
            if (v.discount?.price_greater && !IsValidInt(v.discount.price_greater))
                bValid = false;
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'discount_dispatch');
        }
        let txb = this.protocol.CurrentSession();
        discount_dispatch.forEach((discount) => {
            let price_greater = discount.discount?.price_greater ?
                txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_U64, discount.discount.price_greater)) : OptionNone(txb);
            let time_start = discount.discount?.time_start ?
                txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_U64, discount.discount.time_start)) : OptionNone(txb);
            if (passport) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('dicscount_create_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(discount.discount.name),
                        txb.pure(discount.discount.type, BCS.U8),
                        txb.pure(discount.discount.off, BCS.U64), price_greater, time_start,
                        txb.pure(discount.discount.duration_minutes, BCS.U64), txb.pure(discount.count, BCS.U64),
                        Protocol.TXB_OBJECT(txb, this.permission), txb.pure(discount.receiver, BCS.ADDRESS), txb.object(Protocol.CLOCK_OBJECT)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('dicscount_create'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(discount.discount.name),
                        txb.pure(discount.discount.type, BCS.U8),
                        txb.pure(discount.discount.off, BCS.U64), price_greater, time_start,
                        txb.pure(discount.discount.duration_minutes, BCS.U64), txb.pure(discount.count, BCS.U64),
                        Protocol.TXB_OBJECT(txb, this.permission), txb.pure(discount.receiver, BCS.ADDRESS), txb.object(Protocol.CLOCK_OBJECT)],
                    typeArguments: [this.pay_token_type]
                });
            }
        });
    }
    // 同时支持withdraw guard和permission guard
    withdraw(order, passport) {
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'order');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('withdraw_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('withdraw'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_buy_guard(guard, passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (guard) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('buy_guard_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('buy_guard_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (guard) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('buy_guard_set'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('buy_guard_none'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    set_machine(machine, passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (machine) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('machine_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('machine_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (machine) {
                txb.moveCall({
                    target: this.protocol.ServiceFn('machine_set'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.ServiceFn('machine_none'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    set_endpoint(endpoint, passport) {
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint);
        }
        let txb = this.protocol.CurrentSession();
        let ep = endpoint ? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_STRING, endpoint)) : OptionNone(txb);
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('endpoint_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), ep, Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('endpoint_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), ep, Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    publish(passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('publish_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('publish'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    clone(passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            return txb.moveCall({
                target: this.protocol.ServiceFn('clone_withpassport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            return txb.moveCall({
                target: this.protocol.ServiceFn('clone'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_customer_required(pubkey, customer_required, passport) {
        if (!pubkey) {
            ERROR(Errors.InvalidParam, 'pubkey');
        }
        if (!customer_required) {
            ERROR(Errors.InvalidParam, 'customer_required');
        }
        let req = array_unique(customer_required);
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('required_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                    txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, req)),
                    txb.pure(pubkey, BCS.STRING), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('required_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object),
                    txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, req)),
                    txb.pure(pubkey, BCS.STRING), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    remove_customer_required(passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('required_none_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('required_none'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    change_required_pubkey(pubkey, passport) {
        if (!pubkey) {
            ERROR(Errors.InvalidParam, 'pubkey');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('required_pubkey_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(pubkey, 'vector<u8>'),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('required_pubkey_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(pubkey, 'vector<u8>'),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    change_order_required_pubkey(order, pubkey, passport) {
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'order');
        }
        if (!pubkey) {
            ERROR(Errors.InvalidParam, 'pubkey');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('order_pubkey_update_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), txb.pure(pubkey, 'vector<u8>'),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('order_pubkey_update'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), txb.pure(pubkey, 'vector<u8>'),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    pause(pause, passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('pause_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(pause, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('pause'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(pause, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    customer_refund(order, passport) {
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'order');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.ServiceFn('refund_with_passport'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), passport],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.ServiceFn('refund'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    update_order_required_info(order, customer_info_crypto) {
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'order');
        }
        if (!customer_info_crypto.pubkey || !customer_info_crypto.customer_info_crypt) {
            ERROR(Errors.InvalidParam, 'customer_info_crypto');
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ServiceFn('order_required_info_update'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order),
                txb.pure(customer_info_crypto.pubkey, 'vector<u8>'),
                txb.pure(customer_info_crypto.customer_pubkey, 'vector<u8>'),
                txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_VEC_U8, array_unique(customer_info_crypto.customer_info_crypt)))],
            typeArguments: [this.pay_token_type]
        });
    }
    buy(buy_items, coin, discount, machine, customer_info_crypto, passport) {
        if (!buy_items) {
            ERROR(Errors.InvalidParam, 'buy_items');
        }
        let bValid = true;
        let names = [];
        buy_items.forEach((v) => {
            if (!IsValidName(v.item))
                bValid = false;
            if (!IsValidInt(v.max_price))
                bValid = false;
            if (!IsValidUint(v.count))
                bValid = false;
            if (names.includes(v.item))
                bValid = false;
            names.push(v.item);
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'buy_items 2');
        }
        let name = [];
        let price = [];
        let stock = [];
        let order;
        buy_items.forEach((b) => { name.push(b.item); price.push(b.max_price); stock.push(b.count); });
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (discount) {
                order = txb.moveCall({
                    target: this.protocol.ServiceFn('dicount_buy_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, name)),
                        txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, price)), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, stock)),
                        Protocol.TXB_OBJECT(txb, coin), Protocol.TXB_OBJECT(txb, discount), txb.object(Protocol.CLOCK_OBJECT)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                order = txb.moveCall({
                    target: this.protocol.ServiceFn('buy_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, name)),
                        txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, price)),
                        txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, stock)),
                        Protocol.TXB_OBJECT(txb, coin)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (discount) {
                order = txb.moveCall({
                    target: this.protocol.ServiceFn('disoucnt_buy'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, name)),
                        txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, price)),
                        txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, stock)),
                        Protocol.TXB_OBJECT(txb, coin),
                        Protocol.TXB_OBJECT(txb, discount), txb.object(Protocol.CLOCK_OBJECT)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                order = txb.moveCall({
                    target: this.protocol.ServiceFn('buy'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, name)),
                        txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, price)),
                        txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, stock)),
                        Protocol.TXB_OBJECT(txb, coin)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        if (customer_info_crypto) {
            this.update_order_required_info(order, customer_info_crypto);
        }
        if (machine) {
            return txb.moveCall({
                target: this.protocol.ServiceFn('order_create_with_machine'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), Protocol.TXB_OBJECT(txb, machine)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            return txb.moveCall({
                target: this.protocol.ServiceFn('order_create'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    order_bind_machine(order, machine) {
        if (!Protocol.IsValidObjects([order, machine])) {
            ERROR(Errors.IsValidObjects, 'order & machine');
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ServiceFn('order_create_with_machine'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), Protocol.TXB_OBJECT(txb, machine)],
            typeArguments: [this.pay_token_type]
        });
    }
    change_permission(new_permission) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ServiceFn('permission_set'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission), Protocol.TXB_OBJECT(txb, new_permission)],
            typeArguments: [this.pay_token_type]
        });
        this.permission = new_permission;
    }
    static MAX_DISCOUNT_COUNT_ONCE = 200;
    static MAX_DISCOUNT_RECEIVER_COUNT = 20;
    static MAX_GUARD_COUNT = 16;
    static MAX_REPOSITORY_COUNT = 16;
    static parseObjectType = (chain_type) => {
        if (chain_type) {
            const s = 'service::Service<';
            const i = chain_type.indexOf(s);
            if (i > 0) {
                return chain_type.slice(i + s.length, chain_type.length - 1);
            }
        }
        return '';
    };
    static endpoint = (service_endpoint, item_endpoint, item_name) => {
        if (item_endpoint) {
            return item_endpoint;
        }
        else if (service_endpoint) {
            return service_endpoint + '/sales/' + encodeURI(item_name);
        }
    };
}
