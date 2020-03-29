const assert = require('assert');
const PasswordHelper = require('./../helpers/passwordHelper');

const SENHA = 'TESTE';
const HASH = '$2a$04$2PkVXbFCX2vr0qDF2eJewuDSy6ar8njOnlasHfi1ZyPQMz.SvW5UC';

describe('Passworldcrypt suite test', function () {
    it('Must generate a hash', async () => {
        const result = await PasswordHelper.hashPassword(SENHA);

        assert.ok(result.length > 10);
    });

    it('Must validate a password by comparing with hash', async () => {
        const result = await PasswordHelper.comparePassword(SENHA, HASH);

        assert.ok(result);
    });
})