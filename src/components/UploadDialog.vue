<script setup>
import "../assets/uploadDialog.css"
import { computed, ref, watch } from "vue"

import defaultFolders from "@/data/defaultFolders"
import { getUserFolders, addUserFolder } from "@/utils/userFolders"
import { useLanguage } from "@/composables/useLanguage"

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits([
  "close",
  "save"
])

const name = ref("")
const folderId = ref("")
const newFolderMode = ref(false)
const newFolderName = ref("")

const userFolders = ref([])
const { t } = useLanguage()

watch(
  () => props.open,
  open => {
    if (!open) return

    name.value = ""
    folderId.value = ""
    newFolderMode.value = false
    newFolderName.value = ""

    userFolders.value = getUserFolders()
  }
)

const folders = computed(() => [
  ...defaultFolders,
  ...userFolders.value
])

function createFolder() {
  const value = newFolderName.value.trim()

  if (!value) return

  const folder = addUserFolder(value)

  if (!folder) {
    alert(t("folderExists"))
    return
  }

  userFolders.value = getUserFolders()

  folderId.value = folder.id

  newFolderName.value = ""
  newFolderMode.value = false
}

function save() {
  if (!name.value.trim()) {
    alert(t("imageNameRequired"))
    return
  }

  emit("save", {
    name: name.value.trim(),
    folderId: folderId.value,
    tags: []
  })

  close()
}

function close() {
  emit("close")
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="upload-overlay"
      @click="close"
    />

    <div
      v-if="open"
      class="upload-dialog"
    >
      <h2>
        {{ t("uploadTitle") }}
      </h2>

      <label>
        {{ t("imageName") }}
      </label>

      <input
        v-model="name"
        type="text"
        :placeholder="t('imageName')"
      />

      <label>
        {{ t("destination") }}
      </label>

      <select
        v-model="folderId"
      >
        <option value="">
          {{ t("uncategorized") }}
        </option>

        <option
          v-for="folder in folders"
          :key="folder.id"
          :value="folder.id"
        >
          {{ folder.icon }} {{ folder.id === "" ? t("uncategorized") : folder.name }}
        </option>
      </select>

      <button
        class="new-folder-button"
        @click="newFolderMode = !newFolderMode"
      >
        {{ t("newFolder") }}
      </button>

      <div
        v-if="newFolderMode"
        class="new-folder-area"
      >
        <input
          v-model="newFolderName"
          type="text"
          :placeholder="t('folderName')"
        />

        <button
          @click="createFolder"
        >
          {{ t("createFolder") }}
        </button>
      </div>

      <div class="dialog-actions">
        <button
          @click="close"
        >
          {{ t("cancel") }}
        </button>

        <button
          @click="save"
        >
          {{ t("save") }}
        </button>
      </div>
    </div>
  </Teleport>
</template>