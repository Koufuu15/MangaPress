<template>
  <LanguageSwitcher />
  <label for="url">{{ t("urlLabel") }}</label><br>
  <input id="url" type="url" :placeholder="t('urlPlaceholder')" v-model="url"/>
  <input type="button" :value="t('load')" @click="parseUrl"/>

  <div class="flexbox">
    <div class="manga">
      <p v-if="isLoading">{{ t("thinking") }}</p>
      <p v-else-if="!url">{{ t("enterUrl") }}</p>
      <p v-else-if="resMd">{{ resMd }}</p>
      <p v-else-if="!res">{{ t("fetchFailed") }}</p>
    </div>
    <div class="manga">
      <p v-if="resImg" v-html="resImg"></p>
      <p v-else>{{ t("preview") }}</p>
    </div>
  </div>

  <input type="button" :value="t('editInEditor')" @click="gotoEditor(resMd)"/>
  <input type="button" :value="t('publishNow')" @click="$router.push('/save')"/>
  <input type="button" :value="t('home')" @click="$router.push('/')"/>
</template>

<script setup>
import { ref } from 'vue'
import '../assets/main.css'

import { useRouter } from 'vue-router'
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"
import { useLanguage } from "@/composables/useLanguage"
const router = useRouter()
const { t } = useLanguage()

const url = ref('')
const resMd = ref('')
const resImg = ref('')
const isLoading = ref(false)

function gotoEditor(md) {
  localStorage.setItem('content', md)
  router.push('/write-md')
}

function parseUrl() {
  /*
  ここでURLを解析して、生成したMDをresに格納する処理を書く
  if (urlが正しい) 
    url=取得したURL
    AIにレスポンスを投げる
    isLoading=true
    if (AIからレスポンスが返ってきたら)
      isLoading=false
      resMd=AIからのレスポンス
      resImg=AIからのレスポンスをhtmlに変換したもの
      export default {
        props: {
          dataMd: String
        }
      }
      が必要かも。それをrouter.jsで受け取ってwriteMD.vueに渡す
  else url=''
  */
}

</script>

<style scoped>
.flexbox div {
  display: inline-block;
  padding: 1rem;
  margin-bottom: 1rem;
}
</style>