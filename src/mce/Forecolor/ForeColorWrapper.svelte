<script lang="ts">
  //UI
  //Utils
  //Types
  //Props
  export let wrapper: HTMLDivElement;
  export let isOpen: boolean;
  export let isPopup: boolean;
  export let toRight: boolean;
  //Constants

  //Variables
  //Functions
  function saveHandler() {
    const event = new Event("SAVE");
    const container = wrapper.parentElement.parentElement;
    container.dispatchEvent(event);
    //
  }

  function cancelHandler() {
    const event = new Event("CANCEL");
    const container = wrapper.parentElement.parentElement;
    container.dispatchEvent(event);
  }
  //Do
</script>

<div bind:this={wrapper} class:isOpen class="picker-wrapper">
  <slot />
  <div class="buttons">
    <button class="cancel" on:click={cancelHandler}> 취소 </button>
    <button class="save" on:click={saveHandler}> 확인 </button>
  </div>
</div>

<style lang="scss">
  .picker-wrapper {
    padding: 8px 5px 5px 8px;
    width: 224px;
    margin: 0 10px 10px;
    border-radius: 12px;
    display: flex;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-sizing: content-box;
    border: 1px solid rgb(173, 173, 173);
    z-index: 2;
    &.isOpen {
      display: flex;
      flex-wrap: wrap;
    }
    :global(.text-input) {
      width: 100%;
      margin: 10px 0px !important;
    }

    :global(.picker-wrapper) {
      width: 200px;
      height: 200px;
      margin-right: 5px;
    }

    :global(.slider-wrapper) {
      width: 10px;
      height: 200px;
      margin-right: 5px;
    }
    :global(*) {
      box-sizing: content-box;
    }
    :global(.picker-indicator) {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: white;
      border-radius: 5px;
      z-index: 5;
    }
    :global(.slider-indicator) {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: white;
      border-radius: 5px;
      z-index: 5;
    }

    :global(.input-container input) {
      height: 30px;
      background-color: #eee;
      padding: 0px 10px;
    }
    .buttons {
      width: 100%;
      gap: 10px;
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;

      button {
        cursor: pointer;
        color: white;
        font-weight: 500;
        display: flex;
        align-items: center;
        height: 40px;
        border-radius: 5px;
        justify-content: center;
        font-size: 1.25rem;
      }

      .cancel {
        width: 92px;
        background-color: #bcbfc3;
      }

      .save {
        flex-grow: 1;
        background-color: #6d6f76;
      }
    }
  }
</style>
