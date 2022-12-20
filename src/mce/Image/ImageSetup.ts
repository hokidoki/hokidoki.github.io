export function imageSetup(editor: any) {
    const fileInput = document.createElement("input");
    fileInput.style.display = "none";
    fileInput.accept = "image/*"
    fileInput.type = "file";
    document.body.appendChild(fileInput);
    fileInput.addEventListener("change", (e: Event) => {
        const target = e.target as HTMLInputElement;

        if (!target || !target.files) return;
        const __file = target.files[0];

        const extMatch = __file.name.match(
            /(\.png|\.jpg|\.jpeg|\.JPG|\.JPEG|\.PNG)$/
        );
        if (!extMatch) {
            alert("지원되지 않는 포맷입니다. png,jpg,jpeg만 가능합니다.");
            return;
        }
        const url = URL.createObjectURL(__file);
        editor.insertContent(
            `<figure><img class="user-import" src="${url}"/></figure>`
        );
        fileInput.value = ""

    })

    const isImageElement = (node) => {
        return node.nodeName.toLowerCase() === 'img'
    };

    const getImage = () => {
        var node = editor.selection.getNode() as HTMLImageElement;
        return isImageElement(node) ? node : null;
    }
    editor.ui.registry.addButton("image", {
        icon: "image",
        onAction: function (_) {
            fileInput.click();
        },
    });

    editor.ui.registry.addContextForm('link-form', {
        launch: {
            type: 'contextformbutton',
            text: 'link',
        },
        position: "node",
        predicate: isImageElement,
        initValue: () => {
            const image = getImage();
            return image.width;
        },
        commands: [
            {
                type: 'contextformbutton',
                tooltip: 'Link',
                text: "확인",
                primary: true,
                onSetup: (api) => {
                    console.log(api)
                },
                onAction: (formApi) => {
                    const newWidth = Number(formApi.getValue());

                    console.log(editor.ui.registry.getAll().buttons.forecolor.onAction)
                    console.log(editor.ui.registry.getAll().buttons.forecolor.onItemAction)
                    console.log(editor.ui.registry.getAll().buttons.forecolor.select)
                    console.log(editor.ui.registry.getAll().buttons.forecolor)
                    if (isNaN(newWidth) || newWidth <= 0) return;

                    const image = getImage();
                    const newHeight = (image.height / image.width) * newWidth
                    const width = `${Math.ceil(newWidth)}px`
                    const height = `${Math.ceil(newHeight)}px`
                    editor.dom.setAttribs(image, { width, height })
                    editor.selection.collapse()

                    formApi.hide();
                }
            },
        ]
    })

    // editor.on("click", (e: Event) => {
    //     const target = e.target as HTMLElement;
    //     if (target.classList.contains("user-import")) {
    //     }
    // });
}

