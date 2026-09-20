<script setup>
import "../assets/writeMD.css"

import { computed, nextTick, ref, watch } from "vue"
import { useRouter } from "vue-router"
import Renderer from "@/components/renderer/Renderer.vue"
import AssetPicker from "@/components/library/AssetPicker.vue"
import UploadDialog from "@/components/UploadDialog.vue"
import parseMarkdown from "@/parser/markdown/parseMarkdown"
import parseManga from "@/parser/manga/parseManga"
import { validateImageName } from "@/utils/imageValidator"
import { saveUserAsset } from "@/utils/userAssets"
import { getAllAssets } from "@/utils/assetResolver"
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"
import { useLanguage } from "@/composables/useLanguage"

const router = useRouter()
const { t } = useLanguage()
const fileInput = ref(null)
const pickerOpen = ref(false)
const uploadOpen = ref(false)
const selectedFile = ref(null)
const assets = ref([])

const initialContent = localStorage.getItem("content") ?? ""
const initialBlocks = parseMarkdown(initialContent)

const createPanel = () => ({
  position: { x: 0, y: 0 },
  size: { width: 500, height: 360 },
  backgroundColor: "#f4f0e8",
  border: "solid",
  borderWidth: 2,
  borderColor: "#18181b",
  components: []
})

const editorBlocks = ref([])

initialBlocks.forEach(block => {
  if (block.type === "markdown" && block.content.trim()) {
    editorBlocks.value.push({
      type: "text",
      content: block.content.trim(),
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    })
  }

  if (block.type === "manga") {
    parseManga(block.content).panels.forEach(panel => {
      panel.components.forEach(component => {
        const bubble = component.bubble?.[0]
        if (bubble?.text && !bubble.text.position) {
          bubble.text.position = { x: 0, y: 0 }
        }
      })
      editorBlocks.value.push({ type: "panel", panel })
    })
  }
})

if (editorBlocks.value.length === 0) {
  editorBlocks.value.push({ type: "panel", panel: createPanel() })
}

const panels = computed(() =>
  editorBlocks.value
    .filter(block => block.type === "panel")
    .map(block => block.panel)
)

const panelGroups = computed(() =>
  editorBlocks.value
    .filter(block => block.type === "panel")
    .map(block => [block.panel])
)

const content = ref("")
const draggingBlockIndex = ref(null)
const dragOverBlockIndex = ref(null)
const mobileView = ref("editor")
const selectedPanel = ref(null)

const shapeOptions = [
  { value: "round", label: "丸" },
  { value: "square", label: "四角" },
  { value: "thought", label: "思考" },
  { value: "shout", label: "叫び" },
  { value: "star", label: "星" }
]

function numberValue(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function serializeObject(object) {
  return `{ x: ${numberValue(object?.x)}, y: ${numberValue(object?.y)} }`
}

function serializeSize(size) {
  return `{ w: ${numberValue(size?.width)}, h: ${numberValue(size?.height)} }`
}

function serializeManga(panel) {
  const lines = [":::manga"]

  lines.push(
    "# panel",
    `- backgroundColor: ${panel.backgroundColor || "#ffffff"}`,
    `- border: ${panel.border || "solid"}`,
    `- borderWidth: ${numberValue(panel.borderWidth, 2)}`,
    `- borderColor: ${panel.borderColor || "#18181b"}`,
    `- position: ${serializeObject(panel.position)}`,
    `- size: ${serializeSize(panel.size)}`,
    ""
  )

  panel.components.forEach(component => {
    const bubble = component.bubble?.[0]
    const image = component.image?.[0]

    if (bubble) {
      lines.push(
        "## bubble",
        `- layer: ${numberValue(bubble.layer, 1)}`,
        `- shape: ${bubble.shape || "round"}`,
        `- background: ${bubble.background || "#ffffff"}`,
        `- border: ${bubble.border !== false}`,
        `- borderWidth: ${numberValue(bubble.borderWidth, 3)}`,
        `- borderColor: ${bubble.borderColor || "#111111"}`,
        `- position: ${serializeObject(bubble.position)}`,
        `- size: ${serializeSize(bubble.size)}`,
        "",
        "### text",
        `- content: "${String(bubble.text?.content || "").replaceAll('"', '\\"')}"`,
        `- font: ${bubble.text?.font || "sans-serif"}`,
        `- size: ${numberValue(bubble.text?.fontSize, 18)}`,
        `- color: ${bubble.text?.color || "#111111"}`,
        `- direction: ${bubble.text?.direction || "rl"}`,
        `- position: ${serializeObject(bubble.text?.position)}`,
        ""
      )

      ;(bubble.tail || []).forEach(tail => {
        lines.push(
          "### tail",
          `- shape: ${tail.shape || "triangle"}`,
          `- position: ${numberValue(tail.position)}`,
          `- size: ${numberValue(tail.size, 1)}`,
          `- distance: ${numberValue(tail.distance, 47)}`,
          ""
        )
      })
    }

    if (image) {
      lines.push(
        "## image",
        `- name: ${image.name || ""}`,
        `- layer: ${numberValue(image.layer)}`,
        `- position: ${serializeObject(image.position)}`,
        `- size: ${serializeSize(image.size)}`,
        ""
      )
    }
  })

  lines.push(":::")
  return lines.join("\n")
}

function syncContent() {
  content.value = editorBlocks.value
    .map(block =>
      block.type === "text"
        ? block.content.trim()
        : serializeManga(block.panel)
    )
    .filter(Boolean)
    .join("\n\n")

  localStorage.setItem("content", content.value)
}

function resizeTextArea(textarea) {
  if (!textarea) return

  textarea.style.height = "0px"
  textarea.style.height = `${textarea.scrollHeight}px`
}

function resizeAllTextAreas() {
  nextTick(() => {
    document
      .querySelectorAll(".write-md-text-block-body textarea, .write-md-text-editor textarea")
      .forEach(resizeTextArea)
  })
}

function addPanel(index = editorBlocks.value.length) {
  editorBlocks.value.splice(index, 0, {
    type: "panel",
    panel: createPanel()
  })
  syncContent()
}

function removePanel(blockIndex) {
  editorBlocks.value.splice(blockIndex, 1)
  syncContent()
}

function addText(index = editorBlocks.value.length) {
  editorBlocks.value.splice(index, 0, {
    type: "text",
    content: "",
    position: { x: 0, y: 0 },
    size: { width: 0, height: 0 }
  })

  syncContent()
  resizeAllTextAreas()
}

function removeText(blockIndex) {
  editorBlocks.value.splice(blockIndex, 1)
  syncContent()
}

function startBlockDrag(event, blockIndex) {
  draggingBlockIndex.value = blockIndex
  event.dataTransfer.effectAllowed = "move"
  event.dataTransfer.setData("text/plain", String(blockIndex))
}

function dragOverBlock(blockIndex) {
  if (
    draggingBlockIndex.value !== null &&
    draggingBlockIndex.value !== blockIndex
  ) {
    dragOverBlockIndex.value = blockIndex
  }
}

function dropBlock(blockIndex) {
  const fromIndex = draggingBlockIndex.value

  if (fromIndex === null || fromIndex === blockIndex) {
    return endBlockDrag()
  }

  const [block] = editorBlocks.value.splice(fromIndex, 1)
  const targetIndex = fromIndex < blockIndex ? blockIndex - 1 : blockIndex

  editorBlocks.value.splice(targetIndex, 0, block)
  endBlockDrag()
  syncContent()
  resizeAllTextAreas()
}

function endBlockDrag() {
  draggingBlockIndex.value = null
  dragOverBlockIndex.value = null
}

function addBubble(panel) {
  panel.components.push({
    bubble: [{
      layer: 1,
      shape: "round",
      background: "#ffffff",
      border: true,
      borderWidth: 3,
      borderColor: "#111111",
      position: { x: 20, y: 15 },
      size: { width: 200, height: 100 },
      text: {
        content: "",
        font: "sans-serif",
        fontSize: 18,
        color: "#111111",
        direction: "rl",
        position: { x: 0, y: 0 }
      },
      tail: []
    }]
  })

  syncContent()
  resizeAllTextAreas()
}

function addImage(panel) {
  assets.value = getAllAssets()
  selectedPanel.value = panel
  pickerOpen.value = true
}

function removeComponent(panel, component) {
  panel.components.splice(panel.components.indexOf(component), 1)
  syncContent()
}

function addTail(bubble) {
  bubble.tail.push({
    shape: "triangle",
    position: 225,
    size: 1,
    distance: 47
  })
  syncContent()
}

function removeTail(bubble, tail) {
  bubble.tail.splice(bubble.tail.indexOf(tail), 1)
  syncContent()
}

function openImagePicker() {
  selectedPanel.value = panels.value[0]
  fileInput.value?.click()
}

function openAssetPicker() {
  selectedPanel.value = panels.value[0]
  assets.value = getAllAssets()
  pickerOpen.value = true
}

function closeAssetPicker() {
  pickerOpen.value = false
}

function closeUploadDialog() {
  uploadOpen.value = false
  selectedFile.value = null
}

function onImageSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  selectedFile.value = file
  uploadOpen.value = true
  event.target.value = ""
}

function saveImage(data) {
  if (!selectedFile.value) return

  const result = validateImageName(data.name)

  if (!result.valid) {
    alert(result.message)
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    saveUserAsset({
      name: data.name,
      src: reader.result,
      folderId: data.folderId,
      tags: data.tags,
      createdAt: Date.now()
    })

    selectAsset({ name: data.name })
    closeUploadDialog()
  }

  reader.readAsDataURL(selectedFile.value)
}

function selectAsset(asset) {
  if (!selectedPanel.value) return

  selectedPanel.value.components.push({
    image: [{
      name: asset.name,
      layer: 0,
      position: { x: 20, y: 15 },
      size: { width: 180, height: 180 }
    }]
  })

  syncContent()
  pickerOpen.value = false
}

watch(editorBlocks, () => {
  syncContent()
  resizeAllTextAreas()
}, { deep: true })

const panelCountLabel = computed(() =>
  `${panels.value.length} ${t("panel")}${panels.value.length === 1 ? "" : "s"}`
)

syncContent()
resizeAllTextAreas()
</script>

<template>
  <div class="write-md-page">
    <header class="write-md-header">
      <div class="write-md-header-brand">
        <img src="../components/icons/MangaDown_logo.ico" class="md-home-logo" alt="MangaDown Logo">
        <div class="write-md-header-left">
          <h1>Manga Editor</h1>
          <p>Arrange panels, bubbles, tails, and images visually.</p>
        </div>
      </div>
      <LanguageSwitcher />
    </header>

    <main class="write-md-workspace">
      <section class="write-md-editor-panel" :class="{ 'write-md-mobile-hidden': mobileView !== 'editor' }">
        <div class="write-md-panel-title">
          <span>{{ t("visualEditor") }} <small>{{ panelCountLabel }}</small></span>
          <div class="write-md-editor-toolbar">
            <button class="write-md-toolbar-button" @click="openImagePicker">{{ t("uploadImage") }}</button>
            <button class="write-md-toolbar-button" @click="addPanel">{{ t("addPanel") }}</button>
            <button class="write-md-toolbar-button" @click="addText">{{ t("addText") }}</button>
            <input ref="fileInput" type="file" accept="image/*" hidden @change="onImageSelected">
          </div>
        </div>

        <div class="write-md-form">
          <template v-for="(block, blockIndex) in editorBlocks" :key="blockIndex">
            <article
              v-if="block.type === 'text'"
              class="write-md-panel-card write-md-text-block"
              :class="{ 'write-md-drag-over': dragOverBlockIndex === blockIndex }"
              @dragover.prevent="dragOverBlock(blockIndex)"
              @drop.prevent="dropBlock(blockIndex)"
            >
              <header class="write-md-card-header" draggable="true" @dragstart="startBlockDrag($event, blockIndex)" @dragend="endBlockDrag">
                <div><span class="write-md-index">T</span><strong>{{ t("text") }}</strong></div>
                <button class="write-md-icon-button" :title="t('deleteText')" @click="removeText(blockIndex)">×</button>
              </header>

              <div class="write-md-text-block-body">
                <textarea v-model="block.content" rows="1" :placeholder="t('plainText')" @input="resizeTextArea($event.target); syncContent"></textarea>
              </div>
            </article>

            <article
              v-else
              class="write-md-panel-card"
              :class="{ 'write-md-drag-over': dragOverBlockIndex === blockIndex }"
              @dragover.prevent="dragOverBlock(blockIndex)"
              @drop.prevent="dropBlock(blockIndex)"
            >
              <header class="write-md-card-header" draggable="true" @dragstart="startBlockDrag($event, blockIndex)" @dragend="endBlockDrag">
                <div><span class="write-md-index">{{ String(blockIndex + 1).padStart(2, "0") }}</span><strong>{{ t("panel") }}</strong></div>
                <button class="write-md-icon-button" :title="t('deletePanel')" @click="removePanel(blockIndex)">×</button>
              </header>

              <div class="write-md-fields">
                <label>{{ t("backgroundColor") }}<input v-model="block.panel.backgroundColor" type="color" @change="syncContent"></label>
                <label>{{ t("border") }}<select v-model="block.panel.border" @change="syncContent"><option value="solid">{{ t("solid") }}</option><option value="dashed">{{ t("dashed") }}</option><option value="none">{{ t("none") }}</option></select></label>
                <label>{{ t("borderWidth") }}<input v-model.number="block.panel.borderWidth" type="number" min="0" step="1" @change="syncContent"></label>
                <label>{{ t("leftPx") }}<input v-model.number="block.panel.position.x" type="number" @change="syncContent"></label>
                <label>{{ t("topPx") }}<input v-model.number="block.panel.position.y" type="number" @change="syncContent"></label>
                <label>{{ t("widthPx") }}<input v-model.number="block.panel.size.width" type="number" min="1" @change="syncContent"></label>
                <label>{{ t("heightPx") }}<input v-model.number="block.panel.size.height" type="number" min="1" @change="syncContent"></label>
              </div>

              <div class="write-md-component-list">
                <section v-for="(component, componentIndex) in block.panel.components" :key="componentIndex" class="write-md-component-card">
                  <template v-if="component.bubble">
                    <div class="write-md-component-heading">
                      <strong>{{ t("bubble") }}</strong>
                      <button class="write-md-remove-link" @click="removeComponent(block.panel, component)">{{ t("remove") }}</button>
                    </div>

                    <div class="write-md-fields">
                      <label>{{ t("shape") }}<select v-model="component.bubble[0].shape" @change="syncContent"><option v-for="option in shapeOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></label>
                      <label>{{ t("layer") }}<input v-model.number="component.bubble[0].layer" type="number" @change="syncContent"></label>
                      <label>{{ t("leftPercent") }}<input v-model.number="component.bubble[0].position.x" type="number" @change="syncContent"></label>
                      <label>{{ t("topPercent") }}<input v-model.number="component.bubble[0].position.y" type="number" @change="syncContent"></label>
                      <label>{{ t("widthPx") }}<input v-model.number="component.bubble[0].size.width" type="number" min="1" @change="syncContent"></label>
                      <label>{{ t("heightPx") }}<input v-model.number="component.bubble[0].size.height" type="number" min="1" @change="syncContent"></label>
                      <label>{{ t("fill") }}<input v-model="component.bubble[0].background" type="color" @change="syncContent"></label>
                      <label>{{ t("border") }}<select v-model="component.bubble[0].border" @change="syncContent"><option :value="true">{{ t("show") }}</option><option :value="false">{{ t("hide") }}</option></select></label>
                    </div>

                    <div class="write-md-text-editor">
                      <strong>{{ t("body") }}</strong>
                      <textarea v-model="component.bubble[0].text.content" rows="2" :placeholder="t('bubbleText')" @input="resizeTextArea($event.target); syncContent"></textarea>
                      <div class="write-md-fields">
                        <label>{{ t("fontSize") }}<input v-model.number="component.bubble[0].text.fontSize" type="number" min="1" @change="syncContent"></label>
                        <label>{{ t("direction") }}<select v-model="component.bubble[0].text.direction" @change="syncContent"><option value="rl">{{ t("horizontal") }}</option><option value="tb">{{ t("vertical") }}</option></select></label>
                        <label>{{ t("bodyX") }}<input v-model.number="component.bubble[0].text.position.x" type="number" @change="syncContent"></label>
                        <label>{{ t("bodyY") }}<input v-model.number="component.bubble[0].text.position.y" type="number" @change="syncContent"></label>
                      </div>
                    </div>

                    <div v-for="(tail, tailIndex) in component.bubble[0].tail" :key="tailIndex" class="write-md-tail-row">
                      <select v-model="tail.shape" @change="syncContent"><option value="triangle">{{ t("triangle") }}</option><option value="circle">{{ t("circle") }}</option></select>
                      <label>{{ t("angle") }}<input v-model.number="tail.position" type="number" min="0" max="360" @change="syncContent"></label>
                      <label>{{ t("scale") }}<input v-model.number="tail.size" type="number" min="0" step="0.1" @change="syncContent"></label>
                      <label>{{ t("distance") }}<input v-model.number="tail.distance" type="number" min="0" @change="syncContent"></label>
                      <button class="write-md-remove-link" @click="removeTail(component.bubble[0], tail)">{{ t("remove") }}</button>
                    </div>

                    <button class="write-md-small-button" @click="addTail(component.bubble[0])">{{ t("addTail") }}</button>
                  </template>

                  <template v-else-if="component.image">
                    <div class="write-md-component-heading">
                      <strong>{{ t("image") }}: {{ component.image[0].name }}</strong>
                      <button class="write-md-remove-link" @click="removeComponent(block.panel, component)">{{ t("remove") }}</button>
                    </div>

                    <div class="write-md-fields">
                      <label>{{ t("layer") }}<input v-model.number="component.image[0].layer" type="number" @change="syncContent"></label>
                      <label>{{ t("leftPercent") }}<input v-model.number="component.image[0].position.x" type="number" @change="syncContent"></label>
                      <label>{{ t("topPercent") }}<input v-model.number="component.image[0].position.y" type="number" @change="syncContent"></label>
                      <label>{{ t("widthPx") }}<input v-model.number="component.image[0].size.width" type="number" min="1" @change="syncContent"></label>
                      <label>{{ t("heightPx") }}<input v-model.number="component.image[0].size.height" type="number" min="1" @change="syncContent"></label>
                    </div>
                  </template>
                </section>
              </div>

              <footer class="write-md-card-actions">
                <button class="write-md-small-button" @click="addBubble(block.panel)">{{ t("addBubble") }}</button>
                <button class="write-md-small-button" @click="addImage(block.panel)">{{ t("addImage") }}</button>
              </footer>
            </article>
          </template>
        </div>
      </section>

      <section class="write-md-preview-panel" :class="{ 'write-md-mobile-hidden': mobileView !== 'preview' }">
        <div class="write-md-panel-title">
          <span>{{ t("preview") }}</span>
        </div>

        <div class="write-md-preview">
          <Renderer :content="content" :panel-groups="panelGroups" :editor-blocks="editorBlocks" />
        </div>
      </section>
    </main>

    <div class="write-md-mobile-toggle">
      <button class="write-md-mobile-toggle-button" :class="{ active: mobileView === 'editor' }" @click="mobileView = 'editor'">
        {{ t("editor") }}
      </button>
      <button class="write-md-mobile-toggle-button" :class="{ active: mobileView === 'preview' }" @click="mobileView = 'preview'">
        {{ t("preview") }}
      </button>
    </div>

    <footer class="write-md-button-panel">
      <button class="write-md-secondary-button" @click="router.push('/')">
        ← {{ t("home") }}
      </button>
      <button class="write-md-primary-button" @click="router.push('/save')">
        {{ t("publish") }}
      </button>
    </footer>

    <AssetPicker v-model="pickerOpen" :assets="assets" @select="selectAsset" />
    <UploadDialog :open="uploadOpen" @close="closeUploadDialog" @save="saveImage" />
  </div>
</template>