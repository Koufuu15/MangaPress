<script setup>
import { useLanguage } from "@/composables/useLanguage"

const { locale, toggleLocale, t } = useLanguage()
</script>

<template>
  <button
    class="language-switcher"
    type="button"
    :aria-label="`${t('language')}: ${locale === 'ja' ? t('japanese') : t('english')}`"
    @click="toggleLocale"
  >
    {{ locale === "ja" ? "EN" : "JA" }}
  </button>
</template>

<style scoped>
.language-switcher {
  min-width: 52px;
  padding: 7px 11px;
  border: 2px solid currentColor;
  background: transparent;
  color: inherit;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .08em;
  cursor: pointer;
}

.language-switcher:hover {
  opacity: .72;
}
</style>
