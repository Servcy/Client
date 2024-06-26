import { useParams } from "next/navigation"

import React, { Fragment } from "react"

import { observer } from "mobx-react-lite"
import useSWR from "swr"

import {
    ArchivedIssueAppliedFiltersRoot,
    ArchivedIssueListLayout,
    IssuePeekOverview,
    ProjectArchivedEmptyState,
} from "@components/issues"
import { ListLayoutLoader } from "@components/ui"

// mobx store
import { useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

export const ArchivedIssueLayoutRoot: React.FC = observer(() => {
    const { workspaceSlug, projectId } = useParams()

    const { issues, issuesFilter } = useIssues(EIssuesStoreType.ARCHIVED)

    useSWR(
        workspaceSlug && projectId ? `ARCHIVED_ISSUES_${workspaceSlug.toString()}_${projectId.toString()}` : null,
        async () => {
            if (workspaceSlug && projectId) {
                await issuesFilter?.fetchFilters(workspaceSlug.toString(), projectId.toString())
                await issues?.fetchIssues(
                    workspaceSlug.toString(),
                    projectId.toString(),
                    issues?.groupedIssueIds ? "mutation" : "init-loader"
                )
            }
        },
        { revalidateIfStale: false, revalidateOnFocus: false }
    )

    if (issues?.loader === "init-loader" || !issues?.groupedIssueIds) {
        return <ListLayoutLoader />
    }

    if (!workspaceSlug || !projectId) return <></>
    return (
        <>
            <ArchivedIssueAppliedFiltersRoot />

            {issues?.groupedIssueIds?.length === 0 ? (
                <div className="relative h-full w-full overflow-y-auto">
                    <ProjectArchivedEmptyState />
                </div>
            ) : (
                <Fragment>
                    <div className="relative h-full w-full overflow-auto">
                        <ArchivedIssueListLayout />
                    </div>
                    <IssuePeekOverview is_archived />
                </Fragment>
            )}
        </>
    )
})
