<script lang="ts">
  //UI
  //Utils
  import { createEventDispatcher } from "svelte";
  //Types
  //Props
  export let saveButtonDisable = false;
  //Constants
  const dispatch = createEventDispatcher();
  //Variables
  //Functions
  function cancel() {
    dispatch("CANCEL");
  }

  function save() {
    dispatch("SAVE");
  }
  //Do
</script>

<div class="buttons">
  <button class="cancel" on:click={cancel}> 취소 </button>
  <button class="save" disabled={saveButtonDisable} on:click={save}>
    확인
  </button>
</div>

<style lang="scss">
  .buttons {
    width: 100%;
    gap: 10px;
    display: flex;
    justify-content: flex-end;

    button {
      cursor: pointer;
    }
  }
</style>
