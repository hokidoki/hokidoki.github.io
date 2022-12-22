<script lang="ts">
  //UI
  import Editor from "@tinymce/tinymce-svelte";
  import { imageSetup } from "./Image/ImageSetup";
  import { linkSetup } from "./Link/Link";
  import { Forecolor } from "./Forecolor/Forecolor";
  import { style_formats } from "./Format/FormatSetup";
  //Utils
  //Types
  //Props
  export let value = "";
  //Constants
  const apiKey = "a0aiq41fhg206d5zmtkad4ybmqfiwtetptg2rncqpc900t6n";
  const conf = {
    menubar: false,
    toolbar:
      "undo redo | styles | color | bold | alignleft aligncenter alignright | __link__ | image",
    plugins: "autoresize paste",
    resize: false,
    statusbar: false,
    height: "auto",
    content_css: "/global.css",
    object_resizing: "img",
    a11y_advanced_options: true,
    resize_img_proportional: true,
    paste_enable_default_filters: false,
    paste_webkit_styles: "color",
    paste_as_text: true,
    style_formats,
    body_id: "HITIT-wiswig",
    paste_block_drop: false, // Paste Options
    setup: (editor: any) => {
      imageSetup(editor);
      linkSetup(editor);
      Forecolor(editor);
      const callback = () => {
        const bodySize = document.documentElement.clientWidth; //View Width;
        const underDesktopSize = 1024;
        const body = editor.getBody() as HTMLBodyElement;
        if (bodySize < underDesktopSize) {
          body.classList.add("layer-under-desktop");
        } else {
          body.classList.remove("layer-under-desktop");
        }
      };

      editor.on("init", () => {
        callback();
        window.addEventListener("resize", callback);
      });
      editor.on("remove", () => {
        window.removeEventListener("resize", callback);
      });
    },
  };
  //Variables
  //Functions
  //Do
</script>

<div class="editor">
  <Editor {apiKey} {conf} bind:value />
</div>

<style lang="scss">
  :global(.tox div[role="menuitemcheckbox"][title="제목"]) {
    height: 42px;
  }
  .editor {
    width: 100%;
    height: 500px;
    background-color: red;

    :global(.tinymce-wrapper) {
      height: 100%;
    }
    :global(.tox-edit-area) {
      position: relative;
    }
    :global(.tox.tox-tinymce) {
      height: 100% !important;
    }
    :global(img.user-import) {
      max-width: 100%;
    }
  }
</style>
