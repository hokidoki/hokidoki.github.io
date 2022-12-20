<script lang="ts">
  //UI
  //Utils
  //Types
  //Props
  export let selectedTarget: "_blank" | "_self" = "_blank";
  //Constants
  const targets = [
    { target: "_blank", displayValue: "새탭" },
    { target: "_self", displayValue: "현재 탭" },
  ];
  //Variables
  //Functions
  //Do
</script>

<div class="input-target">
  {#each targets as target}
    <label class:active={selectedTarget === target.target}>
      <input
        type="radio"
        name={target.target}
        value={target.target}
        bind:group={selectedTarget}
      />
      {target.displayValue}
    </label>
  {/each}
</div>

<style lang="scss">
  .input-target {
    display: flex;
    gap: 10px;

    label {
      padding: 10px;
      background-color: #d8d9df;
      border-radius: 5px;
      cursor: pointer;
      &.active {
        background-color: #6d6f76;
      }

      input {
        display: none;
      }
    }
  }
</style>
