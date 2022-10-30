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
export function mergeSort(a, compareFunc){
    if(a.length <= 1) return a;

    let first = mergeSort(
        a.slice(0,a.length/2),
        compareFunc
    );
    let second = mergeSort(
        a.slice(a.length/2,a.length),
        compareFunc
    );

    return merge(first, second, compareFunc);
}
function merge(a, b, compareFunc){
    let out = [];
    while(a.length > 0 && b.length > 0){
        if(compareFunc(a[0], b[0]) > 0){
            out.push(a[0]);
            a.splice(0,1);
        }else{
            out.push(b[0]);
            b.splice(0,1);
        }
    }

    while(a.length>0){
        out.push(a[0]);
        a.splice(0,1);
    }
    while(b.length>0){
        out.push(b[0]);
        b.splice(0,1);
    }
    return out;
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