<script setup>
import "../assets/guide.css"

import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import Renderer from "@/components/renderer/Renderer.vue"
import guideData from "@/data/guideData"
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"
import { useLanguage } from "@/composables/useLanguage"

const router = useRouter()
const { locale, t } = useLanguage()
const keyword = ref("")
const copiedId = ref("")
const sidebarOpen = ref(false)

const opened = ref(
  Object.fromEntries(guideData.map(item => [item.id, true]))
)

const englishGuide = {
  workflow: {
    title: "How it works",
    description: "Open Manga Editor from Create Manga on the home page, then build your manga in the editor on the left. The Preview on the right updates in real time.",
    notes: [
      "Add panels with + Add panel, then drag cards to change their order.",
      "Use + Bubble and + Image inside a panel, then adjust position, size, and color in the fields.",
      "Use + Add text to insert regular Markdown between panels.",
      "Register images with Upload image, then place them with + Image in a panel.",
      "On smartphones, switch views with Editor and Preview at the bottom.",
      "When you are done, select Publish to export or share Markdown, HTML, PNG, or PDF from the Preview screen."
    ]
  },
  "getting-started": {
    title: "Syntax basics",
    description: "Editor content is saved as a combination of regular Markdown and :::manga blocks. Copy the guide examples to explore the syntax."
  },
  panel: { description: "A Panel represents one manga frame. Place multiple panels in sequence to create multiple frames." },
  bubble: { description: "A Bubble adds a speech bubble inside a Panel. Add a child text element to display content." },
  text: { description: "Text is placed inside a Bubble. Write content as an attribute or as lines that are not attributes." },
  tail: { description: "A Tail is the pointer of a Bubble. Multiple tails can be added to one Bubble." },
  image: { description: "An Image places an asset inside a Panel. The name can refer to a built-in or uploaded asset." },
  "layer-position-size": { title: "Shared rules", description: "Position, size, and layer are the attributes used most often when adjusting elements. Pay attention to their units." }
}

function localizeGuideItem(item) {
  if (locale.value !== "en") return item
  const translation = englishGuide[item.id] ?? {}
  return {
    ...item,
    ...translation,
    properties: item.properties?.map(property => ({
      ...property,
      description: ({
        backgroundColor: "Background color",
        backgroundImage: "Background image value",
        border: "Border style",
        borderWidth: "Border width",
        borderColor: "Border color",
        position: "Position. Unit: px",
        size: "Size. Unit: px",
        layer: "Stacking order. Larger values appear in front",
        shape: "round / square / thought / shout / star",
        background: "Fill color",
        border: "Whether to show the border",
        content: "Text to display, rendered as Markdown",
        font: "Font name",
        color: "Text color",
        direction: "tb is vertical, rl is horizontal",
        name: "Asset name",
        distance: "Distance from the center to the drawing start"
      }[property.name] ?? property.description),
      default: property.default === "なし" ? "None" : property.default
    })),
    notes: translation.notes ?? item.notes?.map(note => note
      .replace("Panelのpositionはpx、BubbleとImageのpositionはパーセントです。", "Panel position uses px; Bubble and Image positions use percentages.")
      .replace("sizeのwとhはすべてpxです。", "The w and h values of size are always in px.")
      .replace("layerが大きい要素ほど前面に表示されます。", "Elements with larger layer values appear in front."))
  }
}

const guides = computed(() => {
  const key = keyword.value.trim().toLowerCase()
  const localized = guideData.map(localizeGuideItem)

  if (!key) {
    return localized
  }

  return localized.filter(item => {
    const properties =
      item.properties
        ?.map(property => `${property.name} ${property.description}`)
        .join(" ") ?? ""

    const notes = item.notes?.join(" ") ?? ""

    const searchable = [
      item.title,
      item.description,
      item.code,
      properties,
      notes
    ]
      .filter(Boolean)
      .join(" ")

    return searchable.toLowerCase().includes(key)
  })
})

function toggle(id) {
  opened.value[id] = !opened.value[id]
}

async function copyCode(item) {
  try {
    await navigator.clipboard.writeText(item.code)

    copiedId.value = item.id

    window.setTimeout(() => {
      if (copiedId.value === item.id) {
        copiedId.value = ""
      }
    }, 1600)
  } catch {
    alert(t("copyFailed"))
  }
}

function jump(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  })
}
</script>

<template>
  <div class="guide-page">
    <header class="guide-header">
      <div class="guide-header-inner">
        <button
          class="secondary-button"
          type="button"
          @click="router.push('/')"
        >
          <span aria-hidden="true">←</span>
          {{ t("home") }}
        </button>
        <LanguageSwitcher />

        <div class="guide-heading">
          <div class="guide-heading-title">
            <img
              src="../components/icons/MangaDown_logo.ico"
              class="md-guide-logo"
              alt="MangaDown Logo"
            >

            <div>
              <span class="eyebrow">MANGADOWN / REFERENCE</span>
              <h1>Writing Guide</h1>
            </div>
          </div>

          <p>{{ t("guideSubtitle") }}</p>
        </div>
      </div>
    </header>

    <div class="guide-layout">
      <!-- Sidebar -->
      <aside
        class="guide-sidebar"
        :class="{ 'is-collapsed': !sidebarOpen }"
      >
        <button
          class="sidebar-toggle"
          type="button"
          :aria-expanded="sidebarOpen"
          aria-controls="guide-navigation"
          @click="sidebarOpen = !sidebarOpen"
        >
          <span class="sidebar-intro">
            <span class="sidebar-label">CONTENTS</span>
            <strong>{{ t("findSyntax") }}</strong>
          </span>

          <span
            class="sidebar-toggle-icon"
            aria-hidden="true"
          >
            {{ sidebarOpen ? "−" : "+" }}
          </span>
        </button>

        <div
          v-show="sidebarOpen"
          id="guide-navigation"
          class="sidebar-navigation"
        >
          <label
            class="search-label"
            for="guide-search"
          >
            {{ t("keyword") }}
          </label>

          <div class="search-wrap">
            <span aria-hidden="true">⌕</span>

            <input
              id="guide-search"
              v-model="keyword"
              class="search-box"
              type="search"
              placeholder="panel, bubble..."
            >
          </div>

          <nav
            class="guide-nav"
            :aria-label="t('guideContents')"
          >
            <button
              v-for="(item, index) in guides"
              :key="item.id"
              class="nav-item"
              type="button"
              @click="jump(item.id)"
            >
              <span>
                {{ String(index + 1).padStart(2, "0") }}
                {{ item.title }}
              </span>
            </button>
          </nav>

          <p
            v-if="!guides.length"
            class="empty-search"
          >
            {{ t("noSyntax") }}
          </p>
        </div>
      </aside>

      <!-- Content -->
      <main class="guide-content">
        <div class="content-intro">
          <span class="section-kicker">START HERE</span>

          <h2>{{ t("guideOverview") }}</h2>

          <p>
            {{ t("guideIntro") }}
          </p>
        </div>

        <div class="guide-list">
          <article
            v-for="(item, index) in guides"
            :id="item.id"
            :key="item.id"
            class="guide-section"
          >
            <!-- Section Header -->
            <button
              class="section-header"
              type="button"
              :aria-expanded="opened[item.id]"
              @click="toggle(item.id)"
            >
              <span class="section-index">
                {{ String(index + 1).padStart(2, "0") }}
              </span>

              <span class="section-title-wrap">
                <strong>{{ item.title }}</strong>
              </span>

              <span
                class="section-toggle"
                aria-hidden="true"
              >
                {{ opened[item.id] ? "−" : "+" }}
              </span>
            </button>

            <!-- Section Body -->
            <div
              v-if="opened[item.id]"
              class="section-body"
            >
              <p class="section-description">
                {{ item.description }}
              </p>

              <!-- Example -->
              <div
                v-if="item.code"
                class="example"
              >
                <!-- Code -->
                <section class="example-code">
                  <div class="example-title">
                    <span>
                      <i
                        class="code-dot"
                        aria-hidden="true"
                      ></i>
                      Markdown
                    </span>

                    <button
                      class="copy-button"
                      type="button"
                      @click.stop="copyCode(item)"
                    >
                      {{ copiedId === item.id ? t("copied") : t("copyCode") }}
                    </button>
                  </div>

                  <pre><code>{{ item.code }}</code></pre>
                </section>

                <!-- Preview -->
                <section class="example-preview">
                  <div class="example-title">
                    <span>
                      <i
                        class="preview-dot"
                        aria-hidden="true"
                      ></i>
                      Preview
                    </span>
                  </div>

                  <div class="preview-box">
                    <Renderer
                      :content="item.code"
                    />
                  </div>
                </section>
              </div>

              <!-- Properties -->
              <div
                v-if="item.properties?.length"
                class="reference-block"
              >
                <div class="block-heading">
                  <span>{{ t("properties") }}</span>
                  <small>
                    {{ item.properties.length }} properties
                  </small>
                </div>

                <div class="property-table-wrap">
                  <table class="property-table">
                    <thead>
                      <tr>
                        <th>{{ t("property") }}</th>
                        <th>{{ t("type") }}</th>
                        <th>{{ t("description") }}</th>
                        <th>{{ t("defaultValue") }}</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr
                        v-for="property in item.properties"
                        :key="property.name"
                      >
                        <td>
                          <code>{{ property.name }}</code>
                        </td>

                        <td>
                          <span class="type-chip">
                            {{ property.type }}
                          </span>
                        </td>

                        <td>
                          {{ property.description }}
                        </td>

                        <td class="default-value">
                          {{ property.default }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Notes -->
              <div
                v-if="item.notes?.length"
                class="notes-block"
              >
                <div class="block-heading">
                  <span>{{ t("notes") }}</span>
                </div>

                <ul>
                  <li
                    v-for="note in item.notes"
                    :key="note"
                  >
                    {{ note }}
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  </div>
</template>