<script lang="ts">
  //UI
  import Quill from "quill";
  import { onMount } from "svelte";
  //Utils
  //Types
  //Props
  //Constants
  //Variables
  let editor: HTMLDivElement;
  //Functions
  //Do

  onMount(() => {
    const quill = new Quill(editor, {
      modules: {
        clipboard: {
          allowed: {
            tags: [
              "a",
              "b",
              "strong",
              "u",
              "s",
              "i",
              "p",
              "br",
              "ul",
              "ol",
              "li",
              "span",
            ],
            attributes: ["href", "rel", "target", "class", "style"],
          },
          keepSelection: true,
          substituteBlockElements: true,
          magicPasteLinks: true,
          hooks: {
            uponSanitizeElement(node, data, config) {
              console.log(node);
            },
          },
        },
      },
    });
    quill.clipboard.addMatcher("div", (node, delta) => {
      const Delta = Quill.import("delta");
      console.log("??");
      return delta.compose(new Delta().retain(delta.length(), { bold: true }));
    });
    quill.clipboard.addMatcher("img", (node, delta) => {
      const Delta = Quill.import("delta");
      console.log(delta);
      return delta.compose(new Delta().retain(delta.length(), { bold: true }));
    });
  });
</script>

<div class="editor" bind:this={editor} />

<style lang="scss">
  .editor {
    width: 100%;
    height: 100%;

    :global(p) {
      margin: 0;
    }
    :global(.ql-editor) {
      /* width: 100%;
      height: 100%;
      outline: 0px solid transparent;
      word-break: break-all; */
      /* display: none; */
    }
    :global(.ql-clipboard) {
      display: none;
      width: 100%;
      height: 100%;
      max-width: 100%;
      outline: 0px solid transparent;
      word-break: break-all;
      outline: 0px solid transparent;
    }
  }
</style>
