import React, { useRef } from "react"

import { observer } from "mobx-react-lite"

import { SpreadsheetQuickAddIssueForm } from "@components/issues"

//hooks
import { useProject } from "@hooks/store"

import { IIssueDisplayFilterOptions, IIssueDisplayProperties, TIssue } from "@servcy/types"
import { Spinner } from "@servcy/ui"

import { EIssueActions } from "../types"
import { SpreadsheetTable } from "./spreadsheet-table"

type Props = {
    displayProperties: IIssueDisplayProperties
    displayFilters: IIssueDisplayFilterOptions
    handleDisplayFilterUpdate: (data: Partial<IIssueDisplayFilterOptions>) => void
    issueIds: string[] | undefined
    quickActions: (
        issue: TIssue,
        customActionButton?: React.ReactElement,
        portalElement?: HTMLDivElement | null
    ) => React.ReactNode
    handleIssues: (issue: TIssue, action: EIssueActions) => Promise<void>
    openIssuesListModal?: (() => void) | null
    quickAddCallback?: (
        workspaceSlug: string,
        projectId: string,
        data: TIssue,
        viewId?: string
    ) => Promise<TIssue | undefined>
    viewId?: string
    canEditProperties: (projectId: string | undefined) => boolean
    enableQuickCreateIssue?: boolean
    disableIssueCreation?: boolean
}

export const SpreadsheetView: React.FC<Props> = observer((props) => {
    const {
        displayProperties,
        displayFilters,
        handleDisplayFilterUpdate,
        issueIds,
        quickActions,
        handleIssues,
        quickAddCallback,
        viewId,
        canEditProperties,
        enableQuickCreateIssue,
        disableIssueCreation,
    } = props
    // refs
    const containerRef = useRef<HTMLTableElement | null>(null)
    const portalRef = useRef<HTMLDivElement | null>(null)

    const { currentProjectDetails } = useProject()

    const isEstimateEnabled: boolean = currentProjectDetails?.estimate !== null

    if (!issueIds || issueIds.length === 0)
        return (
            <div className="grid h-full w-full place-items-center">
                <Spinner />
            </div>
        )

    return (
        <div className="relative flex flex-col h-full w-full overflow-x-hidden whitespace-nowrap rounded-lg bg-custom-background-200 text-custom-text-200">
            <div ref={portalRef} className="spreadsheet-menu-portal" />
            <div ref={containerRef} className="vertical-scrollbar horizontal-scrollbar scrollbar-lg h-full w-full">
                <SpreadsheetTable
                    displayProperties={displayProperties}
                    displayFilters={displayFilters}
                    handleDisplayFilterUpdate={handleDisplayFilterUpdate}
                    issueIds={issueIds}
                    isEstimateEnabled={isEstimateEnabled}
                    portalElement={portalRef}
                    quickActions={quickActions}
                    handleIssues={handleIssues}
                    canEditProperties={canEditProperties}
                    containerRef={containerRef}
                />
            </div>
            <div className="border-t border-custom-border-100">
                <div className="z-5 sticky bottom-0 left-0 mb-3">
                    {enableQuickCreateIssue && !disableIssueCreation && (
                        <SpreadsheetQuickAddIssueForm
                            formKey="name"
                            quickAddCallback={quickAddCallback}
                            viewId={viewId}
                        />
                    )}
                </div>
            </div>
        </div>
    )
})
