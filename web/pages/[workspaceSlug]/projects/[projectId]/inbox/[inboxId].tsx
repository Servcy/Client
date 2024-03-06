import { useRouter } from "next/router"

import { ReactElement } from "react"

import { observer } from "mobx-react"
import useSWR from "swr"

import { PageHead } from "@components/core"
import { ProjectInboxHeader } from "@components/headers"
import { InboxContentRoot, InboxSidebarRoot } from "@components/inbox"
import { InboxLayoutLoader } from "@components/ui"

import { useInboxIssues, useProject } from "@hooks/store"

import { AppLayout } from "@layouts/app-layout"

import { NextPageWithLayout } from "@/types/types"

const ProjectInboxPage: NextPageWithLayout = observer(() => {
    const router = useRouter()
    const { workspaceSlug, projectId, inboxId, inboxIssueId } = router.query
    // store hooks
    const { currentProjectDetails } = useProject()
    const {
        filters: { fetchInboxFilters },
        issues: { fetchInboxIssues },
    } = useInboxIssues()
    // fetching the Inbox filters and issues
    const { isLoading } = useSWR(
        workspaceSlug && projectId && currentProjectDetails && currentProjectDetails?.inbox_view
            ? `INBOX_ISSUES_${workspaceSlug.toString()}_${projectId.toString()}`
            : null,
        async () => {
            if (workspaceSlug && projectId && inboxId && currentProjectDetails && currentProjectDetails?.inbox_view) {
                await fetchInboxFilters(workspaceSlug.toString(), projectId.toString(), inboxId.toString())
                await fetchInboxIssues(workspaceSlug.toString(), projectId.toString(), inboxId.toString())
            }
        }
    )
    // derived values
    const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Inbox` : undefined

    if (!workspaceSlug || !projectId || !inboxId || !currentProjectDetails?.inbox_view || isLoading)
        return (
            <div className="flex h-full flex-col">
                <InboxLayoutLoader />
            </div>
        )

    return (
        <>
            <PageHead title={pageTitle} />
            <div className="relative flex h-full overflow-hidden">
                <div className="flex-shrink-0 w-[340px] h-full border-r border-custom-border-300">
                    <InboxSidebarRoot
                        workspaceSlug={workspaceSlug.toString()}
                        projectId={projectId.toString()}
                        inboxId={inboxId.toString()}
                    />
                </div>
                <div className="w-full">
                    <InboxContentRoot
                        workspaceSlug={workspaceSlug.toString()}
                        projectId={projectId.toString()}
                        inboxId={inboxId.toString()}
                        inboxIssueId={inboxIssueId?.toString() || undefined}
                    />
                </div>
            </div>
        </>
    )
})

ProjectInboxPage.getWrapper = function getWrapper(page: ReactElement) {
    return (
        <AppLayout header={<ProjectInboxHeader />} withProjectWrapper>
            {page}
        </AppLayout>
    )
}

export default ProjectInboxPage
