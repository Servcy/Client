import { useParams, usePathname } from "next/navigation"

import { useEffect, useRef, useState } from "react"

import { PlusIcon } from "lucide-react"
import { observer } from "mobx-react-lite"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"

import { useEventTracker, useProject } from "@hooks/store"
import useKeypress from "@hooks/use-key-press"
import useOutsideClickDetector from "@hooks/use-outside-click-detector"

import { ISSUE_CREATED } from "@constants/event-tracker"

import { createIssuePayload } from "@helpers/issue.helper"

import { TIssue } from "@servcy/types"

const Inputs = (props: any) => {
    const { register, setFocus, projectDetail } = props

    useEffect(() => {
        setFocus("name")
    }, [setFocus])

    return (
        <div className="w-full">
            <h4 className="text-xs font-medium leading-5 text-custom-text-300">{projectDetail?.identifier ?? "..."}</h4>
            <input
                autoComplete="off"
                placeholder="Issue Title"
                {...register("name", {
                    required: "Issue title is required.",
                })}
                className="w-full rounded-md bg-transparent px-2 py-1.5 pl-0 text-sm font-medium leading-5 text-custom-text-200 outline-none"
            />
        </div>
    )
}

interface IKanBanQuickAddIssueForm {
    formKey: keyof TIssue
    groupId?: string
    subGroupId?: string | null
    prePopulatedData?: Partial<TIssue>
    quickAddCallback?: (
        workspaceSlug: string,
        projectId: string,
        data: TIssue,
        viewId?: string
    ) => Promise<TIssue | undefined>
    viewId?: string
}

const defaultValues: Partial<TIssue> = {
    name: "",
}

export const KanBanQuickAddIssueForm: React.FC<IKanBanQuickAddIssueForm> = observer((props) => {
    const { formKey, prePopulatedData, quickAddCallback, viewId } = props

    const pathname = usePathname()
    const { workspaceSlug, projectId } = useParams()
    // store hooks
    const { getProjectById } = useProject()
    const { captureIssueEvent } = useEventTracker()

    const projectDetail = projectId ? getProjectById(projectId.toString()) : null

    const ref = useRef<HTMLFormElement>(null)

    const [isOpen, setIsOpen] = useState(false)
    const handleClose = () => setIsOpen(false)

    useKeypress("Escape", handleClose)
    useOutsideClickDetector(ref, handleClose)

    const {
        reset,
        handleSubmit,
        setFocus,
        register,
        formState: { isSubmitting },
    } = useForm<TIssue>({ defaultValues })

    useEffect(() => {
        if (!isOpen) reset({ ...defaultValues })
    }, [isOpen, reset])

    const onSubmitHandler = async (formData: TIssue) => {
        if (isSubmitting || !workspaceSlug || !projectId) return

        reset({ ...defaultValues })

        const payload = createIssuePayload(projectId.toString(), {
            ...(prePopulatedData ?? {}),
            ...formData,
        })

        try {
            quickAddCallback &&
                (await quickAddCallback(
                    workspaceSlug.toString(),
                    projectId.toString(),
                    {
                        ...payload,
                    },
                    viewId
                ).then((res) => {
                    captureIssueEvent({
                        eventName: ISSUE_CREATED,
                        payload: { ...res, state: "SUCCESS", element: "Kanban quick add" },
                        path: pathname,
                    })
                }))
        } catch (err: any) {
            captureIssueEvent({
                eventName: ISSUE_CREATED,
                payload: { ...payload, state: "FAILED", element: "Kanban quick add" },
                path: pathname,
            })
            toast.error("Please try again later")
        }
    }

    return (
        <>
            {isOpen ? (
                <div className="shadow-custom-shadow-sm m-1.5 rounded overflow-hidden">
                    <form
                        ref={ref}
                        onSubmit={handleSubmit(onSubmitHandler)}
                        className="flex w-full items-center gap-x-3 bg-custom-background-100 p-3"
                    >
                        <Inputs
                            formKey={formKey}
                            register={register}
                            setFocus={setFocus}
                            projectDetail={projectDetail}
                        />
                    </form>
                    <div className="px-3 py-2 text-xs italic text-custom-text-200">{`Press 'Enter' to add another issue`}</div>
                </div>
            ) : (
                <div
                    className="flex w-full cursor-pointer items-center gap-2 p-3 py-3 text-custom-primary-100"
                    onClick={() => setIsOpen(true)}
                >
                    <PlusIcon className="h-3.5 w-3.5 stroke-2" />
                    <span className="text-sm font-medium text-custom-primary-100">New Issue</span>
                </div>
            )}
        </>
    )
})
