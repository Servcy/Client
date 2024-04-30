import { usePathname } from "next/navigation"

import { FC, useCallback, useEffect, useMemo, useState } from "react"

import { ChevronRight, Loader, Pencil, Plus } from "lucide-react"
import { observer } from "mobx-react-lite"
import toast from "react-hot-toast"

import { ExistingIssuesListModal } from "@components/core"
import { CreateUpdateIssueModal, DeleteIssueModal } from "@components/issues"

import { useEventTracker, useIssueDetail } from "@hooks/store"

import { cn } from "@helpers/common.helper"
import { copyTextToClipboard } from "@helpers/string.helper"

import { IUser, TIssue } from "@servcy/types"
import { CircularProgressIndicator, CustomMenu, LayersIcon } from "@servcy/ui"

import { IssueList } from "./issues-list"

export interface ISubIssuesRoot {
    workspaceSlug: string
    projectId: string
    parentIssueId: string
    currentUser: IUser
    disabled: boolean
}

export type TSubIssueOperations = {
    copyText: (text: string) => void
    fetchSubIssues: (workspaceSlug: string, projectId: string, parentIssueId: string) => Promise<void>
    addSubIssue: (workspaceSlug: string, projectId: string, parentIssueId: string, issueIds: string[]) => Promise<void>
    updateSubIssue: (
        workspaceSlug: string,
        projectId: string,
        parentIssueId: string,
        issueId: string,
        issueData: Partial<TIssue>,
        oldIssue?: Partial<TIssue>,
        fromModal?: boolean
    ) => Promise<void>
    removeSubIssue: (workspaceSlug: string, projectId: string, parentIssueId: string, issueId: string) => Promise<void>
    deleteSubIssue: (workspaceSlug: string, projectId: string, parentIssueId: string, issueId: string) => Promise<void>
}

export const SubIssuesRoot: FC<ISubIssuesRoot> = observer((props) => {
    const { workspaceSlug, projectId, parentIssueId, disabled = false } = props
    const pathname = usePathname()
    const {
        issue: { getIssueById },
        subIssues: { subIssuesByIssueId, stateDistributionByIssueId, subIssueHelpersByIssueId, setSubIssueHelpers },
        fetchSubIssues,
        isCreateIssueModalOpen,
        toggleCreateIssueModal,
        isSubIssuesModalOpen,
        toggleSubIssuesModal,
        createSubIssues,
        updateSubIssue,
        removeSubIssue,
        deleteSubIssue,
    } = useIssueDetail()
    const { setTrackElement, captureIssueEvent } = useEventTracker()
    // state

    type TIssueCrudState = { toggle: boolean; parentIssueId: string | undefined; issue: TIssue | undefined }
    const [issueCrudState, setIssueCrudState] = useState<{
        create: TIssueCrudState
        existing: TIssueCrudState
        update: TIssueCrudState
        delete: TIssueCrudState
    }>({
        create: {
            toggle: false,
            parentIssueId: undefined,
            issue: undefined,
        },
        existing: {
            toggle: false,
            parentIssueId: undefined,
            issue: undefined,
        },
        update: {
            toggle: false,
            parentIssueId: undefined,
            issue: undefined,
        },
        delete: {
            toggle: false,
            parentIssueId: undefined,
            issue: undefined,
        },
    })

    const scrollToSubIssuesView = useCallback(() => {
        if (pathname.split("#")[1] === "sub-issues") {
            setTimeout(() => {
                const subIssueDiv = document.getElementById(`sub-issues`)
                if (subIssueDiv)
                    subIssueDiv.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    })
            }, 200)
        }
    }, [pathname])

    useEffect(() => {
        if (pathname) {
            scrollToSubIssuesView()
        }
    }, [pathname, scrollToSubIssuesView])

    const handleIssueCrudState = (
        key: "create" | "existing" | "update" | "delete",
        _parentIssueId: string | null,
        issue: TIssue | null = null
    ) => {
        setIssueCrudState({
            ...issueCrudState,
            [key]: {
                toggle: !issueCrudState[key].toggle,
                parentIssueId: _parentIssueId,
                issue: issue,
            },
        })
    }

    const subIssueOperations: TSubIssueOperations = useMemo(
        () => ({
            copyText: (text: string) => {
                const originURL = typeof window !== "undefined" && window.location.origin ? window.location.origin : ""
                copyTextToClipboard(`${originURL}/${text}`).then(() => {
                    toast.success("Copied to clipboard")
                })
            },
            fetchSubIssues: async (workspaceSlug: string, projectId: string, parentIssueId: string) => {
                try {
                    await fetchSubIssues(workspaceSlug, projectId, parentIssueId)
                } catch (error) {
                    toast.error("Please try again later")
                }
            },
            addSubIssue: async (
                workspaceSlug: string,
                projectId: string,
                parentIssueId: string,
                issueIds: string[]
            ) => {
                try {
                    await createSubIssues(workspaceSlug, projectId, parentIssueId, issueIds)
                } catch (error) {
                    toast.error("Please try again later")
                }
            },
            updateSubIssue: async (
                workspaceSlug: string,
                projectId: string,
                parentIssueId: string,
                issueId: string,
                issueData: Partial<TIssue>,
                oldIssue: Partial<TIssue> = {},
                fromModal: boolean = false
            ) => {
                try {
                    setSubIssueHelpers(parentIssueId, "issue_loader", issueId)
                    await updateSubIssue(
                        workspaceSlug,
                        projectId,
                        parentIssueId,
                        issueId,
                        issueData,
                        oldIssue,
                        fromModal
                    )
                    captureIssueEvent({
                        eventName: "Sub-issue updated",
                        payload: { ...oldIssue, ...issueData, state: "SUCCESS", element: "Issue detail page" },
                        updates: {
                            changed_property: Object.keys(issueData).join(","),
                            change_details: Object.values(issueData).join(","),
                        },
                        path: pathname,
                    })
                    setSubIssueHelpers(parentIssueId, "issue_loader", issueId)
                } catch (error) {
                    captureIssueEvent({
                        eventName: "Sub-issue updated",
                        payload: { ...oldIssue, ...issueData, state: "FAILED", element: "Issue detail page" },
                        updates: {
                            changed_property: Object.keys(issueData).join(","),
                            change_details: Object.values(issueData).join(","),
                        },
                        path: pathname,
                    })
                    toast.error("Please try again later")
                }
            },
            removeSubIssue: async (
                workspaceSlug: string,
                projectId: string,
                parentIssueId: string,
                issueId: string
            ) => {
                try {
                    setSubIssueHelpers(parentIssueId, "issue_loader", issueId)
                    await removeSubIssue(workspaceSlug, projectId, parentIssueId, issueId)
                    captureIssueEvent({
                        eventName: "Sub-issue removed",
                        payload: { id: issueId, state: "SUCCESS", element: "Issue detail page" },
                        updates: {
                            changed_property: "parent_id",
                            change_details: parentIssueId,
                        },
                        path: pathname,
                    })
                    setSubIssueHelpers(parentIssueId, "issue_loader", issueId)
                } catch (error) {
                    captureIssueEvent({
                        eventName: "Sub-issue removed",
                        payload: { id: issueId, state: "FAILED", element: "Issue detail page" },
                        updates: {
                            changed_property: "parent_id",
                            change_details: parentIssueId,
                        },
                        path: pathname,
                    })
                    toast.error("Please try again later")
                }
            },
            deleteSubIssue: async (
                workspaceSlug: string,
                projectId: string,
                parentIssueId: string,
                issueId: string
            ) => {
                try {
                    setSubIssueHelpers(parentIssueId, "issue_loader", issueId)
                    await deleteSubIssue(workspaceSlug, projectId, parentIssueId, issueId)
                    toast.error("Please try again later")
                    captureIssueEvent({
                        eventName: "Sub-issue deleted",
                        payload: { id: issueId, state: "SUCCESS", element: "Issue detail page" },
                        path: pathname,
                    })
                    setSubIssueHelpers(parentIssueId, "issue_loader", issueId)
                } catch (error) {
                    captureIssueEvent({
                        eventName: "Sub-issue removed",
                        payload: { id: issueId, state: "FAILED", element: "Issue detail page" },
                        path: pathname,
                    })
                    toast.error("Please try again later")
                }
            },
        }),
        [
            fetchSubIssues,
            createSubIssues,
            setSubIssueHelpers,
            updateSubIssue,
            captureIssueEvent,
            pathname,
            removeSubIssue,
            deleteSubIssue,
        ]
    )

    const issue = getIssueById(parentIssueId)
    const subIssuesDistribution = stateDistributionByIssueId(parentIssueId)
    const subIssues = subIssuesByIssueId(parentIssueId)
    const subIssueHelpers = subIssueHelpersByIssueId(`${parentIssueId}_root`)

    const handleFetchSubIssues = useCallback(async () => {
        if (!subIssueHelpers.issue_visibility.includes(parentIssueId)) {
            setSubIssueHelpers(`${parentIssueId}_root`, "preview_loader", parentIssueId)
            await subIssueOperations.fetchSubIssues(workspaceSlug, projectId, parentIssueId)
            setSubIssueHelpers(`${parentIssueId}_root`, "preview_loader", parentIssueId)
        }
        setSubIssueHelpers(`${parentIssueId}_root`, "issue_visibility", parentIssueId)
    }, [
        parentIssueId,
        projectId,
        setSubIssueHelpers,
        subIssueHelpers.issue_visibility,
        subIssueOperations,
        workspaceSlug,
    ])

    useEffect(() => {
        handleFetchSubIssues()

        return () => {
            handleFetchSubIssues()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentIssueId])

    if (!issue) return <></>
    return (
        <div id="sub-issues" className="h-full w-full space-y-2">
            {!subIssues ? (
                <div className="py-3 text-center text-sm  font-medium text-custom-text-300">Loading...</div>
            ) : (
                <>
                    {subIssues && subIssues?.length > 0 ? (
                        <>
                            <div className="relative flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 rounded py-1 px-2 transition-all hover:bg-custom-background-80 font-medium"
                                        onClick={handleFetchSubIssues}
                                    >
                                        <div className="flex flex-shrink-0 items-center justify-center">
                                            {subIssueHelpers.preview_loader.includes(parentIssueId) ? (
                                                <Loader strokeWidth={2} className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <ChevronRight
                                                    className={cn("h-3 w-3 transition-all", {
                                                        "rotate-90":
                                                            subIssueHelpers.issue_visibility.includes(parentIssueId),
                                                    })}
                                                    strokeWidth={2}
                                                />
                                            )}
                                        </div>
                                        <div>Sub-issues</div>
                                    </button>
                                    <div className="flex items-center gap-2 text-custom-text-300">
                                        <CircularProgressIndicator
                                            size={16}
                                            percentage={
                                                subIssuesDistribution?.completed?.length && subIssues.length
                                                    ? (subIssuesDistribution?.completed?.length / subIssues.length) *
                                                      100
                                                    : 0
                                            }
                                            strokeWidth={3}
                                        />
                                        <span>
                                            {subIssuesDistribution?.completed?.length ?? 0}/{subIssues.length} Done
                                        </span>
                                    </div>
                                </div>

                                {!disabled && (
                                    <CustomMenu
                                        label={
                                            <>
                                                <Plus className="h-3 w-3" />
                                                Add sub-issue
                                            </>
                                        }
                                        buttonClassName="whitespace-nowrap"
                                        placement="bottom-end"
                                        noBorder
                                        noChevron
                                    >
                                        <CustomMenu.MenuItem
                                            onClick={() => {
                                                setTrackElement("Issue detail nested sub-issue")
                                                handleIssueCrudState("create", parentIssueId, null)
                                                toggleCreateIssueModal(true)
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Pencil className="h-3 w-3" />
                                                <span>Create new</span>
                                            </div>
                                        </CustomMenu.MenuItem>
                                        <CustomMenu.MenuItem
                                            onClick={() => {
                                                setTrackElement("Issue detail nested sub-issue")
                                                handleIssueCrudState("existing", parentIssueId, null)
                                                toggleSubIssuesModal(true)
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <LayersIcon className="h-3 w-3" />
                                                <span>Add existing</span>
                                            </div>
                                        </CustomMenu.MenuItem>
                                    </CustomMenu>
                                )}
                            </div>

                            {subIssueHelpers.issue_visibility.includes(parentIssueId) && (
                                <div className="border border-b-0 border-custom-border-100">
                                    <IssueList
                                        workspaceSlug={workspaceSlug}
                                        projectId={projectId}
                                        parentIssueId={parentIssueId}
                                        spacingLeft={10}
                                        disabled={!disabled}
                                        handleIssueCrudState={handleIssueCrudState}
                                        subIssueOperations={subIssueOperations}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        !disabled && (
                            <div className="flex items-center justify-between">
                                <div className="text-xs italic text-custom-text-300">No sub-issues yet</div>
                                <CustomMenu
                                    label={
                                        <>
                                            <Plus className="h-3 w-3" />
                                            Add sub-issue
                                        </>
                                    }
                                    buttonClassName="whitespace-nowrap"
                                    placement="bottom-end"
                                    noBorder
                                    noChevron
                                >
                                    <CustomMenu.MenuItem
                                        onClick={() => {
                                            setTrackElement("Issue detail nested sub-issue")
                                            handleIssueCrudState("create", parentIssueId, null)
                                            toggleCreateIssueModal(true)
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Pencil className="h-3 w-3" />
                                            <span>Create new</span>
                                        </div>
                                    </CustomMenu.MenuItem>
                                    <CustomMenu.MenuItem
                                        onClick={() => {
                                            setTrackElement("Issue detail nested sub-issue")
                                            handleIssueCrudState("existing", parentIssueId, null)
                                            toggleSubIssuesModal(true)
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <LayersIcon className="h-3 w-3" />
                                            <span>Add existing</span>
                                        </div>
                                    </CustomMenu.MenuItem>
                                </CustomMenu>
                            </div>
                        )
                    )}

                    {/* issue create, add from existing , update and delete modals */}
                    {issueCrudState?.create?.toggle &&
                        issueCrudState?.create?.parentIssueId &&
                        isCreateIssueModalOpen && (
                            <CreateUpdateIssueModal
                                isOpen={issueCrudState?.create?.toggle}
                                data={{
                                    parent_id: issueCrudState?.create?.parentIssueId,
                                }}
                                onClose={() => {
                                    handleIssueCrudState("create", null, null)
                                    toggleCreateIssueModal(false)
                                }}
                                onSubmit={async (_issue: TIssue) => {
                                    await subIssueOperations.addSubIssue(workspaceSlug, projectId, parentIssueId, [
                                        _issue.id,
                                    ])
                                }}
                            />
                        )}

                    {issueCrudState?.existing?.toggle &&
                        issueCrudState?.existing?.parentIssueId &&
                        isSubIssuesModalOpen && (
                            <ExistingIssuesListModal
                                workspaceSlug={workspaceSlug}
                                projectId={projectId}
                                isOpen={issueCrudState?.existing?.toggle}
                                handleClose={() => {
                                    handleIssueCrudState("existing", null, null)
                                    toggleSubIssuesModal(false)
                                }}
                                searchParams={{ sub_issue: true, issue_id: issueCrudState?.existing?.parentIssueId }}
                                handleOnSubmit={(_issue) =>
                                    subIssueOperations.addSubIssue(
                                        workspaceSlug,
                                        projectId,
                                        parentIssueId,
                                        _issue.map((issue) => issue.id)
                                    )
                                }
                                workspaceLevelToggle
                            />
                        )}

                    {issueCrudState?.update?.toggle && issueCrudState?.update?.issue && (
                        <>
                            <CreateUpdateIssueModal
                                isOpen={issueCrudState?.update?.toggle}
                                onClose={() => {
                                    handleIssueCrudState("update", null, null)
                                }}
                                data={issueCrudState?.update?.issue ?? undefined}
                                onSubmit={async (_issue: TIssue) => {
                                    await subIssueOperations.updateSubIssue(
                                        workspaceSlug,
                                        projectId,
                                        parentIssueId,
                                        _issue.id,
                                        _issue,
                                        issueCrudState?.update?.issue,
                                        true
                                    )
                                }}
                            />
                        </>
                    )}

                    {issueCrudState?.delete?.toggle &&
                        issueCrudState?.delete?.issue &&
                        issueCrudState.delete.parentIssueId &&
                        issueCrudState.delete.issue.id && (
                            <DeleteIssueModal
                                isOpen={issueCrudState?.delete?.toggle}
                                handleClose={() => {
                                    handleIssueCrudState("delete", null, null)
                                }}
                                data={issueCrudState?.delete?.issue as TIssue}
                                onSubmit={async () =>
                                    await subIssueOperations.deleteSubIssue(
                                        workspaceSlug,
                                        projectId,
                                        issueCrudState?.delete?.parentIssueId as string,
                                        issueCrudState?.delete?.issue?.id as string
                                    )
                                }
                            />
                        )}
                </>
            )}
        </div>
    )
})
