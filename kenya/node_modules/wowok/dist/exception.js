export var Errors;
(function (Errors) {
    Errors["IsValidDesription"] = "invalid description";
    Errors["IsValidName"] = "invalid name";
    Errors["IsValidName_AllowEmpty"] = "invalid name";
    Errors["IsValidEndpoint"] = "invalid endpoint";
    Errors["IsValidAddress"] = "invalid address";
    Errors["IsValidArgType"] = "invalid argument type";
    Errors["IsValidTokenType"] = "invalid token type";
    Errors["IsValidUint"] = "invalid uint";
    Errors["IsValidInt"] = "invalid int";
    Errors["IsValidPercent"] = "invalid percent";
    Errors["IsValidArray"] = "invalid array";
    Errors["IsValidObjects"] = "invalid objects";
    Errors["AllInvalid"] = "one valid at least";
    Errors["InvalidParam"] = "invalid parameter";
    Errors["IsValidPermissionIndex"] = "invalid permission index";
    Errors["IsValidKey"] = "invalid key";
    Errors["Fail"] = "fail";
    Errors["IsValidIndentifier"] = "indentifier invalid";
    Errors["isValidHttpUrl"] = "invalid url";
    Errors["IsValidUserDefinedIndex"] = "invalid user defined permission index";
    Errors["bcsTypeInvalid"] = "invalid bcs type";
})(Errors || (Errors = {}));
export const ERROR = (error, info) => {
    const e = error + info ? (': ' + info) : '';
    throw e;
};
