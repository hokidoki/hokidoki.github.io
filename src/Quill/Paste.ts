import Quill from "quill";
const Clipboard = Quill.import('modules/clipboard')
const Delta = Quill.import('delta')

export class PlainClipboard extends Clipboard {
    onPaste(e: any) {
        e.preventDefault()
        const root = this.quill.root as HTMLDivElement
        const range = this.quill.getSelection() //Position
        const text = e.clipboardData.getData('text/plain')
        const delta = new Delta()
            .retain(range.index)
            .delete(range.length)
            .insert(text)
        const index = text.length + range.index
        const length = 0
        this.quill.updateContents(delta, 'silent')
        this.quill.setSelection(index, length, 'silent')
        this.quill.scrollIntoView()

    }
}
