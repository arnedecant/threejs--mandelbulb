'use strict'

import { random } from './math'

export const getArrayWithNoise = (array, noise) => {
    return array.map(item => item + random(-noise, noise));
}

Array.prototype.noise = () => getArrayWithNoise(this)