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

type Props = {
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
    onOpen?: () => void
}

const defaultValues: Partial<TIssue> = {
    name: "",
}

const Inputs = (props: any) => {
    const { register, setFocus, projectDetails } = props

    useEffect(() => {
        setFocus("name")
    }, [setFocus])

    return (
        <>
            <h4 className="text-xs leading-5 text-custom-text-400">{projectDetails?.identifier ?? "..."}</h4>
            <input
                type="text"
                autoComplete="off"
                placeholder="Issue Title"
                {...register("name", {
                    required: "Issue title is required.",
                })}
                className="w-full rounded-md bg-transparent py-1.5 pr-2 text-xs font-medium leading-5 text-custom-text-200 outline-none"
            />
        </>
    )
}

export const CalendarQuickAddIssueForm: React.FC<Props> = observer((props) => {
    const { formKey, prePopulatedData, quickAddCallback, viewId, onOpen } = props

    const pathname = usePathname()
    const { workspaceSlug, projectId } = useParams()
    // store hooks
    const { getProjectById } = useProject()
    const { captureIssueEvent } = useEventTracker()
    // refs
    const ref = useRef<HTMLDivElement>(null)
    // states
    const [isOpen, setIsOpen] = useState(false)

    // derived values
    const projectDetail = projectId ? getProjectById(projectId.toString()) : null

    const {
        reset,
        handleSubmit,
        register,
        setFocus,
        formState: { errors, isSubmitting },
    } = useForm<TIssue>({ defaultValues })

    const handleClose = () => {
        setIsOpen(false)
    }

    useKeypress("Escape", handleClose)
    useOutsideClickDetector(ref, handleClose)

    useEffect(() => {
        if (!isOpen) reset({ ...defaultValues })
    }, [isOpen, reset])

    useEffect(() => {
        if (!errors) return
        Object.keys(errors).forEach((key) => {
            const error = errors[key as keyof TIssue]
            toast.error(error?.message?.toString() || "Please try again later")
        })
    }, [errors])

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
                        payload: { ...res, state: "SUCCESS", element: "Calendar quick add" },
                        path: pathname,
                    })
                }))
        } catch (err: any) {
            captureIssueEvent({
                eventName: ISSUE_CREATED,
                payload: { ...payload, state: "FAILED", element: "Calendar quick add" },
                path: pathname,
            })
            toast.error("Please try again later")
        }
    }

    const handleOpen = () => {
        setIsOpen(true)
        if (onOpen) onOpen()
    }

    return (
        <>
            {isOpen && (
                <div
                    ref={ref}
                    className={`z-20 w-full transition-all ${
                        isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                    }`}
                >
                    <form
                        onSubmit={handleSubmit(onSubmitHandler)}
                        className="z-50 flex w-full items-center gap-x-2 rounded border-[0.5px] border-custom-border-200 bg-custom-background-100 px-2 shadow-custom-shadow-2xs transition-opacity"
                    >
                        <Inputs
                            formKey={formKey}
                            register={register}
                            setFocus={setFocus}
                            projectDetails={projectDetail}
                        />
                    </form>
                </div>
            )}

            {!isOpen && (
                <div className="hidden rounded border-[0.5px] border-custom-border-200 group-hover:block">
                    <button
                        type="button"
                        className="flex w-full items-center gap-x-[6px] rounded-md px-2 py-1.5 text-custom-primary-100"
                        onClick={handleOpen}
                    >
                        <PlusIcon className="h-3.5 w-3.5 stroke-2" />
                        <span className="text-sm font-medium text-custom-primary-100">New Issue</span>
                    </button>
                </div>
            )}
        </>
    )
})
