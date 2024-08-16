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

import { NativeModules } from 'react-native'
import fallback from 'base64-js'

const isTurboModuleEnabled = (global as any).__turboModuleProxy != null;

const Base64Module = isTurboModuleEnabled
  ? require('./NativeQuickBase64').default
  : NativeModules.QuickBase64;

if (Base64Module && typeof Base64Module.install === 'function') {
  Base64Module.install()
}

type FuncBase64ToArrayBuffer = (
  data: string,
  removeLinebreaks?: boolean
) => ArrayBuffer
type FuncBase64FromArrayBuffer = (
  data: string | ArrayBuffer,
  urlSafe?: boolean
) => string

declare var base64ToArrayBuffer: FuncBase64ToArrayBuffer | undefined
declare const base64FromArrayBuffer: FuncBase64FromArrayBuffer | undefined

// from https://github.com/beatgammit/base64-js/blob/master/index.js
function getLens(b64: string) {
  let len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  let validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  let placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

function uint8ArrayToString(array: Uint8Array) {
  let out = '',
    i = 0,
    len = array.length
  while (i < len) {
    const c = array[i++] as number
    out += String.fromCharCode(c)
  }
  return out
}

function stringToArrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

export function byteLength(b64: string): number {
  let lens = getLens(b64)
  let validLen = lens[0] as number
  let placeHoldersLen = lens[1] as number
  return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen
}

export function toByteArray(
  b64: string,
  removeLinebreaks: boolean = false
): Uint8Array {
  if (typeof base64ToArrayBuffer !== 'undefined') {
    return new Uint8Array(base64ToArrayBuffer(b64, removeLinebreaks))
  } else {
    return fallback.toByteArray(b64)
  }
}

export function fromByteArray(
  uint8: Uint8Array,
  urlSafe: boolean = false
): string {
  if (typeof base64FromArrayBuffer !== 'undefined') {
    if (uint8.buffer.byteLength > uint8.byteLength || uint8.byteOffset > 0) {
      return base64FromArrayBuffer(
        uint8.buffer.slice(
          uint8.byteOffset,
          uint8.byteOffset + uint8.byteLength
        ),
        urlSafe
      )
    }
    return base64FromArrayBuffer(uint8.buffer, urlSafe)
  } else {
    return fallback.fromByteArray(uint8)
  }
}

export function btoa(data: string): string {
  const ab = stringToArrayBuffer(data)
  if (typeof base64FromArrayBuffer !== 'undefined') {
    return base64FromArrayBuffer(ab)
  } else {
    return fallback.fromByteArray(new Uint8Array(ab))
  }
}

export function atob(b64: string): string {
  const ua = toByteArray(b64)
  return uint8ArrayToString(ua)
}

export function shim() {
  ;(global as any).btoa = btoa
  ;(global as any).atob = atob
}

export const getNative = () => ({
  base64FromArrayBuffer,
  base64ToArrayBuffer,
})

export const trimBase64Padding = (str: string): string => {
  return str.replace(/[.=]{1,2}$/, '')
}
