const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { chmodSync } = require('fs');
const { resolve: resolvePath } = require('path');

const { BLOCK_REWARD } = require('./constants');
const { get_public_key_from_private_key, encode, abbreviate, sign } = require('./utils');

// files from env
const keys_file = resolvePath(process.env.BYOB_KEYS_FILE ||
    resolvePath(process.env.USERPROFILE || process.env.HOME, '.byobkeys.json'));
const db_file = resolvePath(process.env.BYOB_DB_FILE ||
    resolvePath(process.cwd(), 'db.json'));

// create/load dbs
const keys_db = low(new FileSync(keys_file));
chmodSync(keys_file, 0o600);
const db = low(new FileSync(db_file));
keys_db.defaults({ keys: {} }).write();
db.defaults({ blocks: {} }).write();


// key related stuff

/**
 * Gets all public keys that we have a corresponding private key for.
 * @returns {string[]} the encoded public keys.
 */
const get_keys = () =>
    keys_db.get('keys').keys().value();

/**
 * Add a private key to the keys database.
 * @param {string|Buffer} private_key The private key to store.
 */
const add_key = (private_key) => {
    keys_db.get('keys')
        .set(
            encode(get_public_key_from_private_key(private_key)),
            encode(private_key))
        .write();
}

/**
 * Creates a function that can be used to sign an object with the private key or keys
 * corresponding to the given public key or keys.
 * @param {string[]|Buffer[]} pubkeys The public key or keys to sign with.
 */
const get_signer = (...pubkeys) => {
    const private_keys = pubkeys.map(x => x instanceof Buffer ? encode(x) : x)
        .map(p => {
            const pk = keys_db.get('keys').get(p).value();
            if (!pk) {
                throw `Cannot sign for ${abbreviate(p)}. No corresponding private key is stored`;
            }

            return pk;
        });

    return (wut) => sign(wut, private_keys);
};


module.exports = {
    get_signer,
    add_key,
    get_keys
};