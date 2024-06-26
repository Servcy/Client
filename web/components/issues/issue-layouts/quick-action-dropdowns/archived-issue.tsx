import { useParams } from "next/navigation"

import { useState } from "react"

import { ArchiveRestoreIcon, ExternalLink, Link, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

import { DeleteIssueModal } from "@components/issues"

import { useEventTracker, useIssues, useUser } from "@hooks/store"

import { ERoles } from "@constants/iam"
import { EIssuesStoreType } from "@constants/issue"

import { copyUrlToClipboard } from "@helpers/string.helper"

import { CustomMenu } from "@servcy/ui"

import { IQuickActionProps } from "../list/list-view-types"

export const ArchivedIssueQuickActions: React.FC<IQuickActionProps> = (props) => {
    const { issue, handleDelete, handleRestore, customActionButton, portalElement, readOnly = false } = props
    // states
    const [deleteIssueModal, setDeleteIssueModal] = useState(false)
    const { workspaceSlug } = useParams()
    // store hooks
    const {
        membership: { currentProjectRole },
    } = useUser()
    const { setTrackElement } = useEventTracker()
    const { issuesFilter } = useIssues(EIssuesStoreType.ARCHIVED)
    // derived values
    const activeLayout = `${issuesFilter.issueFilters?.displayFilters?.layout} layout`
    // auth
    const isEditingAllowed = currentProjectRole !== undefined && currentProjectRole >= ERoles.MEMBER && !readOnly
    const isRestoringAllowed = handleRestore && isEditingAllowed

    const issueLink = `${workspaceSlug}/projects/${issue.project_id}/archives/${issue.id}`

    const handleOpenInNewTab = () => window.open(`/${issueLink}`, "_blank", "noopener noreferrer")
    const handleCopyIssueLink = () => copyUrlToClipboard(issueLink).then(() => toast.success("Copied to clipboard"))

    return (
        <>
            <DeleteIssueModal
                data={issue}
                isOpen={deleteIssueModal}
                handleClose={() => setDeleteIssueModal(false)}
                onSubmit={handleDelete}
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
                {isRestoringAllowed && (
                    <CustomMenu.MenuItem onClick={handleRestore}>
                        <div className="flex items-center gap-2">
                            <ArchiveRestoreIcon className="h-3 w-3" />
                            Restore
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
                            setDeleteIssueModal(true)
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <Trash2 className="h-3 w-3" />
                            Delete issue
                        </div>
                    </CustomMenu.MenuItem>
                )}
            </CustomMenu>
        </>
    )
}
