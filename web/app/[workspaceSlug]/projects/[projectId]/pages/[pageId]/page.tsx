"use client"

import { useParams } from "next/navigation"

import { useEffect, useRef, useState } from "react"

import { Sparkle } from "lucide-react"
import { observer } from "mobx-react-lite"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import useSWR from "swr"

import { GptAssistantPopover, PageHead } from "@components/core"
import { PageDetailsHeader } from "@components/headers/page-details"
import { IssuePeekOverview } from "@components/issues"

import { usePage, useUser, useWorkspace } from "@hooks/store"
import { useProjectPages } from "@hooks/store/use-project-specific-pages"
import useReloadConfirmations from "@hooks/use-reload-confirmation"

import { ERoles } from "@constants/iam"

import { FileService } from "@services/document.service"

import { AppWrapper } from "@wrappers/app"

import { DocumentEditorWithRef, DocumentReadOnlyEditorWithRef } from "@servcy/document-editor"
import type { IPage } from "@servcy/types"
import { Spinner } from "@servcy/ui"

const fileService = new FileService()

const PageDetailsPage = observer(() => {
    // states
    const [gptModalOpen, setGptModal] = useState(false)
    // refs
    const editorRef = useRef<any>(null)
    const { workspaceSlug, projectId, pageId } = useParams()
    const workspaceStore = useWorkspace()
    const workspaceId = workspaceStore.getWorkspaceBySlug(workspaceSlug as string)?.id

    const {
        currentUser,
        membership: { currentProjectRole },
    } = useUser()

    const { handleSubmit, setValue, watch, getValues, control, reset } = useForm<IPage>({
        defaultValues: { name: "", description_html: "" },
    })

    const {
        archivePage: archivePageAction,
        restorePage: restorePageAction,
        createPage: createPageAction,
        projectPageMap,
        projectArchivedPageMap,
        fetchProjectPages,
        fetchArchivedProjectPages,
    } = useProjectPages()

    useSWR(
        workspaceSlug && projectId ? `ALL_PAGES_LIST_${projectId}` : null,
        workspaceSlug &&
            projectId &&
            !projectPageMap[projectId as string] &&
            !projectArchivedPageMap[projectId as string]
            ? () => fetchProjectPages(workspaceSlug.toString(), projectId.toString())
            : null
    )
    // fetching archived pages from API
    useSWR(
        workspaceSlug && projectId ? `ALL_ARCHIVED_PAGES_LIST_${projectId}` : null,
        workspaceSlug &&
            projectId &&
            !projectArchivedPageMap[projectId as string] &&
            !projectPageMap[projectId as string]
            ? () => fetchArchivedProjectPages(workspaceSlug.toString(), projectId.toString())
            : null
    )

    const pageStore = usePage(pageId as string)

    const { setShowAlert } = useReloadConfirmations(pageStore?.isSubmitting === "submitting")

    useEffect(
        () => () => {
            if (pageStore) {
                pageStore.cleanup()
            }
        },
        [pageStore]
    )

    if (!pageStore) {
        return (
            <div className="grid h-screen w-full place-items-center">
                <Spinner />
            </div>
        )
    }

    // We need to get the values of title and description from the page store but we don't have to subscribe to those values
    const pageTitle = pageStore?.name
    const pageDescription = pageStore?.description_html
    const {
        lockPage: lockPageAction,
        unlockPage: unlockPageAction,
        updateName: updateNameAction,
        updateDescription: updateDescriptionAction,
        id: pageIdMobx,
        isSubmitting,
        setIsSubmitting,
        owned_by,
        is_locked,
        archived_at,
        created_at,
        created_by,
        updated_at,
        updated_by,
    } = pageStore

    const updatePage = async (formData: IPage) => {
        if (!workspaceSlug || !projectId || !pageId) return
        await updateDescriptionAction(formData.description_html)
    }

    const handleAiAssistance = async (response: string) => {
        if (!workspaceSlug || !projectId || !pageId) return

        const newDescription = `${watch("description_html")}<p>${response}</p>`
        setValue("description_html", newDescription)
        editorRef.current?.setEditorValue(newDescription)
        updateDescriptionAction(newDescription)
    }

    const actionCompleteAlert = ({
        message,
        type,
    }: {
        title: string
        message: string
        type: "success" | "error" | "warning" | "info"
    }) => {
        if (["success", "info"].includes(type)) toast.success(message)
        else toast.error(message)
    }

    const updatePageTitle = (title: string) => {
        if (!workspaceSlug || !projectId || !pageId) return
        updateNameAction(title)
    }

    const createPage = async (payload: Partial<IPage>) => {
        if (!workspaceSlug || !projectId) return
        await createPageAction(workspaceSlug as string, projectId as string, payload)
    }

    // ================ Page Menu Actions ==================
    const duplicate_page = async () => {
        const currentPageValues = getValues()

        if (!currentPageValues?.description_html) {
            // TODO: We need to get latest data the above variable will give us stale data
            currentPageValues.description_html = pageDescription as string
        }

        const formData: Partial<IPage> = {
            name: "Copy of " + pageTitle,
            description_html: currentPageValues.description_html,
        }

        try {
            await createPage(formData)
        } catch (error) {
            actionCompleteAlert({
                title: `Page could not be duplicated`,
                message: "Please try again later",
                type: "error",
            })
        }
    }

    const archivePage = async () => {
        if (!workspaceSlug || !projectId || !pageId) return
        try {
            await archivePageAction(workspaceSlug as string, projectId as string, pageId as string)
        } catch (error) {
            actionCompleteAlert({
                title: `Page could not be archived`,
                message: "Please try again later",
                type: "error",
            })
        }
    }

    const unArchivePage = async () => {
        if (!workspaceSlug || !projectId || !pageId) return
        try {
            await restorePageAction(workspaceSlug as string, projectId as string, pageId as string)
        } catch (error) {
            actionCompleteAlert({
                title: `Page could not be restored`,
                message: "Please try again later",
                type: "error",
            })
        }
    }

    const lockPage = async () => {
        if (!workspaceSlug || !projectId || !pageId) return
        try {
            await lockPageAction()
        } catch (error) {
            actionCompleteAlert({
                title: `Page could not be locked`,
                message: "Please try again later",
                type: "error",
            })
        }
    }

    const unlockPage = async () => {
        if (!workspaceSlug || !projectId || !pageId) return
        try {
            await unlockPageAction()
        } catch (error) {
            actionCompleteAlert({
                title: `Page could not be unlocked`,
                message: "Please try again later",
                type: "error",
            })
        }
    }

    const isPageReadOnly =
        is_locked || archived_at || (currentProjectRole !== undefined && currentProjectRole <= ERoles.MEMBER)

    const isCurrentUserOwner = owned_by === currentUser?.id

    const userCanDuplicate =
        currentProjectRole && currentProjectRole !== undefined && currentProjectRole >= ERoles.MEMBER
    const userCanArchive =
        isCurrentUserOwner || (currentProjectRole !== undefined && currentProjectRole >= ERoles.ADMIN)
    const userCanLock = (currentProjectRole ?? 0) > ERoles.GUEST

    return pageIdMobx ? (
        <AppWrapper header={<PageDetailsHeader />} withProjectWrapper>
            <PageHead title={pageTitle} />
            <div className="flex h-full flex-col justify-between">
                <div className="h-full w-full overflow-hidden">
                    {isPageReadOnly ? (
                        <DocumentReadOnlyEditorWithRef
                            onActionCompleteHandler={actionCompleteAlert}
                            ref={editorRef}
                            value={pageDescription}
                            customClassName={"tracking-tight w-full px-0"}
                            borderOnFocus={false}
                            noBorder
                            documentDetails={{
                                title: pageTitle,
                                created_by: created_by,
                                created_at: created_at,
                                updated_at: updated_at,
                                updated_by: updated_by,
                            }}
                            pageLockConfig={
                                userCanLock && !archived_at ? { action: unlockPage, is_locked: is_locked } : undefined
                            }
                            pageDuplicationConfig={
                                userCanDuplicate && !archived_at ? { action: duplicate_page } : undefined
                            }
                            pageArchiveConfig={
                                userCanArchive
                                    ? {
                                          action: archived_at ? unArchivePage : archivePage,
                                          is_archived: archived_at ? true : false,
                                          archived_at: archived_at ? new Date(archived_at) : undefined,
                                      }
                                    : undefined
                            }
                        />
                    ) : (
                        <div className="relative h-full w-full overflow-hidden">
                            <Controller
                                name="description_html"
                                control={control}
                                render={({ field: { onChange } }) => (
                                    <DocumentEditorWithRef
                                        isSubmitting={isSubmitting}
                                        documentDetails={{
                                            title: pageTitle,
                                            created_by: created_by,
                                            created_at: created_at,
                                            updated_at: updated_at,
                                            updated_by: updated_by,
                                        }}
                                        uploadFile={fileService.getUploadFileFunction(workspaceId)}
                                        deleteFile={fileService.getDeleteImageFunction()}
                                        restoreFile={fileService.getRestoreImageFunction()}
                                        value={pageDescription}
                                        setShouldShowAlert={setShowAlert}
                                        cancelUploadImage={fileService.cancelUpload}
                                        ref={editorRef}
                                        debouncedUpdatesEnabled={false}
                                        setIsSubmitting={setIsSubmitting}
                                        updatePageTitle={updatePageTitle}
                                        onActionCompleteHandler={actionCompleteAlert}
                                        customClassName="tracking-tight self-center h-full w-full right-[0.675rem]"
                                        onChange={(_description_json: Object, description_html: string) => {
                                            setShowAlert(true)
                                            onChange(description_html)
                                            handleSubmit(updatePage)()
                                        }}
                                        duplicationConfig={userCanDuplicate ? { action: duplicate_page } : undefined}
                                        pageArchiveConfig={
                                            userCanArchive
                                                ? {
                                                      is_archived: archived_at ? true : false,
                                                      action: archived_at ? unArchivePage : archivePage,
                                                  }
                                                : undefined
                                        }
                                        pageLockConfig={
                                            userCanLock ? { is_locked: false, action: lockPage } : undefined
                                        }
                                    />
                                )}
                            />
                            <div className="absolute right-[68px] top-2.5">
                                <GptAssistantPopover
                                    isOpen={gptModalOpen}
                                    projectId={projectId?.toString() as string}
                                    handleClose={() => {
                                        setGptModal((prevData) => !prevData)
                                        // this is done so that the title do not reset after gpt popover closed
                                        reset(getValues())
                                    }}
                                    onResponse={(response) => {
                                        handleAiAssistance(response)
                                    }}
                                    placement="top-end"
                                    button={
                                        <button
                                            type="button"
                                            className="flex items-center gap-1 rounded px-1.5 py-1 text-xs hover:bg-custom-background-90"
                                            onClick={() => setGptModal((prevData) => !prevData)}
                                        >
                                            <Sparkle className="h-4 w-4" />
                                            AI
                                        </button>
                                    }
                                    className="!min-w-[38rem]"
                                />
                            </div>
                        </div>
                    )}
                    <IssuePeekOverview />
                </div>
            </div>
        </AppWrapper>
    ) : (
        <AppWrapper header={<PageDetailsHeader />} withProjectWrapper>
            <div className="grid h-full w-full place-items-center">
                <Spinner />
            </div>
        </AppWrapper>
    )
})

export default PageDetailsPage
