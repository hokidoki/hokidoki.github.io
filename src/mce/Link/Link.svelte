<script lang="ts">
  //UI
  import LinkComposite from "./LinkComposite.svelte";
  //Utils
  import { createEventDispatcher } from "svelte";
  import LinkTabSelector from "./LinkTabSelector.svelte";
  import LinkButtons from "./LinkButtons.svelte";
  //Types
  //Props
  export let displayValue = "";
  export let url = "";
  //Constants
  const dispatch = createEventDispatcher();
  //Variables
  let __displayValue = displayValue;
  let __url = url;
  let target: "_blank" | "_self" = "_blank";

  //Functions
  function cancel() {
    dispatch("CANCEL");
  }

  function save() {
    dispatch("SAVE", {
      displayValue: __displayValue || "링크",
      url: __url,
      target,
    });
  }
  //Do
</script>

<div class="link-container">
  <LinkComposite title={"URL"} bind:value={__url} />
  <LinkComposite title={"텍스트"} bind:value={__displayValue} />
  <LinkTabSelector bind:selectedTarget={target} />
  <LinkButtons
    saveButtonDisable={__url === ""}
    on:CANCEL={cancel}
    on:SAVE={save}
  />
</div>

<style lang="scss">
  .link-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 30px;
    width: 400px;
    max-width: calc(100% - 160px);
    box-sizing: border-box;
    position: absolute;
    background-color: white;

    border-radius: 5px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.1);
  }
</style>
