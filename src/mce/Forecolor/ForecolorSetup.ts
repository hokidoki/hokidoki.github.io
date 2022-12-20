export function Forecolor(editor: any) {
    editor.ui.registry.addSplitButton('color', {
        text: 'My Button',
        icon: 'info',
        tooltip: 'This is an example split-button',
        onAction: function () {
            editor.insertContent('<p>You clicked the main button</p>');
        },
        onItemAction: function (api, value) {
            editor.insertContent(value);
        },
        fetch: function (callback) {
            var items = [
                {
                    type: 'choiceitem',
                    icon: 'notice',
                    text: 'Menu item 1',
                    value: '&nbsp;<em>You clicked menu item 1!</em>'
                },
                {
                    type: 'choiceitem',
                    icon: 'warning',
                    text: 'Menu item 2',
                    value: '&nbsp;<em>You clicked menu item 2!</em>'
                }
            ];
            callback(items);
        }
    });
}