import Enum from 'enum'

const SecretType = new Enum({
    "OTP"               : 2,
    "PASSWORD"          : 1
});

export default SecretType;