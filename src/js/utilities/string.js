'use strict'

export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

String.prototype.capitalize = () => capitalize(this)