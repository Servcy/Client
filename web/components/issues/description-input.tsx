import { FC, useEffect, useState } from "react"

// store hooks
import { useMention, useWorkspace } from "@hooks/store"
import useDebounce from "@hooks/use-debounce"

import { FileService } from "@services/document.service"

import { RichReadOnlyEditor, RichTextEditor } from "@servcy/rich-text-editor"
import { Loader } from "@servcy/ui"

import { TIssueOperations } from "./issue-detail"

const fileService = new FileService()

export type IssueDescriptionInputProps = {
    workspaceSlug: string
    projectId: string
    issueId: string
    value: string | undefined
    initialValue: string | undefined
    disabled?: boolean
    issueOperations: TIssueOperations
    setIsSubmitting: (value: "submitting" | "submitted" | "saved") => void
}

export const IssueDescriptionInput: FC<IssueDescriptionInputProps> = (props) => {
    const { workspaceSlug, projectId, issueId, value, initialValue, disabled, issueOperations, setIsSubmitting } = props
    // states
    const [descriptionHTML, setDescriptionHTML] = useState(value)
    // store hooks
    const { mentionHighlights, mentionSuggestions } = useMention()
    const { getWorkspaceBySlug } = useWorkspace()

    const debouncedValue = useDebounce(descriptionHTML, 1500)
    // computed values
    const workspaceId = getWorkspaceBySlug(workspaceSlug)?.id

    useEffect(() => {
        setDescriptionHTML(value)
    }, [value])

    useEffect(() => {
        if (debouncedValue && debouncedValue !== value) {
            issueOperations
                .update(workspaceSlug, projectId, issueId, { description_html: debouncedValue }, false)
                .finally(() => {
                    setIsSubmitting("submitted")
                })
        }
        // DO NOT Add more dependencies here. It will cause multiple requests to be sent.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue])

    if (!descriptionHTML) {
        return (
            <Loader>
                <Loader.Item height="150px" />
            </Loader>
        )
    }

    if (disabled) {
        return (
            <RichReadOnlyEditor
                value={descriptionHTML}
                customClassName="!p-0 !pt-2 text-custom-text-200"
                noBorder={disabled}
                mentionHighlights={mentionHighlights}
            />
        )
    }

    return (
        <RichTextEditor
            cancelUploadImage={fileService.cancelUpload}
            uploadFile={fileService.getUploadFileFunction(workspaceId)}
            deleteFile={fileService.getDeleteImageFunction()}
            restoreFile={fileService.getRestoreImageFunction()}
            value={descriptionHTML}
            initialValue={initialValue}
            dragDropEnabled
            customClassName="min-h-[150px] shadow-sm"
            onChange={(_: Object, description_html: string) => {
                setIsSubmitting("submitting")
                setDescriptionHTML(description_html === "" ? "<p></p>" : description_html)
            }}
            mentionSuggestions={mentionSuggestions}
            mentionHighlights={mentionHighlights}
        />
    )
}
