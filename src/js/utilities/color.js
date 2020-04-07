'use strict'

export const hexToRgb = (hex) => {
    
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    }
    
}

export const rgbPercent = (rgb, multiplier = 1) => {

    console.log('in', [...rgb])

    for (let i = 0; i < 3; i++) rgb[i] /= 255 * multiplier

    console.log('out', [...rgb])

    return rgb

}