import { useRouter } from "next/router"

import { useMemo } from "react"

import { observer } from "mobx-react-lite"

import { ProjectIssueQuickActions } from "@components/issues"

import { useIssues, useUser } from "@hooks/store"

import { EIssuesStoreType } from "@constants/issue"
import { EUserProjectRoles } from "@constants/project"

import { TIssue } from "@servcy/types"

import { EIssueActions } from "../../types"
import { BaseKanBanRoot } from "../base-kanban-root"

export const ProfileIssuesKanBanLayout: React.FC = observer(() => {
    const router = useRouter()
    const { workspaceSlug, userId } = router.query as { workspaceSlug: string; userId: string }

    const { issues, issuesFilter } = useIssues(EIssuesStoreType.PROFILE)

    const {
        membership: { currentWorkspaceAllProjectsRole },
    } = useUser()

    const issueActions = useMemo(
        () => ({
            [EIssueActions.UPDATE]: async (issue: TIssue) => {
                if (!workspaceSlug || !userId) return

                await issues.updateIssue(workspaceSlug, issue.project_id, issue.id, issue, userId)
            },
            [EIssueActions.DELETE]: async (issue: TIssue) => {
                if (!workspaceSlug || !userId) return

                await issues.removeIssue(workspaceSlug, issue.project_id, issue.id, userId)
            },
            [EIssueActions.ARCHIVE]: async (issue: TIssue) => {
                if (!workspaceSlug || !userId) return

                await issues.archiveIssue(workspaceSlug, issue.project_id, issue.id, userId)
            },
        }),
        [issues, workspaceSlug, userId]
    )

    const canEditPropertiesBasedOnProject = (projectId: string) => {
        const currentProjectRole = currentWorkspaceAllProjectsRole && currentWorkspaceAllProjectsRole[projectId]

        return !!currentProjectRole && currentProjectRole >= EUserProjectRoles.MEMBER
    }

    return (
        <BaseKanBanRoot
            issueActions={issueActions}
            issuesFilter={issuesFilter}
            issues={issues}
            showLoader={true}
            QuickActions={ProjectIssueQuickActions}
            storeType={EIssuesStoreType.PROFILE}
            canEditPropertiesBasedOnProject={canEditPropertiesBasedOnProject}
        />
    )
})
