import { useParams } from "next/navigation"

import isEqual from "lodash/isEqual"
import { observer } from "mobx-react-lite"

import { AppliedFiltersList } from "@components/issues"

import { useIssues, useLabel, useProjectState, useProjectView } from "@hooks/store"

import { EIssueFilterType, EIssuesStoreType } from "@constants/issue"

import { IIssueFilterOptions } from "@servcy/types"
import { Button } from "@servcy/ui"

export const ProjectViewAppliedFiltersRoot: React.FC = observer(() => {
    const { workspaceSlug, projectId, viewId } = useParams() as {
        workspaceSlug: string
        projectId: string
        viewId: string
    }
    // store hooks
    const {
        issuesFilter: { issueFilters, updateFilters },
    } = useIssues(EIssuesStoreType.PROJECT_VIEW)
    const { projectLabels } = useLabel()
    const { projectStates } = useProjectState()
    const { viewMap, updateView } = useProjectView()
    // derived values
    const viewDetails = viewId ? viewMap[viewId.toString()] : null
    const userFilters = issueFilters?.filters
    // filters whose value not null or empty array
    let appliedFilters: IIssueFilterOptions | undefined = undefined
    Object.entries(userFilters ?? {}).forEach(([key, value]) => {
        if (!value) return
        if (Array.isArray(value) && value.length === 0) return
        if (!appliedFilters) appliedFilters = {}
        appliedFilters[key as keyof IIssueFilterOptions] = value
    })

    const handleRemoveFilter = (key: keyof IIssueFilterOptions, value: string | null) => {
        if (!workspaceSlug || !projectId) return
        if (!value) {
            updateFilters(
                workspaceSlug,
                projectId,
                EIssueFilterType.FILTERS,
                {
                    [key]: null,
                },
                viewId
            )
            return
        }

        let newValues = issueFilters?.filters?.[key] ?? []
        newValues = newValues.filter((val) => val !== value)

        updateFilters(
            workspaceSlug,
            projectId,
            EIssueFilterType.FILTERS,
            {
                [key]: newValues,
            },
            viewId
        )
    }

    const handleClearAllFilters = () => {
        if (!workspaceSlug || !projectId) return
        const newFilters: IIssueFilterOptions = {}
        Object.keys(userFilters ?? {}).forEach((key) => {
            newFilters[key as keyof IIssueFilterOptions] = []
        })
        updateFilters(workspaceSlug, projectId, EIssueFilterType.FILTERS, { ...newFilters }, viewId)
    }

    const areFiltersEqual = isEqual(appliedFilters, viewDetails?.filters)
    // return if no filters are applied
    if (!appliedFilters && areFiltersEqual) return null

    const handleUpdateView = () => {
        if (!workspaceSlug || !projectId || !viewId || !viewDetails) return

        updateView(workspaceSlug.toString(), projectId.toString(), viewId.toString(), {
            filters: {
                ...(appliedFilters ?? {}),
            },
        })
    }

    return (
        <div className="flex items-center justify-between gap-4 p-4">
            <AppliedFiltersList
                appliedFilters={appliedFilters ?? {}}
                handleClearAllFilters={handleClearAllFilters}
                handleRemoveFilter={handleRemoveFilter}
                labels={projectLabels ?? []}
                states={projectStates}
                alwaysAllowEditing
            />

            {!areFiltersEqual && (
                <>
                    <div />
                    <div className="flex flex-shrink-0 items-center justify-center">
                        <Button variant="primary" size="sm" onClick={handleUpdateView}>
                            Update view
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
})
