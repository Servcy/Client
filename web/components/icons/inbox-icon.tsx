import React from "react"

import type { Props } from "./types"

export const InboxIcon: React.FC<Props> = ({
    width = "24",
    height = "24",
    color = "rgb(var(--color-text-200))",
    className,
}) => (
    <svg
        width={width}
        height={height}
        className={className}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M1.75 15.5C1.41667 15.5 1.125 15.375 0.875 15.125C0.625 14.875 0.5 14.5833 0.5 14.25V1.75C0.5 1.41667 0.625 1.125 0.875 0.875C1.125 0.625 1.41667 0.5 1.75 0.5H14.25C14.5833 0.5 14.875 0.625 15.125 0.875C15.375 1.125 15.5 1.41667 15.5 1.75V14.25C15.5 14.5833 15.375 14.875 15.125 15.125C14.875 15.375 14.5833 15.5 14.25 15.5H1.75ZM1.75 14.25H14.25V11.4167H11.2083C10.8472 11.9722 10.3785 12.3993 9.80208 12.6979C9.22569 12.9965 8.625 13.1458 8 13.1458C7.375 13.1458 6.77431 12.9965 6.19792 12.6979C5.62153 12.3993 5.15278 11.9722 4.79167 11.4167H1.75V14.25ZM8.00035 11.8958C8.48623 11.8958 8.93403 11.7743 9.34375 11.5312C9.75347 11.2882 10.0764 10.9514 10.3125 10.5208C10.4097 10.3819 10.5382 10.2882 10.6979 10.2396C10.8576 10.191 11.0208 10.1667 11.1875 10.1667H14.25V1.75H1.75V10.1667H4.8125C4.97917 10.1667 5.14236 10.191 5.30208 10.2396C5.46181 10.2882 5.59028 10.3819 5.6875 10.5208C5.92361 10.9514 6.24665 11.2882 6.6566 11.5312C7.06656 11.7743 7.51448 11.8958 8.00035 11.8958Z"
            fill={color}
        />
    </svg>
)
