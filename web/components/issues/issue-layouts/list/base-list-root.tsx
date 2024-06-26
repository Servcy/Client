import { useParams } from "next/navigation"

import { FC, useCallback } from "react"

import { observer } from "mobx-react-lite"

import { useIssues, useUser } from "@hooks/store"

import { ERoles } from "@constants/iam"
import { TCreateModalStoreTypes } from "@constants/issue"

import { IArchivedIssues, IArchivedIssuesFilter } from "@store/issue/archived"
import { ICycleIssues, ICycleIssuesFilter } from "@store/issue/cycle"
import { IDraftIssues, IDraftIssuesFilter } from "@store/issue/draft"
import { IModuleIssues, IModuleIssuesFilter } from "@store/issue/module"
import { IProfileIssues, IProfileIssuesFilter } from "@store/issue/profile"
import { IProjectIssues, IProjectIssuesFilter } from "@store/issue/project"
import { IProjectViewIssues, IProjectViewIssuesFilter } from "@store/issue/project-views"

import { TIssue } from "@servcy/types"

import { EIssueActions } from "../types"
import { List } from "./default"
import { IQuickActionProps } from "./list-view-types"

interface IBaseListRoot {
    issuesFilter:
        | IProjectIssuesFilter
        | IModuleIssuesFilter
        | ICycleIssuesFilter
        | IProjectViewIssuesFilter
        | IProfileIssuesFilter
        | IDraftIssuesFilter
        | IArchivedIssuesFilter
    issues:
        | IProjectIssues
        | ICycleIssues
        | IModuleIssues
        | IProjectViewIssues
        | IProfileIssues
        | IDraftIssues
        | IArchivedIssues
    QuickActions: FC<IQuickActionProps>
    issueActions: {
        [EIssueActions.DELETE]: (issue: TIssue) => Promise<void>
        [EIssueActions.UPDATE]?: (issue: TIssue) => Promise<void>
        [EIssueActions.REMOVE]?: (issue: TIssue) => Promise<void>
        [EIssueActions.ARCHIVE]?: (issue: TIssue) => Promise<void>
        [EIssueActions.RESTORE]?: (issue: TIssue) => Promise<void>
    }
    viewId?: string
    storeType: TCreateModalStoreTypes
    addIssuesToView?: (issueIds: string[]) => Promise<any>
    canEditPropertiesBasedOnProject?: (projectId: string) => boolean
    isCompletedCycle?: boolean
}

export const BaseListRoot = observer((props: IBaseListRoot) => {
    const {
        issuesFilter,
        issues,
        QuickActions,
        issueActions,
        viewId,
        storeType,
        addIssuesToView,
        canEditPropertiesBasedOnProject,
        isCompletedCycle = false,
    } = props
    // mobx store
    const {
        membership: { currentProjectRole, projectRoleById },
    } = useUser()
    const { workspaceSlug } = useParams()
    const { issueMap } = useIssues()

    const isEditingAllowed = currentProjectRole !== undefined && currentProjectRole >= ERoles.MEMBER

    const issueIds = issues?.groupedIssueIds || []

    const { enableInlineEditing, enableQuickAdd, enableIssueCreation } = issues?.viewFlags || {}
    const canEditProperties = useCallback(
        (projectId: string | undefined) => {
            const isEditingAllowedBasedOnProject =
                canEditPropertiesBasedOnProject && projectId
                    ? canEditPropertiesBasedOnProject(projectId)
                    : isEditingAllowed

            return enableInlineEditing && isEditingAllowedBasedOnProject
        },
        [canEditPropertiesBasedOnProject, enableInlineEditing, isEditingAllowed]
    )

    const displayFilters = issuesFilter?.issueFilters?.displayFilters
    const displayProperties = issuesFilter?.issueFilters?.displayProperties

    const group_by = displayFilters?.group_by || null
    const showEmptyGroup = displayFilters?.show_empty_groups ?? false

    const handleIssues = useCallback(
        async (issue: TIssue, action: EIssueActions) => {
            if (issueActions[action]) {
                await issueActions[action]!(issue)
            }
        },
        [issueActions]
    )

    const renderQuickActions = useCallback(
        (issue: TIssue) => {
            const isEditingAllowedForIssue = projectRoleById(issue.project_id, workspaceSlug.toString())
            return (
                <QuickActions
                    issue={issue}
                    handleDelete={async () => handleIssues(issue, EIssueActions.DELETE)}
                    handleUpdate={
                        issueActions[EIssueActions.UPDATE]
                            ? async (data) => handleIssues(data, EIssueActions.UPDATE)
                            : undefined
                    }
                    handleRemoveFromView={
                        issueActions[EIssueActions.REMOVE]
                            ? async () => handleIssues(issue, EIssueActions.REMOVE)
                            : undefined
                    }
                    handleArchive={
                        issueActions[EIssueActions.ARCHIVE]
                            ? async () => handleIssues(issue, EIssueActions.ARCHIVE)
                            : undefined
                    }
                    handleRestore={
                        issueActions[EIssueActions.RESTORE]
                            ? async () => handleIssues(issue, EIssueActions.RESTORE)
                            : undefined
                    }
                    readOnly={!isEditingAllowedForIssue || isCompletedCycle}
                />
            )
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [handleIssues]
    )

    return (
        <div className={`relative h-full w-full bg-custom-background-90`}>
            <List
                issuesMap={issueMap}
                displayProperties={displayProperties}
                group_by={group_by}
                handleIssues={handleIssues}
                quickActions={renderQuickActions}
                issueIds={issueIds}
                showEmptyGroup={showEmptyGroup}
                viewId={viewId}
                quickAddCallback={issues?.quickAddIssue}
                enableIssueQuickAdd={!!enableQuickAdd}
                canEditProperties={canEditProperties}
                disableIssueCreation={!enableIssueCreation || !isEditingAllowed}
                storeType={storeType}
                addIssuesToView={addIssuesToView}
                isCompletedCycle={isCompletedCycle}
            />
        </div>
    )
})
