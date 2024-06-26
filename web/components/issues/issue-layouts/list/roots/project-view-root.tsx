import { useParams } from "next/navigation"

import React from "react"

import { observer } from "mobx-react-lite"

// store
import { useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { ProjectIssueQuickActions } from "../../quick-action-dropdowns"
import { EIssueActions } from "../../types"
import { BaseListRoot } from "../base-list-root"

export interface IViewListLayout {
    issueActions: {
        [EIssueActions.DELETE]: (issue: TIssue) => Promise<void>
        [EIssueActions.UPDATE]?: (issue: TIssue) => Promise<void>
        [EIssueActions.REMOVE]?: (issue: TIssue) => Promise<void>
        [EIssueActions.ARCHIVE]?: (issue: TIssue) => Promise<void>
    }
}

export const ProjectViewListLayout: React.FC<IViewListLayout> = observer((props) => {
    const { issueActions } = props
    // store
    const { issuesFilter, issues } = useIssues(EIssuesStoreType.PROJECT_VIEW)
    const { workspaceSlug, projectId, viewId } = useParams()

    if (!workspaceSlug || !projectId) return null

    return (
        <BaseListRoot
            issuesFilter={issuesFilter}
            issues={issues}
            QuickActions={ProjectIssueQuickActions}
            issueActions={issueActions}
            storeType={EIssuesStoreType.PROJECT_VIEW}
            viewId={viewId?.toString()}
        />
    )
})
