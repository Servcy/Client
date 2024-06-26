import { useParams } from "next/navigation"

import { useMemo } from "react"

import { observer } from "mobx-react-lite"

import { CycleIssueQuickActions } from "@components/issues"

//hooks
import { useCycle, useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { EIssueActions } from "../../types"
import { BaseCalendarRoot } from "../base-calendar-root"

export const CycleCalendarLayout: React.FC = observer(() => {
    const { issues, issuesFilter } = useIssues(EIssuesStoreType.CYCLE)
    const { currentProjectCompletedCycleIds } = useCycle()
    const { workspaceSlug, projectId, cycleId } = useParams()

    const issueActions = useMemo(
        () => ({
            [EIssueActions.UPDATE]: async (issue: TIssue) => {
                if (!workspaceSlug || !cycleId) return

                await issues.updateIssue(
                    workspaceSlug.toString(),
                    issue.project_id,
                    issue.id,
                    issue,
                    cycleId.toString()
                )
            },
            [EIssueActions.DELETE]: async (issue: TIssue) => {
                if (!workspaceSlug || !cycleId) return
                await issues.removeIssue(workspaceSlug.toString(), issue.project_id, issue.id, cycleId.toString())
            },
            [EIssueActions.REMOVE]: async (issue: TIssue) => {
                if (!workspaceSlug || !cycleId || !projectId) return
                await issues.removeIssueFromCycle(
                    workspaceSlug.toString(),
                    issue.project_id,
                    cycleId.toString(),
                    issue.id
                )
            },
            [EIssueActions.ARCHIVE]: async (issue: TIssue) => {
                if (!workspaceSlug || !cycleId) return
                await issues.archiveIssue(workspaceSlug.toString(), issue.project_id, issue.id, cycleId.toString())
            },
        }),
        [issues, workspaceSlug, cycleId, projectId]
    )

    if (!cycleId) return null

    const isCompletedCycle =
        cycleId && currentProjectCompletedCycleIds
            ? currentProjectCompletedCycleIds.includes(cycleId.toString())
            : false

    return (
        <BaseCalendarRoot
            issueStore={issues}
            issuesFilterStore={issuesFilter}
            QuickActions={CycleIssueQuickActions}
            issueActions={issueActions}
            viewId={cycleId.toString()}
            isCompletedCycle={isCompletedCycle}
        />
    )
})
