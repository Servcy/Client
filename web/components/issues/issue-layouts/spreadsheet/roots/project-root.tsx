import { useParams } from "next/navigation"

import React, { useMemo } from "react"

import { observer } from "mobx-react-lite"

// mobx store
import { useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { ProjectIssueQuickActions } from "../../quick-action-dropdowns"
import { EIssueActions } from "../../types"
import { BaseSpreadsheetRoot } from "../base-spreadsheet-root"

export const ProjectSpreadsheetLayout: React.FC = observer(() => {
    const { workspaceSlug } = useParams() as { workspaceSlug: string }

    const { issues, issuesFilter } = useIssues(EIssuesStoreType.PROJECT)

    const issueActions = useMemo(
        () => ({
            [EIssueActions.UPDATE]: async (issue: TIssue) => {
                if (!workspaceSlug) return

                await issues.updateIssue(workspaceSlug, issue.project_id, issue.id, issue)
            },
            [EIssueActions.DELETE]: async (issue: TIssue) => {
                if (!workspaceSlug) return

                await issues.removeIssue(workspaceSlug, issue.project_id, issue.id)
            },
            [EIssueActions.ARCHIVE]: async (issue: TIssue) => {
                if (!workspaceSlug) return

                await issues.archiveIssue(workspaceSlug, issue.project_id, issue.id)
            },
        }),
        [issues, workspaceSlug]
    )

    return (
        <BaseSpreadsheetRoot
            issueStore={issues}
            issueFiltersStore={issuesFilter}
            issueActions={issueActions}
            QuickActions={ProjectIssueQuickActions}
        />
    )
})
