import Image from "next/image"

import React from "react"

// image
import FigmaFileIcon from "public/attachment/figma-icon.png"

// type
import type { ImageIconPros } from "./types"

export const FigmaIcon: React.FC<ImageIconPros> = ({ width, height }) => (
    <Image src={FigmaFileIcon} height={height} width={width} alt="FigmaFileIcon" />
)
