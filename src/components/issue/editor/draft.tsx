'use client'

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontSize from "tiptap-extension-font-size";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "tiptap-extension-link";
import Image from "tiptap-extension-image";
import ImageLink from "tiptap-extension-image-link";
import Hr from "tiptap-extension-hr";
import BulletList from "tiptap-extension-bullet-list";
import OrderedList from "tiptap-extension-ordered-list";
import LineHeight from "tiptap-extension-line-height";
import Float from "tiptap-extension-float";
import Margin from "tiptap-extension-margin";
import Resizable from "tiptap-extension-resizable";
import TrailingNode from "tiptap-extension-trailing-node";
import Iframe from "tiptap-extension-iframe";

interface Props {
    editable: boolean
    content: string
}

export default function DraftEditor({ editable, content }: Props) {

    const editor = useEditor({
        // 
        immediatelyRender: false,
        content: content || '<p>开始编辑</p>',
        extensions: [
            TrailingNode,
            StarterKit.configure({
                bulletList: false,
                orderedList: false,
                codeBlock: false,
            }),
            Underline,
            TextStyle,
            Color,
            FontSize,
            TextAlign.configure({
                types: ["paragraph"],
                defaultAlignment: "justify",
            }),
            Highlight.configure({ multicolor: true }),
            Link.configure({ openOnClick: false, HTMLAttributes: { rel: "" } }),

            Resizable.configure({ types: ["image", "video"] }),
            Image.configure({ inline: true, allowBase64: true }),
            Iframe,
            ImageLink,
            Hr,
            BulletList.configure({ HTMLAttributes: { class: "list-paddingleft-1" } }),
            OrderedList.configure({
                HTMLAttributes: { class: "list-paddingleft-1" },
            }),
            LineHeight,
            Float,
            Margin,
        ],
        editable,
        injectCSS: false,
    })


    return <EditorContent editor={editor} />
}