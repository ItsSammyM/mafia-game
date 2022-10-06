/**
 * @param {string} title
 * @param {string} text
 * @param {string} color
 */
export class ChatMessageState{
    constructor(title, text, color=null){
        this.title = title;
        this.text = text;
        this.color = color;
    }
}