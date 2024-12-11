import { BCS } from '@mysten/bcs';
import { Protocol } from './protocol';
import { IsValidAddress, IsValidName, } from './utils';
import { ERROR, Errors } from './exception';
export class Wowok {
    object;
    protocol;
    get_object() { return this.object; }
    constructor(protocol) {
        this.protocol = protocol;
        this.object = '';
    }
    static From(protocol) {
        let r = new Wowok(protocol);
        r.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), protocol.WowokObject());
        return r;
    }
    register_grantor(name, grantee_permission) {
        if (!IsValidName(name))
            ERROR(Errors.IsValidName, 'register_grantor');
        if (!Protocol.IsValidObjects([grantee_permission]))
            ERROR(Errors.IsValidObjects, 'register_grantor');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.WowokFn('grantor_register'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING), txb.object(Protocol.CLOCK_OBJECT),
                Protocol.TXB_OBJECT(txb, grantee_permission)]
        });
    }
    grantor_time_expand_1year(grantor) {
        if (!IsValidAddress(grantor))
            ERROR(Errors.IsValidAddress, 'grantor_time_expand_1year');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.WowokFn('grantor_time_expand_1year'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(grantor, BCS.ADDRESS)]
        });
    }
    grantor_rename(new_name) {
        if (!IsValidName(new_name))
            ERROR(Errors.IsValidName, 'grantor_rename');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.WowokFn('grantor_time_expand_1year'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(new_name, BCS.STRING)]
        });
    }
}
