import { useParams } from "next/navigation"

import { useMemo } from "react"

import { observer } from "mobx-react-lite"

import { ProjectIssueQuickActions } from "@components/issues"

import { useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { EIssueActions } from "../../types"
import { BaseCalendarRoot } from "../base-calendar-root"

export const CalendarLayout: React.FC = observer(() => {
    const { workspaceSlug } = useParams()

    const { issues, issuesFilter } = useIssues(EIssuesStoreType.PROJECT)

    const issueActions = useMemo(
        () => ({
            [EIssueActions.UPDATE]: async (issue: TIssue) => {
                if (!workspaceSlug) return

                await issues.updateIssue(workspaceSlug.toString(), issue.project_id, issue.id, issue)
            },
            [EIssueActions.DELETE]: async (issue: TIssue) => {
                if (!workspaceSlug) return

                await issues.removeIssue(workspaceSlug.toString(), issue.project_id, issue.id)
            },
            [EIssueActions.ARCHIVE]: async (issue: TIssue) => {
                if (!workspaceSlug) return

                await issues.archiveIssue(workspaceSlug.toString(), issue.project_id, issue.id)
            },
        }),
        [issues, workspaceSlug]
    )

    return (
        <BaseCalendarRoot
            issueStore={issues}
            issuesFilterStore={issuesFilter}
            QuickActions={ProjectIssueQuickActions}
            issueActions={issueActions}
        />
    )
})
