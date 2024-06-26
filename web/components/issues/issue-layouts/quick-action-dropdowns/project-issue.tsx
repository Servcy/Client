import { useParams, usePathname } from "next/navigation"

import { useState } from "react"

import omit from "lodash/omit"
import { Copy, ExternalLink, Link, Pencil, Trash2 } from "lucide-react"
import { observer } from "mobx-react"
import toast from "react-hot-toast"

import { ArchiveIssueModal, CreateUpdateIssueModal, DeleteIssueModal } from "@components/issues"

import { useEventTracker, useIssues, useProjectState, useUser } from "@hooks/store"

import { ERoles } from "@constants/iam"
import { EIssuesStoreType } from "@constants/issue"
import { STATE_GROUPS } from "@constants/state"

import { copyUrlToClipboard } from "@helpers/string.helper"

import { TIssue } from "@servcy/types"
import { ArchiveIcon, CustomMenu } from "@servcy/ui"

import { IQuickActionProps } from "../list/list-view-types"

export const ProjectIssueQuickActions: React.FC<IQuickActionProps> = observer((props) => {
    const {
        issue,
        handleDelete,
        handleUpdate,
        handleArchive,
        customActionButton,
        portalElement,
        readOnly = false,
    } = props

    const pathname = usePathname()
    const { workspaceSlug } = useParams()
    // states
    const [createUpdateIssueModal, setCreateUpdateIssueModal] = useState(false)
    const [issueToEdit, setIssueToEdit] = useState<TIssue | undefined>(undefined)
    const [deleteIssueModal, setDeleteIssueModal] = useState(false)
    const [archiveIssueModal, setArchiveIssueModal] = useState(false)
    // store hooks
    const {
        membership: { projectRoleById },
    } = useUser()
    const { setTrackElement } = useEventTracker()
    const { issuesFilter } = useIssues(EIssuesStoreType.PROJECT)
    const { getStateById } = useProjectState()
    // derived values
    const activeLayout = `${issuesFilter.issueFilters?.displayFilters?.layout} layout`
    const stateDetails = getStateById(issue.state_id)
    // auth
    const projectRole = projectRoleById(issue.project_id, workspaceSlug.toString())
    const isEditingAllowed = !!projectRole && projectRole >= ERoles.MEMBER && !readOnly
    const isArchivingAllowed = handleArchive && isEditingAllowed
    const isInArchivableGroup =
        !!stateDetails && [STATE_GROUPS.completed.key, STATE_GROUPS.cancelled.key].includes(stateDetails?.group)
    const isDeletingAllowed = isEditingAllowed

    const issueLink = `${workspaceSlug}/projects/${issue.project_id}/issues/${issue.id}`

    const handleOpenInNewTab = () => window.open(`/${issueLink}`, "_blank", "noopener noreferrer")

    const handleCopyIssueLink = () => copyUrlToClipboard(issueLink).then(() => toast.error("Copied to clipboard"))

    const isDraftIssue = pathname?.includes("draft-issues") || false

    const duplicateIssuePayload = omit(
        {
            ...issue,
            name: `${issue.name} (copy)`,
            is_draft: isDraftIssue ? false : issue.is_draft,
        },
        ["id"]
    )

    return (
        <>
            <ArchiveIssueModal
                data={issue}
                isOpen={archiveIssueModal}
                handleClose={() => setArchiveIssueModal(false)}
                onSubmit={handleArchive}
            />
            <DeleteIssueModal
                data={issue}
                isOpen={deleteIssueModal}
                handleClose={() => setDeleteIssueModal(false)}
                onSubmit={handleDelete}
            />
            <CreateUpdateIssueModal
                isOpen={createUpdateIssueModal}
                onClose={() => {
                    setCreateUpdateIssueModal(false)
                    setIssueToEdit(undefined)
                }}
                data={issueToEdit ?? duplicateIssuePayload}
                onSubmit={async (data) => {
                    if (issueToEdit && handleUpdate) await handleUpdate({ ...issueToEdit, ...data })
                }}
                storeType={EIssuesStoreType.PROJECT}
                isDraft={isDraftIssue}
            />
            <CustomMenu
                menuItemsClassName="z-[14]"
                placement="bottom-start"
                customButton={customActionButton}
                portalElement={portalElement}
                closeOnSelect
                maxHeight="lg"
                ellipsis
            >
                {isEditingAllowed && (
                    <CustomMenu.MenuItem
                        onClick={() => {
                            setTrackElement(activeLayout)
                            setIssueToEdit(issue)
                            setCreateUpdateIssueModal(true)
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <Pencil className="h-3 w-3" />
                            Edit
                        </div>
                    </CustomMenu.MenuItem>
                )}
                <CustomMenu.MenuItem onClick={handleOpenInNewTab}>
                    <div className="flex items-center gap-2">
                        <ExternalLink className="h-3 w-3" />
                        Open in new tab
                    </div>
                </CustomMenu.MenuItem>
                <CustomMenu.MenuItem onClick={handleCopyIssueLink}>
                    <div className="flex items-center gap-2">
                        <Link className="h-3 w-3" />
                        Copy link
                    </div>
                </CustomMenu.MenuItem>
                {isEditingAllowed && (
                    <CustomMenu.MenuItem
                        onClick={() => {
                            setTrackElement(activeLayout)
                            setCreateUpdateIssueModal(true)
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <Copy className="h-3 w-3" />
                            Make a copy
                        </div>
                    </CustomMenu.MenuItem>
                )}
                {isArchivingAllowed && (
                    <CustomMenu.MenuItem onClick={() => setArchiveIssueModal(true)} disabled={!isInArchivableGroup}>
                        {isInArchivableGroup ? (
                            <div className="flex items-center gap-2">
                                <ArchiveIcon className="h-3 w-3" />
                                Archive
                            </div>
                        ) : (
                            <div className="flex items-start gap-2">
                                <ArchiveIcon className="h-3 w-3" />
                                <div className="-mt-1">
                                    <p>Archive</p>
                                    <p className="text-xs text-custom-text-400">
                                        Only completed or canceled
                                        <br />
                                        issues can be archived
                                    </p>
                                </div>
                            </div>
                        )}
                    </CustomMenu.MenuItem>
                )}
                {isDeletingAllowed && (
                    <CustomMenu.MenuItem
                        onClick={() => {
                            setTrackElement(activeLayout)
                            setDeleteIssueModal(true)
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <Trash2 className="h-3 w-3" />
                            Delete
                        </div>
                    </CustomMenu.MenuItem>
                )}
            </CustomMenu>
        </>
    )
})
