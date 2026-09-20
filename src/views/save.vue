<script setup>
import "../assets/main.css"
import "@/assets/save.css"

import { ref } from "vue"
import { useRouter } from "vue-router"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { faCopy } from "@fortawesome/free-solid-svg-icons"

import Renderer from "@/components/renderer/Renderer.vue"
import { useClipboard } from "@/composables/useClipboard"
import { useExport } from "@/composables/useExport"
import { useShare } from "@/composables/useShare"
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"
import { useLanguage } from "@/composables/useLanguage"

const router = useRouter()
const markdown = ref(localStorage.getItem("content") || "")
const previewRef = ref(null)

const { copyImage } = useClipboard(previewRef, markdown)
const { exportMarkdown, exportHTML, exportPNG, exportPDF } = useExport(previewRef, markdown)
const { shareX, shareFacebook, shareNative } = useShare()
const { t } = useLanguage()

</script>

<template>
  <div class="save-page">
    <header class="save-header">
      <div class="save-header-brand">
        <img
          src="../components/icons/MangaDown_logo.ico"
          class="md-home-logo"
          alt="MangaDown Logo"
        >
        <div>
          <h1 class="save-title">{{ t("publishTitle") }}</h1>
          <p class="save-subtitle">{{ t("publishSubtitle") }}</p>
        </div>
        <LanguageSwitcher />
      </div>
    </header>

    <main class="save-main">
      <section class="save-content">
        <div class="save-view">
          <div class="save-view-header">
            <span>Preview</span>
            <div class="save-view-actions">
              <button class="save-copy-button" @click="copyImage">
                <FontAwesomeIcon :icon="faCopy" />
                <span>{{ t("copy") }}</span>
              </button>
            </div>
          </div>

          <div ref="previewRef" class="save-preview">
            <Renderer :content="markdown" />
          </div>
        </div>

        <button class="save-back" @click="router.push('/write-md')">← {{ t("back") }}</button>
      </section>

      <aside class="save-actions">
        <section class="save-action-group">
          <h2 class="save-action-title">{{ t("output") }}</h2>
          <div class="save-button-grid">
            <button class="save-action-button" @click="exportMarkdown">Markdown</button>
            <button class="save-action-button" @click="exportHTML">HTML</button>
            <button class="save-action-button" @click="exportPNG">PNG</button>
            <button class="save-action-button" @click="exportPDF">PDF</button>
          </div>
        </section>

        <section class="save-action-group">
          <h2 class="save-action-title">{{ t("share") }}</h2>
          <div class="save-button-grid">
            <button class="save-action-button" @click="shareX()">X</button>
            <button class="save-action-button" @click="shareFacebook()">Facebook</button>
            <button class="save-action-button" @click="shareNative()">{{ t("other") }}</button>
          </div>
        </section>
      </aside>
    </main>
  </div>
</template>