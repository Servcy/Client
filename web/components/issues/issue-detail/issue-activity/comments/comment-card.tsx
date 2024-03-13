import { FC, useEffect, useRef, useState } from "react"

import { Check, Globe2, Lock, Pencil, Trash2, X } from "lucide-react"
import { useForm } from "react-hook-form"

import { useIssueDetail, useMention, useUser, useWorkspace } from "@hooks/store"

import { FileService } from "@services/document.service"

import { isEmptyHtmlString } from "@helpers/string.helper"

import { LiteReadOnlyEditorWithRef, LiteTextEditorWithRef } from "@servcy/lite-text-editor"
import { TIssueComment } from "@servcy/types"
import { CustomMenu } from "@servcy/ui"

import { IssueCommentReaction } from "../../reactions/issue-comment"
import { TActivityOperations } from "../root"
import { IssueCommentBlock } from "./comment-block"

const fileService = new FileService()

type TIssueCommentCard = {
    workspaceSlug: string
    commentId: string
    activityOperations: TActivityOperations
    ends: "top" | "bottom" | undefined
    showAccessSpecifier?: boolean
}

export const IssueCommentCard: FC<TIssueCommentCard> = (props) => {
    const { workspaceSlug, commentId, activityOperations, ends, showAccessSpecifier = false } = props

    const {
        comment: { getCommentById },
    } = useIssueDetail()
    const { currentUser } = useUser()
    const { mentionHighlights, mentionSuggestions } = useMention()
    // refs
    const editorRef = useRef<any>(null)
    const showEditorRef = useRef<any>(null)
    // state
    const [isEditing, setIsEditing] = useState(false)

    const comment = getCommentById(commentId)
    const workspaceStore = useWorkspace()
    const workspaceId = workspaceStore.getWorkspaceBySlug(comment?.workspace_detail?.slug as string)?.id

    const {
        formState: { isSubmitting },
        handleSubmit,
        setFocus,
        watch,
        setValue,
    } = useForm<Partial<TIssueComment>>({
        defaultValues: { comment_html: comment?.comment_html },
    })

    const onEnter = (formData: Partial<TIssueComment>) => {
        if (isSubmitting || !comment) return
        setIsEditing(false)

        activityOperations.updateComment(comment.id, formData)

        editorRef.current?.setEditorValue(formData.comment_html)
        showEditorRef.current?.setEditorValue(formData.comment_html)
    }

    useEffect(() => {
        isEditing && setFocus("comment_html")
    }, [isEditing, setFocus])

    const isEmpty =
        watch("comment_html") === "" ||
        watch("comment_html")?.trim() === "" ||
        watch("comment_html") === "<p></p>" ||
        isEmptyHtmlString(watch("comment_html") ?? "")

    if (!comment || !currentUser) return <></>
    return (
        <IssueCommentBlock
            commentId={commentId}
            quickActions={
                <>
                    {currentUser?.id === comment.actor && (
                        <CustomMenu ellipsis>
                            <CustomMenu.MenuItem onClick={() => setIsEditing(true)} className="flex items-center gap-1">
                                <Pencil className="h-3 w-3" />
                                Edit comment
                            </CustomMenu.MenuItem>
                            {showAccessSpecifier && (
                                <>
                                    {comment.access === "INTERNAL" ? (
                                        <CustomMenu.MenuItem
                                            onClick={() =>
                                                activityOperations.updateComment(comment.id, { access: "EXTERNAL" })
                                            }
                                            className="flex items-center gap-1"
                                        >
                                            <Globe2 className="h-3 w-3" />
                                            Switch to public comment
                                        </CustomMenu.MenuItem>
                                    ) : (
                                        <CustomMenu.MenuItem
                                            onClick={() =>
                                                activityOperations.updateComment(comment.id, { access: "INTERNAL" })
                                            }
                                            className="flex items-center gap-1"
                                        >
                                            <Lock className="h-3 w-3" />
                                            Switch to private comment
                                        </CustomMenu.MenuItem>
                                    )}
                                </>
                            )}
                            <CustomMenu.MenuItem
                                onClick={() => activityOperations.removeComment(comment.id)}
                                className="flex items-center gap-1"
                            >
                                <Trash2 className="h-3 w-3" />
                                Delete comment
                            </CustomMenu.MenuItem>
                        </CustomMenu>
                    )}
                </>
            }
            ends={ends}
        >
            <>
                <form className={`flex-col gap-2 ${isEditing ? "flex" : "hidden"}`}>
                    <div
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && !isEmpty) {
                                handleSubmit(onEnter)(e)
                            }
                        }}
                    >
                        <LiteTextEditorWithRef
                            cancelUploadImage={fileService.cancelUpload}
                            uploadFile={fileService.getUploadFileFunction(workspaceId)}
                            deleteFile={fileService.getDeleteImageFunction()}
                            restoreFile={fileService.getRestoreImageFunction()}
                            ref={editorRef}
                            value={watch("comment_html") ?? ""}
                            debouncedUpdatesEnabled={false}
                            customClassName="min-h-[50px] p-3 shadow-sm"
                            onChange={(_: Object, comment_html: string) => setValue("comment_html", comment_html)}
                            mentionSuggestions={mentionSuggestions}
                            mentionHighlights={mentionHighlights}
                        />
                    </div>
                    <div className="flex gap-1 self-end">
                        <button
                            type="button"
                            onClick={handleSubmit(onEnter)}
                            disabled={isSubmitting || isEmpty}
                            className={`group rounded border border-green-500 bg-green-500/20 p-2 shadow-md duration-300  ${
                                isEmpty ? "bg-gray-200 cursor-not-allowed" : "hover:bg-green-500"
                            }`}
                        >
                            <Check
                                className={`h-3 w-3 text-green-500 duration-300 ${isEmpty ? "text-black" : "group-hover:text-white"}`}
                            />
                        </button>
                        <button
                            type="button"
                            className="group rounded border border-red-500 bg-red-500/20 p-2 shadow-md duration-300 hover:bg-red-500"
                            onClick={() => setIsEditing(false)}
                        >
                            <X className="h-3 w-3 text-red-500 duration-300 group-hover:text-white" />
                        </button>
                    </div>
                </form>
                <div className={`relative ${isEditing ? "hidden" : ""}`}>
                    {showAccessSpecifier && (
                        <div className="absolute right-2.5 top-2.5 z-[1] text-custom-text-300">
                            {comment.access === "INTERNAL" ? (
                                <Lock className="h-3 w-3" />
                            ) : (
                                <Globe2 className="h-3 w-3" />
                            )}
                        </div>
                    )}
                    <LiteReadOnlyEditorWithRef
                        ref={showEditorRef}
                        value={comment.comment_html ?? ""}
                        customClassName="text-xs border border-custom-border-200 bg-custom-background-100"
                        mentionHighlights={mentionHighlights}
                    />

                    <IssueCommentReaction
                        workspaceSlug={workspaceSlug}
                        projectId={comment?.project_detail?.id}
                        commentId={comment.id}
                        currentUser={currentUser}
                    />
                </div>
            </>
        </IssueCommentBlock>
    )
}
