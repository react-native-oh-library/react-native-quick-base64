/*
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { NativeModules } from 'react-native';

// @ts-ignore We want to check whether __turboModuleProxy exitst, it may not
const isTurboModuleEnabled = global.nativeModuleProxy != null;

const Base64Module = isTurboModuleEnabled
  ? require('./NativeQuickBase64').default
  : NativeModules.QuickBase64;

  declare global {
  var base64ToArrayBuffer: FuncBase64ToArrayBuffer
  var base64FromArrayBuffer: FuncBase64FromArrayBuffer
}

type FuncBase64ToArrayBuffer = (
  data: string,
  removeLinebreaks?: boolean
) => ArrayBuffer

type FuncBase64FromArrayBuffer = (
  data: string | ArrayBuffer,
  urlSafe?: boolean
) => string

if (Base64Module && typeof global.base64FromArrayBuffer !== 'function') {
  Base64Module.install()
}

/**
 * Calculates valid length and placeholder length for base64 string
 */
function getLens(b64: string) {
  const len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  let validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4)

  return [validLen, placeHoldersLen] as const
}

/**
 * Converts Uint8Array to string
 */
function uint8ArrayToString(array: Uint8Array) {
  let out = ''
  for (let i = 0; i < array.length; i++) {
    const charCode = array[i]
    if (charCode !== undefined) {
      out += String.fromCharCode(charCode)
    }
  }
  return out
}

/**
 * Converts string to ArrayBuffer
 */
function stringToArrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

/**
 * Calculates the byte length of a base64 string
 */
export function byteLength(b64: string) {
  const [validLen, placeHoldersLen] = getLens(b64)
  return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen
}

/**
 * Converts base64 string to Uint8Array
 */
export function toByteArray(
  b64: string,
  removeLinebreaks: boolean = false
): Uint8Array {
  return new Uint8Array(global.base64ToArrayBuffer(b64, removeLinebreaks))
}

/**
 * Converts Uint8Array to base64 string
 */
export function fromByteArray(
  uint8: Uint8Array,
  urlSafe: boolean = false
): string {
  if (uint8.buffer.byteLength > uint8.byteLength || uint8.byteOffset > 0) {
    const buffer =
      uint8.buffer instanceof ArrayBuffer
        ? uint8.buffer.slice(
            uint8.byteOffset,
            uint8.byteOffset + uint8.byteLength
          )
        : new ArrayBuffer(uint8.byteLength)

    if (buffer instanceof ArrayBuffer) {
      return global.base64FromArrayBuffer(buffer, urlSafe)
    }
  }

  const buffer =
    uint8.buffer instanceof ArrayBuffer
      ? uint8.buffer
      : new ArrayBuffer(uint8.byteLength)
  return global.base64FromArrayBuffer(buffer, urlSafe)
}

/**
 * Base64 encode a string
 * @deprecated Use native btoa() instead - now supported in Hermes
 */
export function btoa(data: string) {
  return global.base64FromArrayBuffer(stringToArrayBuffer(data), false)
}

/**
 * Base64 decode a string
 * @deprecated Use native atob() instead - now supported in Hermes
 */
export function atob(b64: string) {
  return uint8ArrayToString(toByteArray(b64))
}

/**
 * Adds btoa and atob to global scope
 */
export function shim() {
  ;(global as any).btoa = btoa
  ;(global as any).atob = atob
}

/**
 * Returns native base64 functions
 */
export const getNative = () => ({
  base64FromArrayBuffer: global.base64FromArrayBuffer,
  base64ToArrayBuffer: global.base64ToArrayBuffer
})

/**
 * Removes padding characters from base64 string
 */
export const trimBase64Padding = (str: string) => {
  return str.replace(/[.=]{1,2}$/, '')
}
