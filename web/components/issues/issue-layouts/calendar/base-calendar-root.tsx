import { useParams } from "next/navigation"

import { FC, useCallback } from "react"

import { DragDropContext, DropResult } from "@hello-pangea/dnd"
import { observer } from "mobx-react-lite"
import toast from "react-hot-toast"

import { CalendarChart } from "@components/issues"

import { useIssues, useUser } from "@hooks/store"

import { ERoles } from "@constants/iam"

import { ICycleIssues, ICycleIssuesFilter } from "@store/issue/cycle"
import { IModuleIssues, IModuleIssuesFilter } from "@store/issue/module"
import { IProjectIssues, IProjectIssuesFilter } from "@store/issue/project"
import { IProjectViewIssues, IProjectViewIssuesFilter } from "@store/issue/project-views"

import { TGroupedIssues, TIssue } from "@servcy/types"

import { IQuickActionProps } from "../list/list-view-types"
import { EIssueActions } from "../types"
import { handleDragDrop } from "./utils"

interface IBaseCalendarRoot {
    issueStore: IProjectIssues | IModuleIssues | ICycleIssues | IProjectViewIssues
    issuesFilterStore: IProjectIssuesFilter | IModuleIssuesFilter | ICycleIssuesFilter | IProjectViewIssuesFilter
    QuickActions: FC<IQuickActionProps>
    issueActions: {
        [EIssueActions.DELETE]: (issue: TIssue) => Promise<void>
        [EIssueActions.UPDATE]?: (issue: TIssue) => Promise<void>
        [EIssueActions.REMOVE]?: (issue: TIssue) => Promise<void>
        [EIssueActions.ARCHIVE]?: (issue: TIssue) => Promise<void>
        [EIssueActions.RESTORE]?: (issue: TIssue) => Promise<void>
    }
    viewId?: string
    isCompletedCycle?: boolean
}

export const BaseCalendarRoot = observer((props: IBaseCalendarRoot) => {
    const { issueStore, issuesFilterStore, QuickActions, issueActions, viewId, isCompletedCycle = false } = props
    const { workspaceSlug, projectId } = useParams()

    const { issueMap } = useIssues()
    const {
        membership: { currentProjectRole },
    } = useUser()

    const isEditingAllowed = currentProjectRole !== undefined && currentProjectRole >= ERoles.MEMBER

    const displayFilters = issuesFilterStore.issueFilters?.displayFilters

    const groupedIssueIds = (issueStore.groupedIssueIds ?? {}) as TGroupedIssues

    const onDragEnd = async (result: DropResult) => {
        if (!result) return

        // return if not dropped on the correct place
        if (!result.destination) return

        // return if dropped on the same date
        if (result.destination.droppableId === result.source.droppableId) return

        if (handleDragDrop) {
            await handleDragDrop(
                result.source,
                result.destination,
                workspaceSlug?.toString(),
                projectId?.toString(),
                issueStore,
                issueMap,
                groupedIssueIds,
                viewId
            ).catch(() => {
                toast.error("Please try again later")
            })
        }
    }

    const handleIssues = useCallback(
        async (_: string, issue: TIssue, action: EIssueActions) => {
            if (issueActions[action]) {
                await issueActions[action]!(issue)
            }
        },
        [issueActions]
    )

    return (
        <>
            <div className="h-full w-full overflow-hidden bg-custom-background-100 pt-4">
                <DragDropContext onDragEnd={onDragEnd}>
                    <CalendarChart
                        issuesFilterStore={issuesFilterStore}
                        issues={issueMap}
                        groupedIssueIds={groupedIssueIds}
                        layout={displayFilters?.calendar?.layout}
                        showWeekends={displayFilters?.calendar?.show_weekends ?? false}
                        quickActions={(issue, customActionButton) => (
                            <QuickActions
                                customActionButton={customActionButton}
                                issue={issue}
                                handleDelete={async () =>
                                    handleIssues(issue.target_date ?? "", issue, EIssueActions.DELETE)
                                }
                                handleUpdate={
                                    issueActions[EIssueActions.UPDATE]
                                        ? async (data) =>
                                              handleIssues(issue.target_date ?? "", data, EIssueActions.UPDATE)
                                        : undefined
                                }
                                handleRemoveFromView={
                                    issueActions[EIssueActions.REMOVE]
                                        ? async () => handleIssues(issue.target_date ?? "", issue, EIssueActions.REMOVE)
                                        : undefined
                                }
                                handleArchive={
                                    issueActions[EIssueActions.ARCHIVE]
                                        ? async () =>
                                              handleIssues(issue.target_date ?? "", issue, EIssueActions.ARCHIVE)
                                        : undefined
                                }
                                handleRestore={
                                    issueActions[EIssueActions.RESTORE]
                                        ? async () =>
                                              handleIssues(issue.target_date ?? "", issue, EIssueActions.RESTORE)
                                        : undefined
                                }
                                readOnly={!isEditingAllowed || isCompletedCycle}
                            />
                        )}
                        quickAddCallback={issueStore.quickAddIssue}
                        viewId={viewId}
                        readOnly={!isEditingAllowed || isCompletedCycle}
                    />
                </DragDropContext>
            </div>
        </>
    )
})
