import { useParams } from "next/navigation"

import React, { useCallback, useMemo } from "react"

import { observer } from "mobx-react-lite"

import { CycleIssueQuickActions } from "@components/issues"

import { useCycle, useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { EIssueActions } from "../../types"
import { BaseKanBanRoot } from "../base-kanban-root"

export interface ICycleKanBanLayout {}

export const CycleKanBanLayout: React.FC = observer(() => {
    const { workspaceSlug, projectId, cycleId } = useParams()

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
        <BaseKanBanRoot
            issueActions={issueActions}
            issues={issues}
            issuesFilter={issuesFilter}
            showLoader={true}
            QuickActions={CycleIssueQuickActions}
            viewId={cycleId?.toString() ?? ""}
            storeType={EIssuesStoreType.CYCLE}
            addIssuesToView={addIssuesToView}
            canEditPropertiesBasedOnProject={canEditIssueProperties}
            isCompletedCycle={isCompletedCycle}
        />
    )
})
