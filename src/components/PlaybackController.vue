<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  getPlayback,
  pausePlayback,
  startPlayback,
  nextPlayback,
  previousPlayback,
  seekToPosition,
  setVolume
} from '@/ctrlSpot'

const wait_before_refresh = 2000
const currentlyPlaying = ref([])

/**
 * Updates the progress
 */
setInterval(() => {
  if (currentlyPlaying.value.is_playing) {
    // increase the displayed time by 1 second
    currentlyPlaying.value.progress_ms = currentlyPlaying.value.progress_ms + 1000

    // if the song is past its playtime update it
    if (currentlyPlaying.value.progress_ms > currentlyPlaying.value.duration_ms) {
      console.log('timed update')
      updateState()
    }
  }
}, 1000)

/**
 * goes to the next track
 */
const previousTrack = () => {
  previousPlayback()
  setTimeout(() => updateState(), wait_before_refresh)
}

/**
 * toggles the playback
 */
const togglePlayback = () => {
  const elm = document.getElementById('playback_toggle')

  if (elm.classList.toggle('play')) {
    startPlayback()
    currentlyPlaying.value.is_playing = true
  }

  if (elm.classList.toggle('pause')) {
    pausePlayback()
    currentlyPlaying.value.is_playing = false
  }

  setTimeout(() => updateState(), wait_before_refresh)
}

/**
 * goes to the next track
 */
const nextTrack = () => {
  nextPlayback()
  setTimeout(() => updateState(), wait_before_refresh)
}

const jumpTo = async (jumpTo_ms) => {
  await seekToPosition(jumpTo_ms)
  currentlyPlaying.value.progress_ms = jumpTo_ms
}

const setVol = async (targetVolume) => {
  await setVolume(targetVolume)
  currentlyPlaying.value.volume = targetVolume
}

/**
 * update the state
 */
const updateState = async () => {
  console.log('State Update')

  const result = await getPlayback()

  currentlyPlaying.value.volume = result.device.volume_percent
  currentlyPlaying.value.is_playing = result.is_playing
  currentlyPlaying.value.progress_ms = result.progress_ms
  currentlyPlaying.value.duration_ms = result.item.duration_ms
  currentlyPlaying.value.title = result.item.name
  currentlyPlaying.value.imgSrc = result.item.album.images[0].url
}

watch(
  currentlyPlaying,
  (newValue) => {
    localStorage.setItem('lastPlayed', JSON.stringify(newValue))
  },
  { deep: true }
)

/**
 * Formats the time for displaying
 * @param miliseconds time in milliseconds
 * @returns time in minutes and seconds
 */
const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds
  return `${minutes}:${formattedSeconds}`
}

onMounted(() => {
  updateState()
})
</script>

<template>
  <div class="controller">
    <div class="leftToRight">
      <img :src="currentlyPlaying.imgSrc" alt="Album art" class="album-art" />
      <input
        type="range"
        orient="vertical"
        min="1"
        :max="100"
        :value="currentlyPlaying.volume"
        @change="setVol($event.target.value)"
      />
    </div>

    <span> {{ currentlyPlaying.title }} </span>

    <span>
      {{ formatTime(currentlyPlaying.progress_ms) }} /
      {{ formatTime(currentlyPlaying.duration_ms) }}
    </span>

    <input
      type="range"
      min="1"
      :max="currentlyPlaying.duration_ms"
      :value="currentlyPlaying.progress_ms"
      @change="jumpTo($event.target.value)"
    />

    <div class="controls">
      <img
        alt="previous"
        class="clickable icon previous"
        id="playback_previous"
        @click="previousTrack()"
      />

      <img
        alt="play"
        class="icon"
        id="playback_toggle"
        v-bind:class="{ play: currentlyPlaying.is_playing, pause: !currentlyPlaying.is_playing }"
        @click="togglePlayback()"
      />

      <img alt="next" class="clickable icon next" id="playback_next" @click="nextTrack()" />
    </div>
  </div>
</template>

<style scoped>
.controller {
  display: flex;

  flex-direction: column;
  align-content: center;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;
}

span {
  width: 80%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  text-align: center;

  font-size: 3em;
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 75%;
  height: 35px;

  border-radius: 25px;
  background-color: black;
  align-self: center;
}

input[type='range'][orient='vertical'] {
  appearance: none;
  writing-mode: vertical-lr;
  direction: rtl;
  height: 60%;
  width: 40px;

  margin: 20px;
}

.controller > * {
  padding: 10px;
}

.album-art {
  max-height: 75%;
  height: auto;

  max-width: 80%;
  width: auto;

  align-self: center;
  display: flex;

  border-style: solid;
  border-width: 5px;
  border-radius: 25px;
  border-color: blue;
}

.leftToRight {
  max-height: 50%;

  height: auto;
  width: 100%;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
}

.controls {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;

  width: auto;
  height: 25%;
}

.icon {
  height: 100%;
  object-fit: cover;
}

.play {
  content: url('@/assets/icons/play.svg');
}

.pause {
  content: url('@/assets/icons/pause.svg');
}

.next {
  content: url('@/assets/icons/next.svg');
}

.previous {
  content: url('@/assets/icons/skip.svg');
}

.clickable:active {
  animation: regrow 0.6s ease; /* Apply regrow animation on click */
  transform: scale(0.8); /* Shrink the element on click */
}

.clickable {
  transition: transform 0.6s ease; /* Smooth transition for scaling */
}

/* Define a keyframe animation to regrow the element */
@keyframes regrow {
  0% {
    transform: scale(0.8);
  }
  100% {
    transform: scale(1);
  }
}
</style>
