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
    gap: 18px;

    label {
      width: 50%;
      padding: 5px;
      text-align: center;
      border: 1px solid #bcbfc3;
      border-radius: 5px;
      color: #6d6f76;
      cursor: pointer;
      background-color: white;
      &.active {
        color: #6591fa;
        border-color: #5b88f4;
      }

      input {
        display: none;
      }
    }
  }
</style>
