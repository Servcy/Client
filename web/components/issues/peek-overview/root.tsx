import { usePathname } from "next/navigation"

import { FC, useEffect, useMemo, useState } from "react"

import { observer } from "mobx-react-lite"
import toast from "react-hot-toast"

import { IssueView } from "@components/issues"

import { useEventTracker, useIssueDetail, useIssues, useUser } from "@hooks/store"

import { ISSUE_ARCHIVED, ISSUE_DELETED, ISSUE_RESTORED, ISSUE_UPDATED } from "@constants/event-tracker"
import { ERoles } from "@constants/iam"
import { EIssuesStoreType } from "@constants/issue"

import { TIssue } from "@servcy/types"

interface IIssuePeekOverview {
    is_archived?: boolean
    is_draft?: boolean
}

export type TIssuePeekOperations = {
    fetch: (workspaceSlug: string, projectId: string, issueId: string) => Promise<void>
    update: (
        workspaceSlug: string,
        projectId: string,
        issueId: string,
        data: Partial<TIssue>,
        showToast?: boolean
    ) => Promise<void>
    remove: (workspaceSlug: string, projectId: string, issueId: string) => Promise<void>
    archive: (workspaceSlug: string, projectId: string, issueId: string) => Promise<void>
    restore: (workspaceSlug: string, projectId: string, issueId: string) => Promise<void>
    addIssueToCycle: (workspaceSlug: string, projectId: string, cycleId: string, issueIds: string[]) => Promise<void>
    removeIssueFromCycle: (workspaceSlug: string, projectId: string, cycleId: string, issueId: string) => Promise<void>
    addModulesToIssue?: (
        workspaceSlug: string,
        projectId: string,
        issueId: string,
        moduleIds: string[]
    ) => Promise<void>
    removeIssueFromModule?: (
        workspaceSlug: string,
        projectId: string,
        moduleId: string,
        issueId: string
    ) => Promise<void>
    removeModulesFromIssue?: (
        workspaceSlug: string,
        projectId: string,
        issueId: string,
        moduleIds: string[]
    ) => Promise<void>
}

export const IssuePeekOverview: FC<IIssuePeekOverview> = observer((props) => {
    const { is_archived = false, is_draft = false } = props

    const pathname = usePathname()
    const {
        membership: { currentWorkspaceAllProjectsRole },
    } = useUser()
    const {
        issues: { restoreIssue },
    } = useIssues(EIssuesStoreType.ARCHIVED)
    const {
        peekIssue,
        updateIssue,
        removeIssue,
        archiveIssue,
        issue: { getIssueById, fetchIssue },
    } = useIssueDetail()
    const { addIssueToCycle, removeIssueFromCycle, addModulesToIssue, removeIssueFromModule, removeModulesFromIssue } =
        useIssueDetail()
    const { captureIssueEvent } = useEventTracker()
    // state
    const [loader, setLoader] = useState(false)

    const issueOperations: TIssuePeekOperations = useMemo(
        () => ({
            fetch: async (workspaceSlug: string, projectId: string, issueId: string) => {
                try {
                    await fetchIssue(
                        workspaceSlug,
                        projectId,
                        issueId,
                        is_archived ? "ARCHIVED" : is_draft ? "DRAFT" : "DEFAULT"
                    )
                } catch {}
            },
            update: async (
                workspaceSlug: string,
                projectId: string,
                issueId: string,
                data: Partial<TIssue>,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                showToast: boolean = true
            ) => {
                try {
                    await updateIssue(workspaceSlug, projectId, issueId, data)
                    captureIssueEvent({
                        eventName: ISSUE_UPDATED,
                        payload: { ...data, issueId, state: "SUCCESS", element: "Issue peek-overview" },
                        updates: {
                            changed_property: Object.keys(data).join(","),
                            change_details: Object.values(data).join(","),
                        },
                        path: pathname,
                    })
                } catch (error) {
                    captureIssueEvent({
                        eventName: ISSUE_UPDATED,
                        payload: { state: "FAILED", element: "Issue peek-overview" },
                        path: pathname,
                    })
                    toast.error("Please try again later")
                }
            },
            remove: async (workspaceSlug: string, projectId: string, issueId: string) => {
                try {
                    removeIssue(workspaceSlug, projectId, issueId)
                    captureIssueEvent({
                        eventName: ISSUE_DELETED,
                        payload: { id: issueId, state: "SUCCESS", element: "Issue peek-overview" },
                        path: pathname,
                    })
                } catch (error) {
                    toast.error("Please try again later")
                    captureIssueEvent({
                        eventName: ISSUE_DELETED,
                        payload: { id: issueId, state: "FAILED", element: "Issue peek-overview" },
                        path: pathname,
                    })
                }
            },
            archive: async (workspaceSlug: string, projectId: string, issueId: string) => {
                try {
                    await archiveIssue(workspaceSlug, projectId, issueId)
                    captureIssueEvent({
                        eventName: ISSUE_ARCHIVED,
                        payload: { id: issueId, state: "SUCCESS", element: "Issue peek-overview" },
                        path: pathname,
                    })
                } catch (error) {
                    toast.error("Please try again later")
                    captureIssueEvent({
                        eventName: ISSUE_ARCHIVED,
                        payload: { id: issueId, state: "FAILED", element: "Issue peek-overview" },
                        path: pathname,
                    })
                }
            },
            restore: async (workspaceSlug: string, projectId: string, issueId: string) => {
                try {
                    await restoreIssue(workspaceSlug, projectId, issueId)
                    captureIssueEvent({
                        eventName: ISSUE_RESTORED,
                        payload: { id: issueId, state: "SUCCESS", element: "Issue peek-overview" },
                        path: pathname,
                    })
                } catch (error) {
                    toast.error("Please try again later")
                    captureIssueEvent({
                        eventName: ISSUE_RESTORED,
                        payload: { id: issueId, state: "FAILED", element: "Issue peek-overview" },
                        path: pathname,
                    })
                }
            },
            addIssueToCycle: async (workspaceSlug: string, projectId: string, cycleId: string, issueIds: string[]) => {
                try {
                    await addIssueToCycle(workspaceSlug, projectId, cycleId, issueIds)
                    captureIssueEvent({
                        eventName: ISSUE_UPDATED,
                        payload: { ...issueIds, state: "SUCCESS", element: "Issue peek-overview" },
                        updates: {
                            changed_property: "cycle_id",
                            change_details: cycleId,
                        },
                        path: pathname,
                    })
                } catch (error) {
                    captureIssueEvent({
                        eventName: ISSUE_UPDATED,
                        payload: { state: "FAILED", element: "Issue peek-overview" },
                        updates: {
                            changed_property: "cycle_id",
                            change_details: cycleId,
                        },
                        path: pathname,
                    })
                    toast.error("Please try again later")
                }
            },
            removeIssueFromCycle: async (
                workspaceSlug: string,
                projectId: string,
                cycleId: string,
                issueId: string
            ) => {
                try {
                    const response = await removeIssueFromCycle(workspaceSlug, projectId, cycleId, issueId)
                    captureIssueEvent({
                        eventName: ISSUE_UPDATED,
                        payload: { ...response, state: "SUCCESS", element: "Issue peek-overview" },
                        updates: {
                            changed_property: "cycle_id",
                            change_details: "",
                        },
                        path: pathname,
                    })
                } catch (error) {
                    toast.error("Please try again later")
                    captureIssueEvent({
                        eventName: ISSUE_UPDATED,
                        payload: { state: "FAILED", element: "Issue peek-overview" },
                        updates: {
                            changed_property: "cycle_id",
                            change_details: "",
                        },
                        path: pathname,
                    })
                }
            },
            addModulesToIssue: async (
                workspaceSlug: string,
                projectId: string,
                issueId: string,
                moduleIds: string[]
            ) => {
                try {
                    const response = await addModulesToIssue(workspaceSlug, projectId, issueId, moduleIds)
                    captureIssueEvent({
                        eventName: ISSUE_UPDATED,
                        payload: { ...response, state: "SUCCESS", element: "Issue peek-overview" },
                        updates: {
                            changed_property: "module_id",
                            change_details: moduleIds,
                        },
                        path: pathname,
                    })
                } catch (error) {
                    captureIssueEvent({
                        eventName: ISSUE_UPDATED,
                        payload: { id: issueId, state: "FAILED", element: "Issue peek-overview" },
                        updates: {
                            changed_property: "module_id",
                            change_details: moduleIds,
                        },
                        path: pathname,
                    })
                    toast.error("Please try again later")
                }
            },
            removeIssueFromModule: async (
                workspaceSlug: string,
                projectId: string,
                moduleId: string,
                issueId: string
            ) => {
                try {
                    await removeIssueFromModule(workspaceSlug, projectId, moduleId, issueId)
                    captureIssueEvent({
                        eventName: ISSUE_UPDATED,
                        payload: { id: issueId, state: "SUCCESS", element: "Issue peek-overview" },
                        updates: {
                            changed_property: "module_id",
                            change_details: "",
                        },
                        path: pathname,
                    })
                } catch (error) {
                    captureIssueEvent({
                        eventName: ISSUE_UPDATED,
                        payload: { id: issueId, state: "FAILED", element: "Issue peek-overview" },
                        updates: {
                            changed_property: "module_id",
                            change_details: "",
                        },
                        path: pathname,
                    })
                    toast.error("Please try again later")
                }
            },
            removeModulesFromIssue: async (
                workspaceSlug: string,
                projectId: string,
                issueId: string,
                moduleIds: string[]
            ) => {
                try {
                    await removeModulesFromIssue(workspaceSlug, projectId, issueId, moduleIds)
                } catch (error) {
                    toast.error("Please try again later")
                }
            },
        }),
        [
            is_archived,
            is_draft,
            fetchIssue,
            updateIssue,
            removeIssue,
            archiveIssue,
            restoreIssue,
            addIssueToCycle,
            removeIssueFromCycle,
            addModulesToIssue,
            removeIssueFromModule,
            removeModulesFromIssue,
            captureIssueEvent,
            pathname,
        ]
    )

    useEffect(() => {
        if (peekIssue) {
            setLoader(true)
            issueOperations.fetch(peekIssue.workspaceSlug, peekIssue.projectId, peekIssue.issueId).finally(() => {
                setLoader(false)
            })
        }
    }, [peekIssue, issueOperations])

    if (!peekIssue?.workspaceSlug || !peekIssue?.projectId || !peekIssue?.issueId) return <></>

    const issue = getIssueById(peekIssue.issueId) || undefined

    const currentProjectRole = currentWorkspaceAllProjectsRole?.[peekIssue?.projectId]
    // Check if issue is editable, based on user role
    const is_editable = currentProjectRole !== undefined && currentProjectRole >= ERoles.MEMBER
    const isLoading = !issue || loader ? true : false

    return (
        <IssueView
            workspaceSlug={peekIssue.workspaceSlug}
            projectId={peekIssue.projectId}
            issueId={peekIssue.issueId}
            isLoading={isLoading}
            is_archived={is_archived}
            disabled={!is_editable}
            issueOperations={issueOperations}
        />
    )
})
