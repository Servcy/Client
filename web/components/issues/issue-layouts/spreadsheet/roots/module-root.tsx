import { useParams } from "next/navigation"

import React, { useMemo } from "react"

import { observer } from "mobx-react-lite"

// mobx store
import { useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { ModuleIssueQuickActions } from "../../quick-action-dropdowns"
import { EIssueActions } from "../../types"
import { BaseSpreadsheetRoot } from "../base-spreadsheet-root"

export const ModuleSpreadsheetLayout: React.FC = observer(() => {
    const { workspaceSlug, moduleId } = useParams() as { workspaceSlug: string; moduleId: string }

    const { issues, issuesFilter } = useIssues(EIssuesStoreType.MODULE)

    const issueActions = useMemo(
        () => ({
            [EIssueActions.UPDATE]: async (issue: TIssue) => {
                if (!workspaceSlug || !moduleId) return

                issues.updateIssue(workspaceSlug.toString(), issue.project_id, issue.id, issue, moduleId)
            },
            [EIssueActions.DELETE]: async (issue: TIssue) => {
                if (!workspaceSlug || !moduleId) return
                issues.removeIssue(workspaceSlug, issue.project_id, issue.id, moduleId)
            },
            [EIssueActions.REMOVE]: async (issue: TIssue) => {
                if (!workspaceSlug || !moduleId) return
                issues.removeIssueFromModule(workspaceSlug, issue.project_id, moduleId, issue.id)
            },
            [EIssueActions.ARCHIVE]: async (issue: TIssue) => {
                if (!workspaceSlug || !moduleId) return
                issues.archiveIssue(workspaceSlug, issue.project_id, issue.id, moduleId)
            },
        }),
        [issues, workspaceSlug, moduleId]
    )

    return (
        <BaseSpreadsheetRoot
            issueStore={issues}
            issueFiltersStore={issuesFilter}
            viewId={moduleId}
            issueActions={issueActions}
            QuickActions={ModuleIssueQuickActions}
        />
    )
})
