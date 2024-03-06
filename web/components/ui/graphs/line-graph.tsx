// nivo
import { LineSvgProps, ResponsiveLine } from "@nivo/line"

import { CHARTS_THEME, DEFAULT_MARGIN } from "@constants/graph"

import { generateYAxisTickValues } from "@helpers/graph.helper"

import { TGraph } from "./types"

type Props = {
    customYAxisTickValues?: number[]
}

export const LineGraph: React.FC<Props & TGraph & LineSvgProps> = ({
    customYAxisTickValues,
    height = "400px",
    width = "100%",
    margin,
    theme,
    ...rest
}) => (
    <div style={{ height, width }}>
        <ResponsiveLine
            margin={{ ...DEFAULT_MARGIN, ...(margin ?? {}) }}
            axisLeft={{
                tickSize: 0,
                tickPadding: 10,
                tickValues: customYAxisTickValues ? generateYAxisTickValues(customYAxisTickValues) : undefined,
            }}
            theme={{ ...CHARTS_THEME, ...(theme ?? {}) }}
            animate
            {...rest}
        />
    </div>
)
