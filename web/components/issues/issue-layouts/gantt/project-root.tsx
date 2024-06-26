import { useParams } from "next/navigation"

import React from "react"

import { observer } from "mobx-react-lite"

import { useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { EIssueActions } from "../types"
import { BaseGanttRoot } from "./base-gantt-root"

export const GanttLayout: React.FC = observer(() => {
    const { workspaceSlug } = useParams()
    // store hooks
    const { issues, issuesFilter } = useIssues(EIssuesStoreType.PROJECT)

    const issueActions = {
        [EIssueActions.UPDATE]: async (issue: TIssue) => {
            if (!workspaceSlug) return

            await issues.updateIssue(workspaceSlug.toString(), issue.project_id, issue.id, issue)
        },
        [EIssueActions.DELETE]: async (issue: TIssue) => {
            if (!workspaceSlug) return

            await issues.removeIssue(workspaceSlug.toString(), issue.project_id, issue.id)
        },
    }

    return <BaseGanttRoot issueFiltersStore={issuesFilter} issueStore={issues} issueActions={issueActions} />
})
