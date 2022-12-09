<script lang="ts">
  import CustomToolbarStyle from "./Component/Editor/CustomToolbarStyle.svelte";
  export let name: string;
</script>

<main>
  <h1>Hello Hitit!</h1>
  <div class="editor">
    <CustomToolbarStyle />
  </div>
</main>

<style lang="scss">
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
    h1 {
      color: blue;
      text-transform: uppercase;
      font-size: 4em;
      font-weight: 100;
    }
  }

  .editor {
    width: 500px;
    height: 500px;
    background-color: gray;
    overflow-y: auto;
    cursor: text;
    padding: 10px;
    box-sizing: border-box;
  }
</style>
