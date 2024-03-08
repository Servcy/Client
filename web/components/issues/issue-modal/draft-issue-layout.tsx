import { useParams, usePathname } from "next/navigation"

import React, { useState } from "react"

import { observer } from "mobx-react-lite"
import toast from "react-hot-toast"

import { ConfirmIssueDiscard } from "@components/issues"
import { IssueFormRoot } from "@components/issues/issue-modal/form"

import { useEventTracker } from "@hooks/store"

import { IssueDraftService } from "@services/issue"

import type { TIssue } from "@servcy/types"

export interface DraftIssueProps {
    changesMade: Partial<TIssue> | null
    data?: Partial<TIssue>
    isCreateMoreToggleEnabled: boolean
    onCreateMoreToggleChange: (value: boolean) => void
    onChange: (formData: Partial<TIssue> | null) => void
    onClose: (saveDraftIssueInLocalStorage?: boolean) => void
    onSubmit: (formData: Partial<TIssue>) => Promise<void>
    projectId: string
    isDraft: boolean
}

const issueDraftService = new IssueDraftService()

export const DraftIssueLayout: React.FC<DraftIssueProps> = observer((props) => {
    const {
        changesMade,
        data,
        onChange,
        onClose,
        onSubmit,
        projectId,
        isCreateMoreToggleEnabled,
        onCreateMoreToggleChange,
        isDraft,
    } = props
    // states
    const [issueDiscardModal, setIssueDiscardModal] = useState(false)
    // router
    const pathname = usePathname()
    const { workspaceSlug } = useParams()

    // store hooks
    const { captureIssueEvent } = useEventTracker()

    const handleClose = () => {
        if (changesMade) setIssueDiscardModal(true)
        else onClose(false)
    }

    const handleCreateDraftIssue = async () => {
        if (!changesMade || !workspaceSlug || !projectId) return

        const payload = { ...changesMade }

        await issueDraftService
            .createDraftIssue(workspaceSlug.toString(), projectId.toString(), payload)
            .then((res) => {
                toast.success("Draft Issue created successfully.")
                captureIssueEvent({
                    eventName: "Draft issue created",
                    payload: { ...res, state: "SUCCESS" },
                    path: pathname,
                })
                onChange(null)
                setIssueDiscardModal(false)
                onClose(false)
            })
            .catch(() => {
                toast.error("Issue could not be created. Please try again.")
                captureIssueEvent({
                    eventName: "Draft issue created",
                    payload: { ...payload, state: "FAILED" },
                    path: pathname,
                })
            })
    }

    return (
        <>
            <ConfirmIssueDiscard
                isOpen={issueDiscardModal}
                handleClose={() => setIssueDiscardModal(false)}
                onConfirm={handleCreateDraftIssue}
                onDiscard={() => {
                    onChange(null)
                    setIssueDiscardModal(false)
                    onClose(false)
                }}
            />
            <IssueFormRoot
                isCreateMoreToggleEnabled={isCreateMoreToggleEnabled}
                onCreateMoreToggleChange={onCreateMoreToggleChange}
                data={data}
                onChange={onChange}
                onClose={handleClose}
                onSubmit={onSubmit}
                projectId={projectId}
                isDraft={isDraft}
            />
        </>
    )
})
