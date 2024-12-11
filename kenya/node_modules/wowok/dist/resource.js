import { BCS } from '@mysten/bcs';
import { Protocol } from './protocol';
import { IsValidAddress, IsValidName, IsValidArray, } from './utils';
import { ERROR, Errors } from './exception';
export class Resource {
    static MAX_ADDRESS_COUNT = 600;
    static MAX_TAGS = 8;
    static LikeName = "like";
    static DislikeName = "dislike";
    static FavorName = "favor";
    object;
    protocol;
    get_object() { return this.object; }
    constructor(protocol) {
        this.protocol = protocol;
        this.object = '';
    }
    static From(protocol, object) {
        let r = new Resource(protocol);
        r.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return r;
    }
    add(name, object) {
        if (!IsValidName(name))
            ERROR(Errors.IsValidName, 'add');
        if (!object)
            ERROR(Errors.InvalidParam, 'add');
        if (!IsValidArray(object, IsValidAddress))
            ERROR(Errors.IsValidArray, 'add');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ResourceFn('add'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING), txb.pure(object, 'vector<address>')]
        });
    }
    add2(object, name) {
        if (!IsValidAddress(object))
            ERROR(Errors.IsValidAddress, 'add2');
        if (!IsValidArray(name, IsValidName))
            ERROR(Errors.IsValidArray, 'add2');
        if (!name)
            return;
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ResourceFn('add2'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS), txb.pure(name, 'vector<string>')]
        });
    }
    remove(name, object, removeall) {
        if (!IsValidName(name))
            ERROR(Errors.IsValidName, 'Resource: remove');
        if (!object && !removeall)
            ERROR(Errors.InvalidParam, 'Resource: remove, BOTH param undefined');
        let txb = this.protocol.CurrentSession();
        if (removeall) {
            txb.moveCall({
                target: this.protocol.ResourceFn('remove_all'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING)]
            });
        }
        else if (object) {
            if (!IsValidArray(object, IsValidAddress))
                ERROR(Errors.IsValidArray, 'Resource: remove');
            txb.moveCall({
                target: this.protocol.ResourceFn('remove'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING), txb.pure(object, 'vector<address>')]
            });
        }
    }
    remove2(object, name) {
        if (!IsValidAddress(object))
            ERROR(Errors.IsValidAddress, 'Resource: remove2');
        if (!IsValidArray(name, IsValidName))
            ERROR(Errors.InvalidParam, 'Resource: remove2');
        if (!name)
            return;
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ResourceFn('remove2'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS), txb.pure(name, 'vector<string>')]
        });
    }
    rename(old_name, new_name) {
        if (!IsValidName(new_name))
            ERROR(Errors.IsValidName, 'Resource: rename');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ResourceFn('rename'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(old_name, BCS.STRING), txb.pure(new_name, BCS.STRING)]
        });
    }
    add_tags(object, nick, tags) {
        if (!IsValidAddress(object))
            ERROR(Errors.IsValidAddress, 'add_tags');
        if (!nick || !tags)
            return;
        if (!IsValidName(nick))
            ERROR(Errors.IsValidName, 'add_tags');
        if (!IsValidArray(tags, IsValidName))
            ERROR(Errors.IsValidArray, 'add_tags');
        if (tags.length > Resource.MAX_TAGS)
            ERROR(Errors.InvalidParam, 'add_tags');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ResourceFn('tags_add'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS), txb.pure(nick, BCS.STRING),
                txb.pure(tags, 'vector<string>')
            ]
        });
    }
    remove_tags(object) {
        if (!IsValidAddress(object))
            ERROR(Errors.IsValidAddress, 'Resource: remove_tags');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ResourceFn('tags_remove'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS)]
        });
    }
}
