const { ok } = require('assert');

const { generate_nonce, calculate_target } = require('../src/utils');
const { solve } = require('../src/solver');


module.exports = {
    'solver can solve an easy problem quickly 1': async () => ok(await solve(generate_nonce(), calculate_target(1000, 1))),
    'solver can solve an easy problem quickly 2': async () => ok(await solve(generate_nonce(), calculate_target(1000, 1))),
    'solver can solve an easy problem quickly 3': async () => ok(await solve(generate_nonce(), calculate_target(1000, 1))),
    'solver can solve an not-so-easy problem': async () => ok(await solve(generate_nonce(), calculate_target(1000, 1000))),
}