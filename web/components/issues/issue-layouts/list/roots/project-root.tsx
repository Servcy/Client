import { useParams } from "next/navigation"

import { FC, useMemo } from "react"

import { observer } from "mobx-react-lite"

import { ProjectIssueQuickActions } from "@components/issues"

import { useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { EIssueActions } from "../../types"
import { BaseListRoot } from "../base-list-root"

export const ListLayout: FC = observer(() => {
    const { workspaceSlug, projectId } = useParams() as { workspaceSlug: string; projectId: string }

    if (!workspaceSlug || !projectId) return null

    // store
    const { issuesFilter, issues } = useIssues(EIssuesStoreType.PROJECT)

    const issueActions = useMemo(
        () => ({
            [EIssueActions.UPDATE]: async (issue: TIssue) => {
                if (!workspaceSlug || !projectId) return

                await issues.updateIssue(workspaceSlug, projectId, issue.id, issue)
            },
            [EIssueActions.DELETE]: async (issue: TIssue) => {
                if (!workspaceSlug || !projectId) return

                await issues.removeIssue(workspaceSlug, projectId, issue.id)
            },
            [EIssueActions.ARCHIVE]: async (issue: TIssue) => {
                if (!workspaceSlug || !projectId) return

                await issues.archiveIssue(workspaceSlug, projectId, issue.id)
            },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [issues]
    )

    return (
        <BaseListRoot
            issuesFilter={issuesFilter}
            issues={issues}
            QuickActions={ProjectIssueQuickActions}
            issueActions={issueActions}
            storeType={EIssuesStoreType.PROJECT}
        />
    )
})
