//Hi sammy this is bea you are a good friend and you should feel good about yourself :)

/**
 * randomly shuffles array
 * @param {array} l 
 */
export function shuffleList(l){
    for(let i = 0; i < l.length; i++){
        let r = Math.floor(Math.random()*l.length);
        let t = l[r];
        l[r] = l[i];
        l[i] = t;
    }
}
/**
 * returns a random string containing only lowercase letters and numbers
 * @param {int} length 
 * @returns {string} 
 */
export function generateRandomString(length){
    let allChars = "abcdefghijklmnopqrstuvwxyz1234567890";
    let out = "";

    for(let i = 0; i < length; i++)
    {
        let r = Math.random()*allChars.length;
        out+=allChars.substring(r, r+1);
    }
    return out;
}
export function deepCopy(original) {
    if (Array.isArray(original)) {
      return original.map(elem => deepCopy(elem));
    }
    else if (typeof original === 'object' && original !== null){
      return Object.fromEntries(
        Object.entries(original)
          .map(([k, v]) => [k, deepCopy(v)]));
    }
    else{
      // Primitive value: atomic, no need to copy
      return original;
    }
}