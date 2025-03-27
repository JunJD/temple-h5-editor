'use client'
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Palette,
} from "lucide-react";
import { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import BoldExtension from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import ItalicExtension from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Text from "@tiptap/extension-text";
import UnderlineExtension from "@tiptap/extension-underline";
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Mention from '@tiptap/extension-mention'
import History from "@tiptap/extension-history";
import { forwardRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { PopoverPicker } from "@/components/builder/sidebars/right/PopoverPicker";
import { cn } from "@/lib/utils";
import tippy from 'tippy.js';
import { useTheme } from "next-themes";

interface ToolbarButtonProps {
    active?: boolean;
    icon: React.ReactNode;
    tooltip: string;
    disabled?: boolean;
    onClick?: () => void;
}

const ToolbarButton = ({ active, icon, tooltip, disabled, onClick }: ToolbarButtonProps) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={active ? "default" : "ghost"}
                    size="icon"
                    disabled={disabled}
                    onClick={onClick}
                    className="h-8 w-8"
                >
                    {icon}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

const ColorSelector = ({ editor }: { editor: Editor }) => {
    const currentColor = editor.getAttributes('textStyle').color;

    return (
        <Popover>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 relative"
                            >
                                <Palette className="h-4 w-4" />
                                {currentColor && (
                                    <div 
                                        className="w-2 h-2 rounded-full absolute bottom-1 right-1"
                                        style={{ backgroundColor: currentColor }}
                                    />
                                )}
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>文字颜色</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <PopoverContent className="w-auto p-3">
                <PopoverPicker
                    color={currentColor || '#000000'}
                    onChange={(color) => editor.chain().focus().setColor(color).run()}
                />
            </PopoverContent>
        </Popover>
    );
};

const MentionList = ({ items, command, selectedIndex = 0 }: { items: string[], command: (item: string) => void, selectedIndex?: number }) => {
    return (
        <div className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            <div className="flex flex-col gap-0.5">
                {items.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => command(item)}
                        className={cn(
                            "flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                            selectedIndex === index ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        {item}
                    </button>
                ))}
            </div>
                </div>
    );
};

const createMentionSuggestion = (items: string[], theme: string) => {
    let selectedIndex = 0;
    let currentProps: any = null;
    
    return {
        char: '$',
        items: ({ query }: { query: string }) => {
            return items;
        },

        render: () => {
            let component: HTMLDivElement;
            let popup: any[];
            let root: any;

            const renderItems = (props: any, index: number) => {
                if (!root) {
                    component = document.createElement('div');
                    root = createRoot(component);
                }

                root.render(
                    <MentionList
                        items={items || []}
                        selectedIndex={index}
                        command={(item) => {
                            props.command({ id: item });
                            popup[0].hide();
                        }}
                    />
                );

                return component;
            };

            return {
                onStart: (props: any) => {
                    selectedIndex = 0;
                    currentProps = props;
                    const element = renderItems(props, selectedIndex);

                    popup = tippy('body', {
                        getReferenceClientRect: props.clientRect,
                        appendTo: () => document.body,
                        content: element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                        theme: theme === 'light' ? 'light' : 'dark',
                    });
                },

                onUpdate(props: any) {
                    currentProps = props;
                    const element = renderItems(props, selectedIndex);
                    popup[0].setProps({
                        getReferenceClientRect: props.clientRect,
                        content: element,
                    });
                },

                onKeyDown(props: any) {
                    if (!items.length) {
                        return false;
                    }

                    // 使用最新的props
                    const fullProps = {
                        ...currentProps,
                        ...props,
                    };

                    if (props.event.code === 'ArrowUp') {
                        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                        renderItems(fullProps, selectedIndex);
                        return true;
                    }

                    if (props.event.code === 'ArrowDown') {
                        selectedIndex = (selectedIndex + 1) % items.length;
                        renderItems(fullProps, selectedIndex);
                        return true;
                    }

                    if (props.event.code === 'Enter' && items[selectedIndex]) {
                        fullProps.command({ id: items[selectedIndex] });
                        popup[0].hide();
                        return true;
                    }

                    if (props.event.code === 'Escape') {
                        popup[0].hide();
                        return true;
                    }

                    return false;
                },

                onExit() {
                    currentProps = null;
                    if (root) {
                        root.unmount();
                        root = null;
                    }
                    if (popup?.[0]) {
                        popup[0].destroy();
                    }
                    if (component) {
                        component.remove();
                    }
                },
            };
        },
    };
};

const Toolbar = ({ editor }: { editor: Editor }) => {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
            <ToolbarButton
                tooltip="粗体"
                icon={<Bold className="h-4 w-4" />}
                active={editor.isActive("bold")}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                onClick={() => editor.chain().focus().toggleBold().run()}
            />

            <ToolbarButton
                tooltip="斜体"
                icon={<Italic className="h-4 w-4" />}
                active={editor.isActive("italic")}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            />

            <ToolbarButton
                tooltip="下划线"
                icon={<Underline className="h-4 w-4" />}
                active={editor.isActive("underline")}
                    disabled={!editor.can().chain().focus().toggleUnderline().run()}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            />

            <ToolbarButton
                tooltip="删除线"
                icon={<Strikethrough className="h-4 w-4" />}
                active={editor.isActive("strike")}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            />

            <div className="mx-2 h-4 w-px bg-border" />
            <ColorSelector editor={editor} />
        </div>
    );
};

interface RichInputProps {
    content?: string;
    onChange?: (value: string) => void;
    hideToolbar?: boolean;
    className?: string;
    mentionItems?: string[];
}

export const RichInput = forwardRef<Editor, RichInputProps>(
    ({ content, onChange, hideToolbar = false, className, mentionItems = [ 'name', 'amount', 'name1', 'date1', 'date2', 'goods1', 'goods2' ] }, _ref) => {
        const { theme } = useTheme();
        const editor = useEditor({
            extensions: [
                Document.configure({
                    content: 'paragraph+',
                }),
                Text,
                Paragraph,
                BoldExtension,
                Strike,
                ItalicExtension,
                UnderlineExtension,
                History,
                TextStyle,
                Color,
                Mention.configure({
                    HTMLAttributes: {
                        class: 'inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-sm font-medium ring-1 ring-inset ring-border hover:bg-muted/60',
                        'data-type': 'variable',
                    },
                    suggestion: createMentionSuggestion(mentionItems, theme || 'light'),
                    renderText({ node }) {
                        return `\${${node.attrs.id}}`;
                    },
                    renderHTML({ node }) {
                        return [
                            'span',
                            { 
                                class: 'inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-sm font-medium ring-1 ring-inset ring-border hover:bg-muted/60',
                                'data-type': 'variable',
                            },
                            `\${${node.attrs.id}}`
                        ];
                    },
                }),
            ],
            content: content || "<p></p>",
            onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
            immediatelyRender: false,
            editorProps: {
                attributes: {
                    class: cn(
                        "min-h-[80px] w-full rounded-b-md bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    ),
                },
            },
        });

        if (!editor) {
            return null;
        }

        return (
            <div className="w-full overflow-hidden rounded-md border" >
                {!hideToolbar && <Toolbar editor={editor} />}
                <EditorContent editor={editor} />
            </div>
        );
    },
);

RichInput.displayName = "RichInput";
