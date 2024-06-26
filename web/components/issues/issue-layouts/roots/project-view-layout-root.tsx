import { useParams } from "next/navigation"

import React, { Fragment, useMemo } from "react"

import { observer } from "mobx-react-lite"
import useSWR from "swr"

import {
    IssuePeekOverview,
    ProjectViewAppliedFiltersRoot,
    ProjectViewCalendarLayout,
    ProjectViewEmptyState,
    ProjectViewGanttLayout,
    ProjectViewKanBanLayout,
    ProjectViewListLayout,
    ProjectViewSpreadsheetLayout,
} from "@components/issues"
import { ActiveLoader } from "@components/ui"

// mobx store
import { useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { EIssueActions } from "../types"

export const ProjectViewLayoutRoot: React.FC = observer(() => {
    const { workspaceSlug, projectId, viewId } = useParams()

    const { issues, issuesFilter } = useIssues(EIssuesStoreType.PROJECT_VIEW)

    useSWR(
        workspaceSlug && projectId && viewId ? `PROJECT_VIEW_ISSUES_${workspaceSlug}_${projectId}_${viewId}` : null,
        async () => {
            if (workspaceSlug && projectId && viewId) {
                await issuesFilter?.fetchFilters(workspaceSlug.toString(), projectId.toString(), viewId.toString())
                await issues?.fetchIssues(
                    workspaceSlug.toString(),
                    projectId.toString(),
                    issues?.groupedIssueIds ? "mutation" : "init-loader",
                    viewId.toString()
                )
            }
        },
        { revalidateIfStale: false, revalidateOnFocus: false }
    )

    const issueActions = useMemo(
        () => ({
            [EIssueActions.UPDATE]: async (issue: TIssue) => {
                if (!workspaceSlug || !projectId) return

                await issues.updateIssue(
                    workspaceSlug.toString(),
                    projectId.toString(),
                    issue.id,
                    issue,
                    viewId?.toString()
                )
            },
            [EIssueActions.DELETE]: async (issue: TIssue) => {
                if (!workspaceSlug || !projectId) return

                await issues.removeIssue(workspaceSlug.toString(), projectId.toString(), issue.id, viewId?.toString())
            },
        }),
        [issues, workspaceSlug, projectId, viewId]
    )

    const activeLayout = issuesFilter?.issueFilters?.displayFilters?.layout

    if (!workspaceSlug || !projectId || !viewId) return <></>

    if (issues?.loader === "init-loader" || !issues?.groupedIssueIds) {
        return <>{activeLayout && <ActiveLoader layout={activeLayout} />}</>
    }

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden">
            <ProjectViewAppliedFiltersRoot />

            {issues?.groupedIssueIds?.length === 0 ? (
                <div className="relative h-full w-full overflow-y-auto">
                    <ProjectViewEmptyState />
                </div>
            ) : (
                <Fragment>
                    <div className="relative h-full w-full overflow-auto">
                        {activeLayout === "list" ? (
                            <ProjectViewListLayout issueActions={issueActions} />
                        ) : activeLayout === "kanban" ? (
                            <ProjectViewKanBanLayout issueActions={issueActions} />
                        ) : activeLayout === "calendar" ? (
                            <ProjectViewCalendarLayout issueActions={issueActions} />
                        ) : activeLayout === "gantt_chart" ? (
                            <ProjectViewGanttLayout issueActions={issueActions} />
                        ) : activeLayout === "spreadsheet" ? (
                            <ProjectViewSpreadsheetLayout issueActions={issueActions} />
                        ) : null}
                    </div>

                    {/* peek overview */}
                    <IssuePeekOverview />
                </Fragment>
            )}
        </div>
    )
})
