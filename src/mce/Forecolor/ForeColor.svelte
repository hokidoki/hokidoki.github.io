<script lang="ts">
  //UI
  import ColorPicker from "svelte-awesome-color-picker";
  import ForeColorWrapper from "./ForeColorWrapper.svelte";
  //Utils
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";
  //Types
  //Props
  //Constants
  const dispatch = createEventDispatcher();
  //Variables

  let rgb: { r: number; g: number; b: number; a: number };
  let container: HTMLDivElement;
  let isOpen = true;
  //Functions

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  function saveHandler() {
    const { r, g, b } = rgb;
    dispatch("SAVE", rgbToHex(r, g, b));
    console.log(rgb);
  }

  function cancelHandler() {
    dispatch("CANCEL");
  }

  onMount(() => {
    container.addEventListener("SAVE", saveHandler);
  });

  $: !isOpen && cancelHandler();

  //Do
</script>

<div id="fore-color-container" bind:this={container}>
  <ColorPicker
    bind:rgb
    bind:isOpen
    label={"asdsad"}
    isAlpha={false}
    canChangeMode={false}
    components={{ wrapper: ForeColorWrapper }}
  />
</div>

<style lang="scss">
  #fore-color-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-sizing: content-box;
  }
</style>
