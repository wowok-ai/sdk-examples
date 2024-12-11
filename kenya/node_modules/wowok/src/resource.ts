import { Protocol, FnCallType, TxbObject, ResourceAddress} from './protocol';
import { IsValidDesription, IsValidAddress, IsValidName, IsValidArray,  } from './utils';
import { ERROR, Errors } from './exception';
import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';

export interface Tags { // tag am address
    address: string; // address to tag
    nick: string; //  named address
    tags: string[]; // tags for address
}

export interface ResourceData { // personal folder
    name: string; // folder name
    address: string[]; // objects in folder
}

export class Resource {
    static MAX_ADDRESS_COUNT = 600;
    static MAX_TAGS = 8;

    static LikeName = "like";
    static DislikeName = "dislike";
    static FavorName = "favor";
    static LaunchName = 'launch';
    static OrderName = 'order';

    protected object:TxbObject;
    protected txb;

    get_object() { return this.object }
    private constructor(txb:TransactionBlock) {
        this.txb = txb;
        this.object = '';
    }

    static From(txb:TransactionBlock, object:TxbObject) : Resource {
        let r = new Resource(txb);
        r.object = Protocol.TXB_OBJECT(txb, object);
        return r
    }

    launch() {
        if (!this.object) ERROR(Errors.Fail, 'launch object Invalid');
        this.txb.moveCall({
            target:Protocol.Instance().ResourceFn('create')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    }
    add(name:string, object:string[] | TransactionResult[])  {
        var bString = true;
        if (!IsValidName(name)) ERROR(Errors.IsValidName, 'add.name');
        if (!IsValidArray(object, (item:any) => {
            if (typeof(item) === 'string') {
                return IsValidAddress(item)
            } else {
                bString = false;
            }
            return true;
        })) {
            ERROR(Errors.IsValidArray, 'add.object');
        }

        if (bString) {
            this.txb.moveCall({
                target:Protocol.Instance().ResourceFn('add')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name), 
                    this.txb.pure.vector('address', object as string[])]
            });            
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ResourceFn('add')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name), 
                    this.txb.makeMoveVec({elements:object as TransactionResult[], type:'address'})]
            });   
        }
    }

    add2(object:TxbObject, name:string[])  {
        if (typeof(object) === 'string' && !IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'add2');
        if (!IsValidArray(name, IsValidName)) ERROR(Errors.IsValidArray, 'add2');
        if (!name) return 

        this.txb.moveCall({
            target:Protocol.Instance().ResourceFn('add2')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), typeof(object) === 'string' ? this.txb.pure.address(object) : object, 
                this.txb.pure.vector('string', name)]
        });
    }

    remove(name:string, object:string[], removeall?:boolean)  {
        if (!IsValidName(name)) ERROR(Errors.IsValidName, 'Resource: remove');
        if (object.length===0 && !removeall) return;
        
        if (removeall) {
            this.txb.moveCall({
                target:Protocol.Instance().ResourceFn('remove_all')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name)]
            });
        } else if(object) {
            if (!IsValidArray(object, IsValidAddress)) ERROR(Errors.IsValidArray, 'Resource: remove');

            this.txb.moveCall({
                target:Protocol.Instance().ResourceFn('remove')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name), 
                    this.txb.pure.vector('address', object)]
            });
        }
    }

    remove2(object:string, name:string[])  {
        if (!IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'Resource: remove2');
        if (!IsValidArray(name, IsValidName)) ERROR(Errors.InvalidParam, 'Resource: remove2');
        if (!name) return
        
        this.txb.moveCall({
            target:Protocol.Instance().ResourceFn('remove2')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(object), 
                this.txb.pure.vector('string', name)]
        });
    }

    rename(old_name:string, new_name:string)  {
        if (!IsValidName(new_name)) ERROR(Errors.IsValidName, 'Resource: rename');
        
        this.txb.moveCall({
            target:Protocol.Instance().ResourceFn('rename')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(old_name), 
                this.txb.pure.string(new_name)]
        }); 
    }

    add_tags(object:string, nick:string, tags:string[]) {
        if (!IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'add_tags');
        if (!nick || !tags) return;
        if (!IsValidName(nick)) ERROR(Errors.IsValidName, 'add_tags');
        if (!IsValidArray(tags, IsValidName)) ERROR(Errors.IsValidArray, 'add_tags');
        if (tags.length > Resource.MAX_TAGS) ERROR(Errors.InvalidParam, 'add_tags');

        const encode = new TextEncoder();
        this.txb.moveCall({
            target:Protocol.Instance().ResourceFn('tags_add')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(object), 
                this.txb.pure.string(nick),
                this.txb.pure.vector('string', tags)
            ]
        });
    }

    remove_tags(object:string) {
        if (!IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'Resource: remove_tags');
        
        this.txb.moveCall({
            target:Protocol.Instance().ResourceFn('tags_remove')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(object)]
        });
    }
}

