<template>
  <div>redirecting ... ... ... </div>
</template>

<script setup>
import { getToken, localStorage_access_token } from '@/token'
import { onMounted } from 'vue'

onMounted(async () =>  {
  const urlParams = new URLSearchParams(window.location.search)
  let code = urlParams.get('code')
  
  const result = await getToken(code)

  console.log(result);

  if (localStorage.getItem(localStorage_access_token) != null) {
    window.location = '/ctrl'
  } else {
    window.location = '/auth'
  }
})
</script>
