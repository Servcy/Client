import Image from "next/image"

import React from "react"

// image
import JsFileIcon from "public/attachment/js-icon.png"

// type
import type { ImageIconPros } from "./types"

export const JavaScriptIcon: React.FC<ImageIconPros> = ({ width, height }) => (
    <Image src={JsFileIcon} height={height} width={width} alt="JsFileIcon" />
)
