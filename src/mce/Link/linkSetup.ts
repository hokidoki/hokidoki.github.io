// import Link from "./Link.svelte";
export function linkSetup(editor) {

    editor.ui.registry.addButton("__link__", {
        icon: "link",
        onAction: function (_) {
            const text = editor.selection.getContent();
            const area = getEditorArea()
            const a = `<a href="www.naver.com">${text}</a>`
            // const linkComponent = new Link({
            //     target: area
            // })

            // linkComponent.$on("cancel", () => {
            //     linkComponent.$destroy()
            // })

            editor.selection.setContent(a)
            // console.log(editor.dom.)
            //    
        },
    });


}

function getEditorArea() {
    return document.querySelector("div.tox-edit-area") as HTMLElement;
}
