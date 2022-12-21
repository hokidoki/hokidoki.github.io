<script lang="ts">
  //UI
  //Utils
  //Types
  //Props
  export let title = "";
  export let value = "";
  //Constants
  //Variables
  //Functions
  //Do
</script>

<div class="link-box">
  <span class="link-title">
    {title}
  </span>
  <input class="link-input" type="text" bind:value />
</div>

<style lang="scss">
  .link-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .link-title {
      color: #6d6f76;
      font-size: 1rem;
    }

    .link-input {
      background-color: #f0f0f4;
      box-sizing: border-box;
      padding: 10px;
      height: 40px;
      width: 100%;
      border-radius: 5px;
    }
  }
</style>
