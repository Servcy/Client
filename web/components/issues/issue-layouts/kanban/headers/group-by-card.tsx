import { useParams, usePathname } from "next/navigation"

import React, { FC } from "react"

// lucide icons
import { Circle, Maximize2, Minimize2, Plus } from "lucide-react"
// mobx
import { observer } from "mobx-react-lite"
import toast from "react-hot-toast"

import { ExistingIssuesListModal } from "@components/core"
import { CreateUpdateIssueModal } from "@components/issues"

import { useEventTracker } from "@hooks/store"

import { TCreateModalStoreTypes } from "@constants/issue"

import { ISearchIssueResponse, TIssue, TIssueKanbanFilters } from "@servcy/types"
import { CustomMenu } from "@servcy/ui"

interface IHeaderGroupByCard {
    sub_group_by: string | null
    group_by: string | null
    column_id: string
    icon?: React.ReactNode
    title: string
    count: number
    kanbanFilters: TIssueKanbanFilters
    handleKanbanFilters: any
    issuePayload: Partial<TIssue>
    disableIssueCreation?: boolean
    storeType?: TCreateModalStoreTypes
    addIssuesToView?: (issueIds: string[]) => Promise<TIssue>
}

export const HeaderGroupByCard: FC<IHeaderGroupByCard> = observer((props) => {
    const {
        sub_group_by,
        column_id,
        icon,
        title,
        count,
        kanbanFilters,
        handleKanbanFilters,
        issuePayload,
        disableIssueCreation,
        storeType,
        addIssuesToView,
    } = props
    const verticalAlignPosition = sub_group_by ? false : kanbanFilters?.group_by.includes(column_id)
    // states
    const [isOpen, setIsOpen] = React.useState(false)
    const [openExistingIssueListModal, setOpenExistingIssueListModal] = React.useState(false)

    const { setTrackElement } = useEventTracker()
    const pathname = usePathname()
    const { workspaceSlug, projectId, moduleId, cycleId } = useParams()

    const isDraftIssue = pathname.includes("draft-issue")

    const renderExistingIssueModal = moduleId || cycleId
    const ExistingIssuesListModalPayload = moduleId ? { module: moduleId.toString() } : { cycle: true }

    const handleAddIssuesToView = async (data: ISearchIssueResponse[]) => {
        if (!workspaceSlug || !projectId) return

        const issues = data.map((i) => i.id)

        try {
            addIssuesToView && addIssuesToView(issues)
        } catch (error) {
            toast.error("Please try again later")
        }
    }

    return (
        <>
            <CreateUpdateIssueModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                data={issuePayload}
                storeType={storeType}
                isDraft={isDraftIssue}
            />

            {renderExistingIssueModal && (
                <ExistingIssuesListModal
                    workspaceSlug={workspaceSlug?.toString()}
                    projectId={projectId?.toString()}
                    isOpen={openExistingIssueListModal}
                    handleClose={() => setOpenExistingIssueListModal(false)}
                    searchParams={ExistingIssuesListModalPayload}
                    handleOnSubmit={handleAddIssuesToView}
                />
            )}
            <div
                className={`relative flex flex-shrink-0 gap-2 p-1.5 ${
                    verticalAlignPosition ? `w-[44px] flex-col items-center` : `w-full flex-row items-center`
                }`}
            >
                <div className="flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center overflow-hidden rounded-sm">
                    {icon ? icon : <Circle width={14} strokeWidth={2} />}
                </div>

                <div
                    className={`relative overflow-hidden flex items-center gap-1 ${
                        verticalAlignPosition ? `flex-col` : `w-full flex-row`
                    }`}
                >
                    <div
                        className={`inline-block truncate line-clamp-1 font-medium text-custom-text-100 overflow-hidden ${
                            verticalAlignPosition ? `vertical-lr max-h-[400px]` : ``
                        }`}
                    >
                        {title}
                    </div>
                    <div
                        className={`flex-shrink-0 text-sm font-medium text-custom-text-300 ${verticalAlignPosition ? `` : `pl-2`}`}
                    >
                        {count || 0}
                    </div>
                </div>

                {sub_group_by === null && (
                    <div
                        className="flex h-[20px] w-[20px] flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm transition-all hover:bg-custom-background-80"
                        onClick={() => handleKanbanFilters("group_by", column_id)}
                    >
                        {verticalAlignPosition ? (
                            <Maximize2 width={14} strokeWidth={2} />
                        ) : (
                            <Minimize2 width={14} strokeWidth={2} />
                        )}
                    </div>
                )}

                {!disableIssueCreation &&
                    (renderExistingIssueModal ? (
                        <CustomMenu
                            customButton={
                                <span className="flex h-[20px] w-[20px] flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm transition-all hover:bg-custom-background-80">
                                    <Plus height={14} width={14} strokeWidth={2} />
                                </span>
                            }
                            placement="bottom-end"
                        >
                            <CustomMenu.MenuItem
                                onClick={() => {
                                    setTrackElement("Kanban layout")
                                    setIsOpen(true)
                                }}
                            >
                                <span className="flex items-center justify-start gap-2">Create issue</span>
                            </CustomMenu.MenuItem>
                            <CustomMenu.MenuItem
                                onClick={() => {
                                    setTrackElement("Kanban layout")
                                    setOpenExistingIssueListModal(true)
                                }}
                            >
                                <span className="flex items-center justify-start gap-2">Add an existing issue</span>
                            </CustomMenu.MenuItem>
                        </CustomMenu>
                    ) : (
                        <div
                            className="flex h-[20px] w-[20px] flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm transition-all hover:bg-custom-background-80"
                            onClick={() => {
                                setTrackElement("Kanban layout")
                                setIsOpen(true)
                            }}
                        >
                            <Plus width={14} strokeWidth={2} />
                        </div>
                    ))}
            </div>
        </>
    )
})
