import { useParams, usePathname } from "next/navigation"

import React, { useCallback } from "react"

import { observer } from "mobx-react-lite"

import { CycleDropdown } from "@components/dropdowns"

import { useEventTracker, useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

type Props = {
    issue: TIssue
    onClose: () => void
    disabled: boolean
}

export const SpreadsheetCycleColumn: React.FC<Props> = observer((props) => {
    const pathname = usePathname()
    const { workspaceSlug } = useParams()
    // props
    const { issue, disabled, onClose } = props

    const { captureIssueEvent } = useEventTracker()
    const {
        issues: { addIssueToCycle, removeIssueFromCycle },
    } = useIssues(EIssuesStoreType.CYCLE)

    const handleCycle = useCallback(
        async (cycleId: string | null) => {
            if (!workspaceSlug || !issue || issue.cycle_id === cycleId) return
            if (cycleId) await addIssueToCycle(workspaceSlug.toString(), issue.project_id, cycleId, [issue.id])
            else await removeIssueFromCycle(workspaceSlug.toString(), issue.project_id, issue.cycle_id ?? "", issue.id)
            captureIssueEvent({
                eventName: "Issue updated",
                payload: {
                    ...issue,
                    cycle_id: cycleId,
                    element: "Spreadsheet layout",
                },
                updates: { changed_property: "cycle", change_details: { cycle_id: cycleId } },
                path: pathname,
            })
        },
        [workspaceSlug, issue, addIssueToCycle, removeIssueFromCycle, captureIssueEvent, pathname]
    )

    return (
        <div className="h-11 border-b-[0.5px] border-custom-border-200">
            <CycleDropdown
                projectId={issue.project_id}
                value={issue.cycle_id}
                onChange={handleCycle}
                disabled={disabled}
                placeholder="Select cycle"
                buttonVariant="transparent-with-text"
                buttonContainerClassName="w-full relative flex items-center p-2"
                buttonClassName="relative border-[0.5px] border-custom-border-400 h-4.5"
                onClose={onClose}
            />
        </div>
    )
})
