import Enum from 'enum'

const FieldType = new Enum({
    "String"        : 1,
    "Number"        : 2,
    "Date"          : 3,    
    "Boolean"       : 4,    
    "ObjectId"      : 5,
    "Array"         : 6,    
    "BigInt"        : 7,
    "Mixed"         : 8
});

export default FieldType;