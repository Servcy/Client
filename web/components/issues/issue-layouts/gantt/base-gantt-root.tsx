import { useParams } from "next/navigation"

import React from "react"

import { observer } from "mobx-react-lite"

import { GanttChartRoot, IBlockUpdateData, IssueGanttSidebar } from "@components/gantt-chart"
import { GanttQuickAddIssueForm, IssueGanttBlock } from "@components/issues"

import { useIssues, useUser } from "@hooks/store"

import { ERoles } from "@constants/iam"

import { ICycleIssues, ICycleIssuesFilter } from "@store/issue/cycle"
import { IModuleIssues, IModuleIssuesFilter } from "@store/issue/module"
import { IProjectIssues, IProjectIssuesFilter } from "@store/issue/project"
import { IProjectViewIssues, IProjectViewIssuesFilter } from "@store/issue/project-views"

import { renderIssueBlocksStructure } from "@helpers/issue.helper"

import { TIssue, TUnGroupedIssues } from "@servcy/types"

import { EIssueActions } from "../types"

interface IBaseGanttRoot {
    issueFiltersStore: IProjectIssuesFilter | IModuleIssuesFilter | ICycleIssuesFilter | IProjectViewIssuesFilter
    issueStore: IProjectIssues | IModuleIssues | ICycleIssues | IProjectViewIssues
    viewId?: string
    issueActions: {
        [EIssueActions.DELETE]: (issue: TIssue) => Promise<void>
        [EIssueActions.UPDATE]?: (issue: TIssue) => Promise<void>
        [EIssueActions.REMOVE]?: (issue: TIssue) => Promise<void>
    }
}

export const BaseGanttRoot: React.FC<IBaseGanttRoot> = observer((props: IBaseGanttRoot) => {
    const { issueFiltersStore, issueStore, viewId } = props

    const { workspaceSlug } = useParams()
    // store hooks
    const {
        membership: { currentProjectRole },
    } = useUser()
    const { issueMap } = useIssues()
    const appliedDisplayFilters = issueFiltersStore.issueFilters?.displayFilters

    const issueIds = (issueStore.groupedIssueIds ?? []) as TUnGroupedIssues
    const { enableIssueCreation } = issueStore?.viewFlags || {}

    const issues = issueIds.map((id) => issueMap?.[id])

    const updateIssueBlockStructure = async (issue: TIssue, data: IBlockUpdateData) => {
        if (!workspaceSlug) return

        const payload: any = { ...data }
        if (data.sort_order) payload.sort_order = data.sort_order.newSortOrder

        await issueStore.updateIssue(workspaceSlug.toString(), issue.project_id, issue.id, payload, viewId)
    }

    const isAllowed = currentProjectRole !== undefined && currentProjectRole >= ERoles.MEMBER

    return (
        <>
            <div className="h-full w-full">
                <GanttChartRoot
                    border={false}
                    title="Issues"
                    loaderTitle="Issues"
                    blocks={issues ? renderIssueBlocksStructure(issues as TIssue[]) : null}
                    blockUpdateHandler={updateIssueBlockStructure}
                    blockToRender={(data: TIssue) => <IssueGanttBlock issueId={data.id} />}
                    sidebarToRender={(props) => <IssueGanttSidebar {...props} showAllBlocks />}
                    enableBlockLeftResize={isAllowed}
                    enableBlockRightResize={isAllowed}
                    enableBlockMove={isAllowed}
                    enableReorder={appliedDisplayFilters?.order_by === "sort_order" && isAllowed}
                    enableAddBlock={isAllowed}
                    quickAdd={
                        enableIssueCreation && isAllowed ? (
                            <GanttQuickAddIssueForm quickAddCallback={issueStore.quickAddIssue} viewId={viewId} />
                        ) : undefined
                    }
                    showAllBlocks
                />
            </div>
        </>
    )
})
