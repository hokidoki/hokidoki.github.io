import Link from "./Link.svelte";
type LinkInfo = {
    displayValue: string,
    url: string,
    target: "_blank" | "_self"
}
export function linkSetup(editor) {
    let open = false;
    editor.ui.registry.addToggleButton("__link__", {
        icon: "link",
        onAction: function (buttonApi) {
            if (open) return;

            const isActive = buttonApi.isActive();
            const area = getEditorArea()
            let text = editor.selection.getContent();
            let url = ""

            if (isActive) {
                const node = editor.selection.getNode() as HTMLAnchorElement;
                text = node.textContent;
                url = node.href
                editor.selection.select(node)
            }
            editor.getBody().setAttribute('contenteditable', false);
            const linkComponent = new Link({
                target: area,
                props: { displayValue: text, url }
            })
            open = true;
            linkComponent.$on("CANCEL", () => {
                open = false
                editor.getBody().setAttribute('contenteditable', true);
                linkComponent.$destroy()
            })

            linkComponent.$on("SAVE", (e: { detail: LinkInfo }) => {
                const a = `<a href="${e.detail.url}" target="${e.detail.target}">${e.detail.displayValue}</a>`
                editor.getBody().setAttribute('contenteditable', true);
                editor.selection.setContent(a)
                linkComponent.$destroy()
                open = false
            })
        },

        onSetup: function (buttonApi: any) {
            const editorEventCallback = function (eventApi) {
                buttonApi.setActive(eventApi.element.nodeName.toLowerCase() === 'a');
            };

            editor.on('NodeChange', editorEventCallback);
        }
    });


}

function getEditorArea() {
    return document.querySelector("div.tox-edit-area") as HTMLElement;
}

