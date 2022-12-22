import ForeColor from "./ForeColor.svelte";
import TextColor from "../../Icon/TextColor.svg"
const tooltip = `font-color`;
const __colors = [
    "#333338", "gray6",
    "#46474B", "gray5",
    "#6D6F76", "gray4",
    "#BCBFC3", "gray3",
    "#D8D9DF", "gray2",
    "#E6E7ED", "gray1",
    "#E54848", "red",
    "#10C181", "green",
    "#FFCE00", "yellow",
    "#3C68D6", "blue_dark",
    "#6591FA", "blue_main",
    "#A5C1F9", "blue_light"
]


export function Forecolor(editor, colors = __colors, defaultColor = "#46474B") {

    const pickerValue = "picker"
    const addedColorNames = addColorIcons(editor, colors)
    const DEFAULT_TEXT_COLOR_ICON = "DEFAULT_TEXT_COLOR_ICON"
    let currentColor = defaultColor
    editor.ui.registry.addIcon(DEFAULT_TEXT_COLOR_ICON, TextColor);

    editor.ui.registry.addSplitButton('color', {
        icon: DEFAULT_TEXT_COLOR_ICON,
        tooltip: tooltip,
        columns: 5,
        onAction: function () {
            editor.execCommand('ForeColor', false, currentColor);
        },
        onSetup: function (_) {
            setIconColor(currentColor)
        },
        onItemAction: function (api, value) {
            if (value === pickerValue) {
                const editArea = getEditorArea()
                const foreColorComponent = new ForeColor({
                    target: editArea
                })
                editor.getBody().setAttribute('contenteditable', false);
                foreColorComponent.$on("SAVE", (e: { detail: string }) => {
                    const { detail } = e;
                    editor.getBody().setAttribute('contenteditable', true);
                    editor.execCommand('ForeColor', false, detail);
                    currentColor = detail
                    setIconColor(currentColor)
                    foreColorComponent.$destroy()
                })
                foreColorComponent.$on("CANCEL", () => {
                    editor.getBody().setAttribute('contenteditable', true);
                    foreColorComponent.$destroy()
                })
            } else {
                currentColor = value
                setIconColor(currentColor)
                editor.execCommand('ForeColor', false, value);
            }
        },
        fetch: function (callback) {
            const items = addedColorNames.map((v) => {
                return {
                    type: 'choiceitem',
                    icon: `${v.name}`,
                    value: v.hax,
                }
            })

            const picker = {
                type: "choiceitem",
                icon: "color-picker",
                value: pickerValue
            }

            callback([...items, picker]);
        }
    });
}

function addColorIcons(editor, colors) {
    const colorNames = [];
    for (let i = 0; i < colors.length; i += 2) {
        editor.ui.registry.addIcon(colors[i + 1], `<div style="width:24px;height:24px;background : ${colors[i]}" />`);
        colorNames.push({
            hax: colors[i],
            name: colors[i + 1]
        })
    }

    return colorNames

}


function getEditorArea() {
    return document.querySelector("div.tox-edit-area") as HTMLElement;
}

function setIconColor(color: string) {
    const button = document.querySelector(`div[title=${tooltip}]`) as HTMLDivElement
    const COLOR_ID = "tox-icon-text-color__color"
    const colorEL = button.querySelector("#" + COLOR_ID) as SVGPathElement;

    colorEL.style.fill = color;
}