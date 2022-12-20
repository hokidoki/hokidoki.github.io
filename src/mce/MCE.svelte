<script lang="ts">
  //UI
  import Editor from "@tinymce/tinymce-svelte";
  import { imageSetup } from "./Image/ImageSetup";
  import { linkSetup } from "./Link/Link";
  import { Forecolor } from "./Forecolor/Forecolor";
  //Utils
  //Types
  //Props
  //Constants
  const apiKey = "a0aiq41fhg206d5zmtkad4ybmqfiwtetptg2rncqpc900t6n";
  const conf = {
    menubar: false,
    toolbar:
      "undo redo | color | bold | alignleft aligncenter alignright | __link__ | image",
    plugins: "autoresize",
    resize: false,
    statusbar: false,
    height: "auto",
    content_css: "/a.css",
    object_resizing: "img",
    a11y_advanced_options: true,
    resize_img_proportional: true,
    setup: (editor: any) => {
      imageSetup(editor);
      linkSetup(editor);
      Forecolor(editor);
    },
  };
  //Variables
  //Functions
  //Do
</script>

<div class="editor">
  <Editor {apiKey} {conf} />
</div>

<style lang="scss">
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
