<script setup lang="ts">
const emit = defineEmits<{
  next: []
}>();

</script>

<template>
  <div class="start-page">
    <div class="start-page__black"></div>
    <div class="start-page__logo">
      <img class="start-page__logo__menu" src="../assets/menu.svg" />
    </div>
    <div class="start-page__content">
      <img src="../assets/logo.svg" />
      <h1 class="start-page__title">Test your video streaming</h1>
      <div class="selector">
        <div class="selector__choice-area">
          <label class="selector__choice">
            <input type="radio" name="video-source-type" value="default" checked/>
            Default
          </label>

          <label class="selector__choice">
            <input type="radio" name="video-source-type" value="custom" readonly/>
            Choose Video
          </label>
        </div>
        <input class="selector__input" type="text" readonly
               value="https://cdn.bitmovin.com/content/demos/4k/38e8&hellip;79b4dc/manifest.m3u8"/>
        <button class="selector__button"
          @click="emit('next')"
        >Run Test</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.start-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  padding: 64px;
  z-index: 0;
  position: relative;

  &__black {
    display: block;
    position: absolute;
    background-color: black;
    width: 15px;
    height: 15px;
    left: 64px + 164px - 2px;
    top: 64px;
    z-index: 10;

    &::before {
      content: '';
      display: block;
      position: absolute;
      background-color: black;
      width: 15px;
      height: 15px;
      border-top-left-radius: 15px;
      border-color: #EA5035;
      border-width: 2px 0 0 2px;
      border-style: solid;

      top: 0;
      left: 0;
    }
  }

  &__logo {
    position: absolute;
    left: 64px;
    top: 64px;
    height: 82px;
    width: 164px;
    border-style: solid;
    border-color: black #EA5035 #EA5035 black;
    border-bottom-right-radius: 15px;
    border-top-left-radius: 15px;
    border-width: 2px;
    z-index: 5;

    display: flex;
    justify-content: center;
    align-items: center;

    &::before {
      content: '';
      display: block;
      position: absolute;
      background-color: black;
      width: 15px;
      height: 15px;
      left: -2px;
      top: 100%;
    }

    &::after {
      content: '';
      display: block;
      position: absolute;
      background-color: black;
      width: 15px;
      height: 15px;
      border-top-left-radius: 15px;
      border-color: #EA5035;
      border-width: 2px 0 0 2px;
      border-style: solid;

      left: -2px;
      top: 100%;
    }

    &__menu {
      margin-right: 12px;
      margin-bottom: 12px;
    }
  }

  &::before {
    position: absolute;
    left: 64px;
    right: 64px;
    top: 64px;
    bottom: 0;
    content: '';
    display: block;
    border-style: solid;
    border-color: #EA5035;
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    border-width: 2px 2px 0;
  }

  &__content {
    width: 100%;
    z-index: 3;
    padding: 160px;
  }

  &__title {
    font-size: 48px;
    margin-bottom: 20px;
    font-weight: bold;
  }
}

.selector {
  display: flex;
  flex-wrap: wrap;

  &__input {
    flex-grow: 1;
    height: 58px;
    border: 1px solid #596069;
    background: transparent;
    border-radius: 0;
    border-right-width: 0;
    color: white;
    font-size: 16px;
    padding: 0 16px;

    &:focus {
      outline: none;
      border-color: white;
    }
  }

  &__button {
    border: none;
    border-radius: 0;
    background-color: #EA5035;
    color: white;
    height: 58px;
    padding: 0 38px;
    font-weight: bold;
    font-size: 20px;

    &:hover {
      background-color: lighten(#EA5035, 10);
      cursor: pointer;
    }
  }

  &__choice-area {
    flex-basis: 100%;
    margin-bottom: 26px;
    font-size: 20px;
  }

  &__choice {
    margin-right: 54px;
  }
}
</style>
