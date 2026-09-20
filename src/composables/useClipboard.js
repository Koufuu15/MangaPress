import { marked } from "marked"
import { captureBlob } from "@/utils/capture"
import { useLanguage } from "@/composables/useLanguage"

/**
 * クリップボード関連
 *
 * @param {Ref} previewRef
 * @param {Ref} markdown
 */
export function useClipboard(previewRef, markdown) {
  const { t } = useLanguage()

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown.value)
      alert(t("markdownCopied"))
    } catch (e) {
      console.error(e)
      alert(t("copyFailed"))
    }
  }

  async function copyHTML() {
    try {
      const html = marked(markdown.value)

      await navigator.clipboard.writeText(html)

      alert(t("htmlCopied"))
    } catch (e) {
      console.error(e)
      alert(t("copyFailed"))
    }
  }

  async function copyImage() {
    try {
      const blob = await captureBlob(previewRef.value)

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])

      alert(t("imageCopied"))
    } catch (e) {
      console.error(e)
      alert(t("imageCopyFailed"))
    }
  }

  return {
    copyMarkdown,
    copyHTML,
    copyImage
  }
}