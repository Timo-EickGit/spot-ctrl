<script setup>
import { ref, onMounted } from 'vue'
import {
  getPlayback,
  pausePlayback,
  startPlayback,
  nextPlayback,
  previousPlayback
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

/**
 * update the state
 */
const updateState = async () => {
  console.log('State Update')

  const result = await getPlayback()

  currentlyPlaying.value.is_playing = result.is_playing || false
  currentlyPlaying.value.progress_ms = result.progress_ms || localStorage.getItem('progress')
  currentlyPlaying.value.duration_ms = result.item.duration_ms || localStorage.getItem('duration')
  currentlyPlaying.value.title = result.item.name || localStorage.getItem('name')
  currentlyPlaying.value.imgSrc = result.item.album.images[0].url || localStorage.getItem('imgurl')

  localStorage.setItem('progress', currentlyPlaying.value.progress_ms)
  localStorage.setItem('duration', currentlyPlaying.value.duration_ms)
  localStorage.setItem('name', currentlyPlaying.value.title)
  localStorage.setItem('imgurl', currentlyPlaying.value.imgSrc)
}

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
    <img :src="currentlyPlaying.imgSrc" alt="Album art" class="album-art" />

    <span> {{ currentlyPlaying.title }} </span>

    <span>
      {{ formatTime(currentlyPlaying.progress_ms) }} /
      {{ formatTime(currentlyPlaying.duration_ms) }}
    </span>

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
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

span {
  align-self: center;
  text-align: center;

  width: 100%;
  font-size: 5em;
}

.controller > * {
  margin: 10px;
}

.album-art {
  max-width: 80%;
  align-self: center;
  display: flex;

  border-style: solid;
  border-width: 5px;
  border-radius: 25px;
  border-color: blue;
}

.icon {
  height: 100%;
  object-fit: cover;
}

.controls {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  height: 200px;
}

.play {
  content: url('./icons/play.svg');
}

.pause {
  content: url('./icons/pause.svg');
}

.next {
  content: url('./icons/next.svg');
}

.previous {
  content: url('./icons/skip.svg');
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
