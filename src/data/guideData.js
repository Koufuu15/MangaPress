export default [
  {
    id: "workflow",
    title: "使い方",
    description:
      "ホームの「漫画を作る」からManga Editorを開き、左側の編集パネルで漫画を組み立てます。右側のPreviewは操作内容をリアルタイムに反映します。",
    notes: [
      "「＋ コマを追加」でパネルを追加し、カードをドラッグして並び順を変更できます。",
      "パネル内の「＋ 吹き出し」「＋ 画像」で要素を追加し、表示された入力欄から位置・サイズ・色などを調整します。",
      "「＋ テキストを追加」では、コマの間に通常のMarkdown本文を追加できます。",
      "画像は「画像をアップロード」から登録して、パネルの「＋ 画像」で配置します。",
      "スマートフォンでは下部の「編集」「プレビュー」で表示を切り替えます。",
      "編集が終わったら「出力する」を押し、Preview画面からMarkdown・HTML・PNG・PDFの出力や共有を行います。"
    ]
  },

  {
    id: "getting-started",
    title: "記法の基本",
    description:
      "ビジュアルエディターで作成した内容は、通常のMarkdownと:::mangaブロックを組み合わせた形式で保存されます。ガイドのサンプルはコピーして記法を確認できます。",
    code: `# ページの説明

通常のMarkdown本文はそのまま表示されます。

:::manga
# panel
- backgroundColor: #f4f0e8
- border: solid
- borderWidth: 2
- borderColor: #18181b
- position: { x: 0, y: 0 }
- size: { w: 500, h: 360 }

## bubble
- layer: 1
- shape: round
- background: #ffffff
- border: true
- position: { x: 20, y: 18 }
- size: { w: 200, h: 100 }

### text
- content: "こんにちは！"
- font: sans-serif
- size: 18
- color: #111111
- direction: rl
- position: { x: 0, y: 0 }

:::`
  },

  {
    id: "panel",
    title: "Panel",
    description:
      "Panelは1コマを表します。複数のpanelを並べると、上から順に複数コマになります。",
    code: `:::manga
# panel
- backgroundColor: #eeeeee
- border: solid
- borderWidth: 2
- borderColor: #333333
- position: { x: 0, y: 0 }
- size: { w: 300, h: 300 }
:::`,
    properties: [
      {
        name: "backgroundColor",
        type: "string",
        description: "背景色",
        default: "表示側の既定色"
      },
      {
        name: "backgroundImage",
        type: "string",
        description: "背景画像の値",
        default: "なし"
      },
      {
        name: "border",
        type: "string",
        description: "枠線のスタイル",
        default: "solid"
      },
      {
        name: "borderWidth",
        type: "number",
        description: "枠線の太さ",
        default: "2"
      },
      {
        name: "borderColor",
        type: "string",
        description: "枠線の色",
        default: "#18181b"
      },
      {
        name: "position",
        type: "{ x, y }",
        description: "位置。単位はpx",
        default: "{ x: 0, y: 0 }"
      },
      {
        name: "size",
        type: "{ w, h }",
        description: "サイズ。単位はpx",
        default: "{ w: 500, h: 500 }"
      }
    ]
  },

  {
    id: "bubble",
    title: "Bubble",
    description:
      "BubbleはPanelの中に吹き出しを追加します。本文を表示するには、子要素としてtextを置きます。",
    code: `:::manga
# panel
- size: { w: 300, h: 300 }

## bubble
- layer: 1
- shape: thought
- background: #ffffff
- border: true
- position: { x: 25, y: 20 }
- size: { w: 220, h: 120 }
:::`,
    properties: [
      {
        name: "layer",
        type: "number",
        description: "重なり順。大きいほど前面",
        default: "0"
      },
      {
        name: "shape",
        type: "string",
        description: "round / square / thought / shout / star",
        default: "round"
      },
      {
        name: "position",
        type: "{ x, y }",
        description: "位置。単位は%",
        default: "{ x: 0, y: 0 }"
      },
      {
        name: "size",
        type: "{ w, h }",
        description: "サイズ。単位はpx",
        default: "{ w: 100, h: 60 }"
      },
      {
        name: "background",
        type: "string",
        description: "塗り色",
        default: "#ffffff"
      },
      {
        name: "border",
        type: "boolean",
        description: "枠線の表示",
        default: "true"
      },
      {
        name: "borderWidth",
        type: "number",
        description: "枠線の太さ",
        default: "3"
      },
      {
        name: "borderColor",
        type: "string",
        description: "枠線の色",
        default: "#111111"
      }
    ]
  },

  {
    id: "text",
    title: "Text",
    description:
      "TextはBubbleの中に配置します。contentは属性として書くほか、属性でない行を本文として書くこともできます。",
    code: `:::manga
# panel
- size: { w: 300, h: 300 }

## bubble
- position: { x: 25, y: 20 }
- size: { w: 220, h: 120 }

### text
- size: 20
- color: #111111
- direction: rl
これは本文です。
複数行も書けます。
:::`,
    properties: [
      {
        name: "content",
        type: "string",
        description: "表示する文章。Markdownとして描画",
        default: "空文字列"
      },
      {
        name: "font",
        type: "string",
        description: "フォント名",
        default: "実装依存"
      },
      {
        name: "size",
        type: "number",
        description: "文字サイズ。単位はpx",
        default: "未指定"
      },
      {
        name: "color",
        type: "string",
        description: "文字色",
        default: "未指定"
      },
      {
        name: "direction",
        type: "tb / rl",
        description: "tbは縦書き、rlは横書き",
        default: "rl"
      },
      {
        name: "position",
        type: "{ x, y }",
        description: "文字位置",
        default: "{ x: 0, y: 0 }"
      }
    ]
  },

  {
    id: "tail",
    title: "Tail",
    description:
      "TailはBubbleのしっぽです。1つのBubbleに複数追加できます。",
    code: `:::manga
# panel
- size: { w: 300, h: 300 }

## bubble
- position: { x: 30, y: 20 }
- size: { w: 220, h: 120 }

### text
- content: "右下を指す吹き出し"

### tail
- shape: triangle
- position: 225
- size: 1
- distance: 47
:::`,
    properties: [
      {
        name: "shape",
        type: "triangle / circle",
        description: "しっぽの形",
        default: "triangle"
      },
      {
        name: "position",
        type: "number",
        description: "角度。0=右、90=上、180=左、270=下",
        default: "0"
      },
      {
        name: "size",
        type: "number",
        description: "しっぽの倍率。0以上",
        default: "1"
      },
      {
        name: "distance",
        type: "number",
        description: "中心から描画開始位置までの距離。0以上",
        default: "47"
      }
    ]
  },

  {
    id: "image",
    title: "Image",
    description:
      "ImageはPanelの中に画像素材を配置します。nameには組み込み素材、またはアップロード済み素材の名前を指定します。",
    code: `:::manga
# panel
- backgroundColor: lightblue
- size: { w: 300, h: 300 }

## image
- name: boy_arm
- layer: 0
- position: { x: 20, y: 15 }
- size: { w: 220, h: 260 }
:::`,
    properties: [
      {
        name: "name",
        type: "string",
        description: "素材名",
        default: "必須"
      },
      {
        name: "layer",
        type: "number",
        description: "重なり順。大きいほど前面",
        default: "0"
      },
      {
        name: "position",
        type: "{ x, y }",
        description: "位置。単位は%",
        default: "{ x: 0, y: 0 }"
      },
      {
        name: "size",
        type: "{ w, h }",
        description: "サイズ。単位はpx",
        default: "{ w: 100, h: 100 }"
      }
    ]
  },

  {
    id: "layer-position-size",
    title: "共通ルール",
    description:
      "位置・サイズ・重なり順は、要素を調整するときに最もよく使う属性です。単位の違いに注意してください。",
    code: `:::manga
# panel
- position: { x: 0, y: 0 }
- size: { w: 300, h: 300 }

## image
- name: boy_arm
- layer: 0
- position: { x: 10, y: 10 }
- size: { w: 200, h: 200 }

## bubble
- layer: 1
- position: { x: 35, y: 20 }
- size: { w: 180, h: 90 }
:::`,
    notes: [
      "Panelのpositionはpx、BubbleとImageのpositionはパーセントです。",
      "sizeのwとhはすべてpxです。",
      "layerが大きい要素ほど前面に表示されます。"
    ]
  }
]