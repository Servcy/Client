import Image from "next/image"

import React from "react"

// image
import SheetFileIcon from "public/attachment/excel-icon.png"

// type
import type { ImageIconPros } from "./types"

export const SheetIcon: React.FC<ImageIconPros> = ({ width, height }) => (
    <Image src={SheetFileIcon} height={height} width={width} alt="SheetFileIcon" />
)
