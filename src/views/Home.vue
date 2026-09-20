<script setup>
import { useRouter } from "vue-router"
import "../assets/Home.css"
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"
import { useLanguage } from "@/composables/useLanguage"

const router = useRouter()
const { t } = useLanguage()
</script>

<template>
  <div class="md-home-page">
    <main class="md-home-manga-page">

      <!-- Top Banner -->
      <header class="md-home-brand-banner">
        <div class="md-home-brand-main">
          <img
            src="../components/icons/MangaDown_logo.ico"
            class="md-home-logo"
            alt="MangaDown Logo"
          >

          <div class="md-home-brand-text">
            <h1>MangaDown</h1>
            <p>{{ t("homeTagline") }}</p>
          </div>
        </div>
        <LanguageSwitcher />
      </header>


      <!-- Hero -->
      <section class="md-home-markdown-panel">

        <div class="md-home-hero-text">
          <span class="md-home-hero-label">MARKDOWN × MANGA</span>

          <h2>{{ t("homeTagline") }}</h2>

          <p>{{ t("homeDescription") }}</p>
        </div>


        <div class="md-home-button-group">
          <button
            class="md-home-primary-button"
            @click="router.push('/write-md')"
          >
            {{ t("create") }}
            <span>→</span>
          </button>

          <button
            class="md-home-secondary-button"
            @click="router.push('/guide')"
          >
            {{ t("guide") }}
          </button>
        </div>

      </section>


      <!-- Footer -->
      <footer class="md-home-site-footer">
        <span>© MangaDown</span>
      </footer>

    </main>
  </div>
</template>