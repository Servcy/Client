import Image from "next/image"

import React from "react"

// image
import CssFileIcon from "public/attachment/css-icon.png"

// type
import type { ImageIconPros } from "./types"

export const CssIcon: React.FC<ImageIconPros> = ({ width, height }) => (
    <Image src={CssFileIcon} height={height} width={width} alt="CssFileIcon" />
)
