import { useParams } from "next/navigation"

import { observer } from "mobx-react-lite"

import { useIssues, useModule } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

import { EIssueActions } from "../types"
import { BaseGanttRoot } from "./base-gantt-root"

export const ModuleGanttLayout: React.FC = observer(() => {
    const { workspaceSlug, moduleId } = useParams()
    // store hooks
    const { issues, issuesFilter } = useIssues(EIssuesStoreType.MODULE)
    const { fetchModuleDetails } = useModule()

    const issueActions = {
        [EIssueActions.UPDATE]: async (issue: TIssue) => {
            if (!workspaceSlug || !moduleId) return

            await issues.updateIssue(workspaceSlug.toString(), issue.project_id, issue.id, issue, moduleId.toString())
            fetchModuleDetails(workspaceSlug.toString(), issue.project_id, moduleId.toString())
        },
        [EIssueActions.DELETE]: async (issue: TIssue) => {
            if (!workspaceSlug || !moduleId) return

            await issues.removeIssue(workspaceSlug.toString(), issue.project_id, issue.id, moduleId.toString())
            fetchModuleDetails(workspaceSlug.toString(), issue.project_id, moduleId.toString())
        },
        [EIssueActions.REMOVE]: async (issue: TIssue) => {
            if (!workspaceSlug || !moduleId || !issue.id) return

            await issues.removeIssueFromModule(
                workspaceSlug.toString(),
                issue.project_id,
                moduleId.toString(),
                issue.id
            )
            fetchModuleDetails(workspaceSlug.toString(), issue.project_id, moduleId.toString())
        },
    }

    return (
        <BaseGanttRoot
            issueActions={issueActions}
            issueFiltersStore={issuesFilter}
            issueStore={issues}
            viewId={moduleId?.toString()}
        />
    )
})
