import { useRouter } from "next/navigation"

import React, { useCallback, useMemo } from "react"

import { observer } from "mobx-react-lite"

import { CycleIssueQuickActions } from "@components/issues"

import { useCycle, useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { EIssueActions } from "../../types"
import { BaseListRoot } from "../base-list-root"

export interface ICycleListLayout {}

export const CycleListLayout: React.FC = observer(() => {
    const router = useRouter()
    const { workspaceSlug, projectId, cycleId } = router.query
    // store
    const { issues, issuesFilter } = useIssues(EIssuesStoreType.CYCLE)
    const { currentProjectCompletedCycleIds } = useCycle()

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
                if (!workspaceSlug || !cycleId) return

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
        [issues, workspaceSlug, cycleId]
    )
    const isCompletedCycle =
        cycleId && currentProjectCompletedCycleIds
            ? currentProjectCompletedCycleIds.includes(cycleId.toString())
            : false

    const canEditIssueProperties = useCallback(() => !isCompletedCycle, [isCompletedCycle])

    const addIssuesToView = useCallback(
        (issueIds: string[]) => {
            if (!workspaceSlug || !projectId || !cycleId) throw new Error()
            return issues.addIssueToCycle(workspaceSlug.toString(), projectId.toString(), cycleId.toString(), issueIds)
        },
        [issues?.addIssueToCycle, workspaceSlug, projectId, cycleId]
    )

    return (
        <BaseListRoot
            issuesFilter={issuesFilter}
            issues={issues}
            QuickActions={CycleIssueQuickActions}
            issueActions={issueActions}
            viewId={cycleId?.toString()}
            storeType={EIssuesStoreType.CYCLE}
            addIssuesToView={addIssuesToView}
            canEditPropertiesBasedOnProject={canEditIssueProperties}
            isCompletedCycle={isCompletedCycle}
        />
    )
})
