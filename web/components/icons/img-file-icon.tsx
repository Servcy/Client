import Image from "next/image"

import React from "react"

import ImgFileIcon from "public/attachment/img-icon.png"

import type { ImageIconPros } from "./types"

export const ImgIcon: React.FC<ImageIconPros> = ({ width, height }) => (
    <Image src={ImgFileIcon} height={height} width={width} alt="ImgFileIcon" />
)
