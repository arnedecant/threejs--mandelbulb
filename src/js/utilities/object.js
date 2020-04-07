export const isEqual = (obj1, obj2) => {

    if (Object.keys(obj1).length !== Object.keys(obj2).length) return false

    for (let key in obj1) {

        if (obj2[key] === undefined) return false
        if (obj1[key] != obj2[key]) return false

    }

    return true

}