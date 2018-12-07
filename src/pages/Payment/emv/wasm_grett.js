/* tslint:disable */
/* eslint-disable */
import * as wasm from './wasm_grett_bg.wasm';

const lTextDecoder = typeof TextDecoder === 'undefined' ? require('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8');

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

export function __wbg_log_504b486a44ed04ba(arg0, arg1) {
    let varg0 = getStringFromWasm(arg0, arg1);
    console.log(varg0);
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? require('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

function passStringToWasm(arg) {

    const buf = cachedTextEncoder.encode(arg);
    const ptr = wasm.__wbindgen_malloc(buf.length);
    getUint8Memory().set(buf, ptr);
    return [ptr, buf.length];
}

const stack = [];

const slab = [{ obj: undefined }, { obj: null }, { obj: true }, { obj: false }];

function getObject(idx) {
    if ((idx & 1) === 1) {
        return stack[idx >> 1];
    } else {
        const val = slab[idx >> 1];

        return val.obj;

    }
}

let slab_next = slab.length;

function dropRef(idx) {

    idx = idx >> 1;
    if (idx < 4) return;
    let obj = slab[idx];

    obj.cnt -= 1;
    if (obj.cnt > 0) return;

    // If we hit 0 then free up our space in the slab
    slab[idx] = slab_next;
    slab_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropRef(idx);
    return ret;
}
/**
* @param {string} arg0
* @returns {any}
*/
export function greet(arg0) {
    const [ptr0, len0] = passStringToWasm(arg0);
    try {
        return takeObject(wasm.greet(ptr0, len0));

    } finally {
        wasm.__wbindgen_free(ptr0, len0 * 1);

    }

}

/**
* @param {string} arg0
* @returns {void}
*/
export function test(arg0) {
    const [ptr0, len0] = passStringToWasm(arg0);
    try {
        return wasm.test(ptr0, len0);

    } finally {
        wasm.__wbindgen_free(ptr0, len0 * 1);

    }

}

function addHeapObject(obj) {
    if (slab_next === slab.length) slab.push(slab.length + 1);
    const idx = slab_next;
    const next = slab[idx];

    slab_next = next;

    slab[idx] = { obj, cnt: 1 };
    return idx << 1;
}

export function __wbg_newwithlength_ebdd1ad475de159b(arg0) {
    return addHeapObject(new Uint8Array(arg0));
}

export function __wbg_fill_f023ddcfc9accd9a(arg0, arg1, arg2, arg3) {
    return addHeapObject(getObject(arg0).fill(arg1, arg2, arg3));
}

export function __wbindgen_object_drop_ref(i) {
    dropRef(i);
}

export function __wbindgen_throw(ptr, len) {
    throw new Error(getStringFromWasm(ptr, len));
}

