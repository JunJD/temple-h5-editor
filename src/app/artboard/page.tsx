'use client'

import { useRef } from "react";
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import DraftEditor from "@/components/issue/editor/draft";

export const MM_TO_PX = 1;

export const pageSizeMap = {
    '14Pro': {
      width: 430,
      height: 932,
    },
    '12Pro': {
      width: 390,
      height: 844,
    },
    'SE': {
      width: 375,
      height: 667,
    },
  };
  

export default function Artboard() {
    const transformRef = useRef<ReactZoomPanPinchRef>(null);

    return (
        <TransformWrapper
            ref={transformRef}
            centerOnInit
            maxScale={2}
            minScale={0.4}
            initialScale={0.8}
            limitToBounds={false}
            doubleClick={{
                disabled: true
            }}
            wheel={{
                step: 0.1,
                wheelDisabled: false,
                // 只在按住 Alt 键时启用滚轮缩放
                activationKeys: ['Alt']
            }}
            panning={{
                disabled: false,
                velocityDisabled: true,
                // 只在按住 Alt 键时启用平移
                activationKeys: ['Alt'],
            }}
        >
            <TransformComponent
                wrapperClass="!w-screen !h-screen"
                contentClass="grid items-start justify-center space-x-12"
                contentStyle={{
                    width: `${(pageSizeMap['SE'].width * MM_TO_PX)}px`,
                    height: `${(pageSizeMap['SE'].height * MM_TO_PX)}px`
                }}
            >
                <div className="w-full h-full relative bg-background text-foreground shadow-2xl overflow-auto">
                    <DraftEditor editable={true} content={'22222'} />
                </div>
            </TransformComponent>
        </TransformWrapper>
    );
};
