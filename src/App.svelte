<script lang="ts">
  import Mce from "./mce/MCE.svelte";

  const selectedInputModes = [
    { target: "original", displayValue: "FAQ 실제 인풋 크기" },
    { target: "full", displayValue: "전체 화면" },
  ];
  let selectedInputMode: "original" | "full" = "full";
  let title = "힛잇 허브는 사용료나 약정이 어떻게 되나요?";
  let answer = "";
</script>

<main>
  <h1>Insert Here!</h1>
  <div class="mode-change">
    ModeChnage
    <div class="input-target">
      {#each selectedInputModes as target}
        <label class:active={selectedInputMode === target.target}>
          <input
            type="radio"
            name={target.target}
            value={target.target}
            bind:group={selectedInputMode}
          />
          {target.displayValue}
        </label>
      {/each}
    </div>
  </div>
  <div class="inputs" class:faq={selectedInputMode === "original"}>
    <div class="title">
      제목<input type="text" bind:value={title} />
    </div>
    <Mce bind:value={answer} />
  </div>

  <h1>FAQ Result</h1>

  <div class="result-wrapper" id="H">
    <div class="question-box box">
      <div class="img" />
      <div class="text">
        {title}
      </div>
    </div>
    <div class="answer-box box">
      <div class="text" id="HITIT-wiswig">
        {@html answer}
      </div>
      <div class="img" />
    </div>
  </div>
</main>

<style lang="scss">
  main {
    text-align: center;
    padding: 1em;

    margin: 0 auto;
    .inputs {
      width: 100%;

      &.faq {
        max-width: 622px;
      }
    }
    h1 {
      color: blue;
      text-transform: uppercase;
      font-size: 4em;
      font-weight: 100;
    }
    .title {
      display: flex;
      align-items: center;
      height: 30px;
      background-color: rgb(188, 186, 186);
      box-sizing: border-box;
      width: 100%;
      padding: 30px;

      input {
        flex-grow: 1;
      }
    }

    .result-wrapper {
      font-family: "AppleSDGothicNeo";
      text-align: left;
      width: 100%;
      box-sizing: border-box;
      padding: 20px 10px;
      background-color: #f0f0f4;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;

      .box {
        display: flex;
        gap: 10px;
      }

      .img {
        min-width: 60px;
        height: 60px;
        background-color: white;
        border-radius: 60px;
      }
      .question-box {
        .text {
          font-size: 1rem;
          font-weight: 500;
          color: #46474b;
          text-align: left;
          word-break: break-all;
        }
      }
      .answer-box {
        justify-content: flex-end;
      }
      .text {
        border-radius: 15px;
        height: max-content;
        padding: 10px 20px;
        background-color: white;
      }
    }
  }
  .mode-change {
    display: flex;
    margin: 10px 0px;
    /* flex-direction: column; */
    align-items: center;
    gap: 10px;
  }
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
