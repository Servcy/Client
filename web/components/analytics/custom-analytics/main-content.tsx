import { useParams } from "next/navigation"

import { mutate } from "swr"

import { AnalyticsGraph, AnalyticsTable } from "@components/analytics"

import { ANALYTICS } from "@constants/fetch-keys"

import { convertResponseToBarGraphData } from "@helpers/analytics.helper"

import { IAnalyticsParams, IAnalyticsResponse } from "@servcy/types"
import { Button, Loader } from "@servcy/ui"

type Props = {
    analytics: IAnalyticsResponse | undefined
    error: any
    fullScreen: boolean
    params: IAnalyticsParams
}

export const CustomAnalyticsMainContent: React.FC<Props> = (props) => {
    const { analytics, error, fullScreen, params } = props

    const { workspaceSlug } = useParams()

    const yAxisKey = params.y_axis === "issue_count" ? "count" : "estimate"
    const barGraphData = convertResponseToBarGraphData(analytics?.distribution, params)

    return (
        <>
            {!error ? (
                analytics ? (
                    analytics.total > 0 ? (
                        <div className="h-full overflow-y-auto">
                            <AnalyticsGraph
                                analytics={analytics}
                                barGraphData={barGraphData}
                                params={params}
                                yAxisKey={yAxisKey}
                                fullScreen={fullScreen}
                            />
                            <AnalyticsTable
                                analytics={analytics}
                                barGraphData={barGraphData}
                                params={params}
                                yAxisKey={yAxisKey}
                            />
                        </div>
                    ) : (
                        <div className="grid h-full place-items-center p-5">
                            <div className="space-y-4 text-custom-text-200">
                                <p className="text-sm">No matching issues found. Try changing the parameters.</p>
                            </div>
                        </div>
                    )
                ) : (
                    <Loader className="space-y-6 p-5">
                        <Loader.Item height="300px" />
                        <Loader className="space-y-4">
                            <Loader.Item height="30px" />
                            <Loader.Item height="30px" />
                            <Loader.Item height="30px" />
                            <Loader.Item height="30px" />
                        </Loader>
                    </Loader>
                )
            ) : (
                <div className="grid h-full place-items-center p-5">
                    <div className="space-y-4 text-custom-text-200">
                        <p className="text-sm">There was some error in fetching the data.</p>
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="primary"
                                onClick={() => {
                                    if (!workspaceSlug) return

                                    mutate(ANALYTICS(workspaceSlug.toString(), params))
                                }}
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
