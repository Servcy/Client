import React, { useMemo, useState } from "react"

import sortBy from "lodash/sortBy"
import { observer } from "mobx-react"

import { FilterHeader, FilterOption } from "@components/issues"

import { useProject } from "@hooks/store"

import { renderEmoji } from "@helpers/emoji.helper"

import { Loader } from "@servcy/ui"

type Props = {
    appliedFilters: string[] | null
    handleUpdate: (val: string) => void
    searchQuery: string
}

export const FilterProjects: React.FC<Props> = observer((props) => {
    const { appliedFilters, handleUpdate, searchQuery } = props
    // states
    const [itemsToRender, setItemsToRender] = useState(5)
    const [previewEnabled, setPreviewEnabled] = useState(true)
    // store
    const { getProjectById, workspaceProjectIds } = useProject()
    // derived values
    const projects = workspaceProjectIds?.map((projectId) => getProjectById(projectId)!) ?? null
    const appliedFiltersCount = appliedFilters?.length ?? 0
    const sortedOptions = useMemo(() => {
        const _filteredOptions = (projects || []).filter((project) =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        return sortBy(_filteredOptions, [
            (project) => !(appliedFilters ?? []).includes(project.id),
            (project) => project.name.toLowerCase(),
        ])
    }, [searchQuery])

    const handleViewToggle = () => {
        if (!sortedOptions) return

        if (itemsToRender === sortedOptions.length) setItemsToRender(5)
        else setItemsToRender(sortedOptions.length)
    }

    return (
        <>
            <FilterHeader
                title={`Project${appliedFiltersCount > 0 ? ` (${appliedFiltersCount})` : ""}`}
                isPreviewEnabled={previewEnabled}
                handleIsPreviewEnabled={() => setPreviewEnabled(!previewEnabled)}
            />
            {previewEnabled && (
                <div>
                    {sortedOptions ? (
                        sortedOptions.length > 0 ? (
                            <>
                                {sortedOptions.slice(0, itemsToRender).map((project) => (
                                    <FilterOption
                                        key={`project-${project.id}`}
                                        isChecked={appliedFilters?.includes(project.id) ? true : false}
                                        onClick={() => handleUpdate(project.id)}
                                        icon={
                                            project.emoji ? (
                                                <span className="grid flex-shrink-0 place-items-center text-sm">
                                                    {renderEmoji(project.emoji)}
                                                </span>
                                            ) : project.icon_prop ? (
                                                <div className="-my-1 grid flex-shrink-0 place-items-center">
                                                    {renderEmoji(project.icon_prop)}
                                                </div>
                                            ) : (
                                                <span className="mr-1 grid flex-shrink-0 place-items-center rounded bg-gray-700 uppercase text-white">
                                                    {project?.name.charAt(0)}
                                                </span>
                                            )
                                        }
                                        title={project.name}
                                    />
                                ))}
                                {sortedOptions.length > 5 && (
                                    <button
                                        type="button"
                                        className="ml-8 text-xs font-medium text-custom-primary-100"
                                        onClick={handleViewToggle}
                                    >
                                        {itemsToRender === sortedOptions.length ? "View less" : "View all"}
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="text-xs italic text-custom-text-400">No matches found</p>
                        )
                    ) : (
                        <Loader className="space-y-2">
                            <Loader.Item height="20px" />
                            <Loader.Item height="20px" />
                            <Loader.Item height="20px" />
                        </Loader>
                    )}
                </div>
            )}
        </>
    )
})
