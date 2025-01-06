'use client'

import { useEffect, useRef } from "react";
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import DraftEditor from "@/components/issue/editor/draft";

export const MM_TO_PX = 3.78;

export const pageSizeMap = {
    a4: {
      width: 210,
      height: 297,
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
                wheelDisabled: false
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
                    width: `${(pageSizeMap['a4'].width * MM_TO_PX + 42)}px`,
                    height: `${(pageSizeMap['a4'].height * MM_TO_PX + 42)}px`
                }}
            >
                <div className="w-full h-full relative bg-background text-foreground shadow-2xl">
                    <DraftEditor editable={true} content={'22222'} />
                </div>
            </TransformComponent>
        </TransformWrapper>
    );
};
