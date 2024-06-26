import { useParams } from "next/navigation"

import React from "react"

import { observer } from "mobx-react-lite"

// mobx store
import { useIssues } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { ProjectIssueQuickActions } from "../../quick-action-dropdowns"
import { EIssueActions } from "../../types"
import { BaseSpreadsheetRoot } from "../base-spreadsheet-root"

export interface IViewSpreadsheetLayout {
    issueActions: {
        [EIssueActions.DELETE]: (issue: TIssue) => Promise<void>
        [EIssueActions.UPDATE]?: (issue: TIssue) => Promise<void>
        [EIssueActions.REMOVE]?: (issue: TIssue) => Promise<void>
        [EIssueActions.ARCHIVE]?: (issue: TIssue) => Promise<void>
    }
}

export const ProjectViewSpreadsheetLayout: React.FC<IViewSpreadsheetLayout> = observer((props) => {
    const { issueActions } = props
    const { viewId } = useParams()

    const { issues, issuesFilter } = useIssues(EIssuesStoreType.PROJECT_VIEW)

    return (
        <BaseSpreadsheetRoot
            issueStore={issues}
            issueFiltersStore={issuesFilter}
            issueActions={issueActions}
            QuickActions={ProjectIssueQuickActions}
            viewId={viewId?.toString()}
        />
    )
})
