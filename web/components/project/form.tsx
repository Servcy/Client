import { ChangeEvent, FC, useEffect, useState } from "react"

import { Lock } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"

import { ImagePickerPopover } from "@components/core"
import EmojiIconPicker from "@components/emoji-icon-picker"

import { useEventTracker, useProject, useUser } from "@hooks/store"

import { CURRENCY_CODES } from "@constants/billing"
import { PROJECT_UPDATED } from "@constants/event-tracker"
import { ACCESS_CHOICES, EAccess, ERoles } from "@constants/iam"

import { ProjectService } from "@services/project"

import { renderFormattedDate } from "@helpers/date-time.helper"
import { renderEmoji } from "@helpers/emoji.helper"

import { IProject, IWorkspace } from "@servcy/types"
import { Button, CustomSelect, Input, TextArea } from "@servcy/ui"

export interface IProjectDetailsForm {
    project: IProject
    workspaceSlug: string
    projectId: string
    isAdmin: boolean
}
const projectService = new ProjectService()
export const ProjectDetailsForm: FC<IProjectDetailsForm> = (props) => {
    const { project, workspaceSlug, projectId, isAdmin } = props
    // states
    const [isLoading, setIsLoading] = useState(false)
    const {
        membership: { currentWorkspaceRole },
    } = useUser()
    // store hooks
    const { captureProjectEvent } = useEventTracker()
    const { updateProject } = useProject()

    // form info
    const {
        handleSubmit,
        watch,
        control,
        setValue,
        setError,
        reset,
        formState: { errors, dirtyFields },
        getValues,
    } = useForm<IProject>({
        defaultValues: {
            ...project,
            budget: project.budget ?? {
                currency: "USD",
                amount: "",
            },
            emoji_and_icon: project.emoji ?? project.icon_prop,
            workspace: (project.workspace as IWorkspace).id,
        },
    })
    const projectBudget = watch("budget")
    const currentCurrency = CURRENCY_CODES.find((n) => n.code === projectBudget?.currency)
    useEffect(() => {
        if (project && projectId !== getValues("id")) {
            reset({
                ...project,
                emoji_and_icon: project.emoji ?? project.icon_prop,
                workspace: (project.workspace as IWorkspace).id,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project, projectId])
    const handleIdentifierChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target
        const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, "")
        const formattedValue = alphanumericValue.toUpperCase()
        setValue("identifier", formattedValue)
    }
    const handleUpdateChange = async (payload: Partial<IProject>) => {
        if (!workspaceSlug || !project) return
        return updateProject(workspaceSlug.toString(), project.id, payload)
            .then((res) => {
                const changed_properties = Object.keys(dirtyFields)

                captureProjectEvent({
                    eventName: PROJECT_UPDATED,
                    payload: {
                        ...res,
                        changed_properties: changed_properties,
                        state: "SUCCESS",
                        element: "Project general settings",
                    },
                })
            })
            .catch(() => {
                captureProjectEvent({
                    eventName: PROJECT_UPDATED,
                    payload: { ...payload, state: "FAILED", element: "Project general settings" },
                })
                toast.error("Please try again later")
            })
    }
    const handleBudgetChange = (onChange: any, isAmount: boolean) => (e: ChangeEvent<HTMLInputElement>) => {
        if (isAmount && Number.isNaN(Number(e.target.value))) return
        if (isAmount) onChange(e.target.value)
        else onChange(e)
    }
    const onSubmit = async (formData: IProject) => {
        if (!workspaceSlug) return
        setIsLoading(true)
        const payload: Partial<IProject> = {
            name: formData.name,
            access: formData.access,
            identifier: formData.identifier,
            description: formData.description,
            cover_image: formData.cover_image,
        }
        if (currentWorkspaceRole === ERoles.ADMIN) payload.budget = formData.budget
        if (typeof formData.emoji_and_icon === "object") {
            payload.emoji = null
            payload.icon_prop = formData.emoji_and_icon
        } else {
            payload.emoji = formData.emoji_and_icon
            payload.icon_prop = null
        }
        if (project.identifier !== formData.identifier)
            await projectService
                .checkProjectIdentifierAvailability(workspaceSlug as string, payload.identifier ?? "")
                .then(async (res) => {
                    if (res.exists) setError("identifier", { message: "Identifier already exists" })
                    else await handleUpdateChange(payload)
                })
        else await handleUpdateChange(payload)
        setTimeout(() => {
            setIsLoading(false)
        }, 300)
    }
    const currentAccess = ACCESS_CHOICES.find((n) => n.key === project?.access)

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="relative mt-6 h-44 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <img
                    src={watch("cover_image")!}
                    alt={watch("cover_image")!}
                    className="h-44 w-full rounded-md object-cover"
                />
                <div className="z-5 absolute bottom-4 flex w-full items-end justify-between gap-3 px-4">
                    <div className="flex flex-grow gap-3 truncate">
                        <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-lg bg-custom-background-90">
                            <div className="grid h-7 w-7 place-items-center">
                                <Controller
                                    control={control}
                                    name="emoji_and_icon"
                                    render={({ field: { value, onChange } }) => (
                                        <EmojiIconPicker
                                            label={value ? renderEmoji(value) : "Icon"}
                                            value={value}
                                            onChange={onChange}
                                            disabled={!isAdmin}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 truncate text-white">
                            <span className="truncate text-lg font-semibold">{watch("name")}</span>
                            <span className="flex items-center gap-2 text-sm">
                                <span>{watch("identifier")} .</span>
                                <span className="flex items-center gap-1.5">
                                    {project.access === EAccess.PRIVATE && <Lock className="h-2.5 w-2.5 text-white " />}
                                    {currentAccess?.label}
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-center">
                        <div>
                            <Controller
                                control={control}
                                name="cover_image"
                                render={({ field: { value, onChange } }) => (
                                    <ImagePickerPopover
                                        label={"Change cover"}
                                        control={control}
                                        onChange={(url) => {
                                            onChange(url)
                                            handleSubmit(onSubmit)()
                                        }}
                                        value={value}
                                        disabled={!isAdmin}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="my-8 flex flex-col gap-8">
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm">Project Name</h4>
                    <Controller
                        control={control}
                        name="name"
                        rules={{
                            required: "Name is required",
                        }}
                        render={({ field: { value, onChange, ref } }) => (
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                ref={ref}
                                value={value}
                                onChange={onChange}
                                hasError={Boolean(errors.name)}
                                className="rounded-md !p-3 font-medium"
                                placeholder="Project Name"
                                disabled={!isAdmin}
                            />
                        )}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm">Description</h4>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <TextArea
                                id="description"
                                name="description"
                                value={value}
                                placeholder="Enter project description"
                                onChange={onChange}
                                className="min-h-[102px] text-sm font-medium"
                                hasError={Boolean(errors?.description)}
                                disabled={!isAdmin}
                            />
                        )}
                    />
                </div>
                <div className="flex w-full items-center justify-between gap-10">
                    <div className="flex w-1/2 flex-col gap-1">
                        <h4 className="text-sm">Identifier</h4>
                        <Controller
                            control={control}
                            name="identifier"
                            rules={{
                                required: "Identifier is required",
                                validate: (value) =>
                                    /^[A-Z0-9]+$/.test(value.toUpperCase()) || "Identifier must be in uppercase.",
                                minLength: {
                                    value: 1,
                                    message: "Identifier must at least be of 1 character",
                                },
                                maxLength: {
                                    value: 12,
                                    message: "Identifier must at most be of 5 characters",
                                },
                            }}
                            render={({ field: { value, ref } }) => (
                                <Input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    value={value}
                                    onChange={handleIdentifierChange}
                                    ref={ref}
                                    hasError={Boolean(errors.identifier)}
                                    placeholder="Enter identifier"
                                    className="w-full font-medium"
                                    disabled={!isAdmin}
                                />
                            )}
                        />
                    </div>
                    <div className="flex w-1/2 flex-col gap-1">
                        <h4 className="text-sm">Access</h4>
                        <Controller
                            name="access"
                            control={control}
                            render={({ field: { value, onChange } }) => {
                                const selectedAccess = ACCESS_CHOICES.find((n) => n.key === value)

                                return (
                                    <CustomSelect
                                        value={value}
                                        onChange={onChange}
                                        label={
                                            <div className="flex items-center gap-1">
                                                {selectedAccess ? (
                                                    <>
                                                        <selectedAccess.icon className="h-3.5 w-3.5" />
                                                        {selectedAccess.label}
                                                    </>
                                                ) : (
                                                    <span className="text-custom-text-400">Select access</span>
                                                )}
                                            </div>
                                        }
                                        buttonClassName="!border-custom-border-200 !shadow-none font-medium rounded-md"
                                        input
                                        disabled={!isAdmin}
                                        // optionsClassName="w-full"
                                    >
                                        {ACCESS_CHOICES.map((access) => (
                                            <CustomSelect.Option key={access.key} value={access.key}>
                                                <div className="flex items-start gap-2">
                                                    <access.icon className="h-3.5 w-3.5" />
                                                    <div className="-mt-1">
                                                        <p>{access.label}</p>
                                                        <p className="text-xs text-custom-text-400">
                                                            {access.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CustomSelect.Option>
                                        ))}
                                    </CustomSelect>
                                )
                            }}
                        />
                    </div>
                </div>
                {currentWorkspaceRole === ERoles.ADMIN && (
                    <div className="flex relative flex-col gap-1">
                        <h4 className="text-sm">Project Budget</h4>
                        <Controller
                            control={control}
                            name="budget.amount"
                            render={({ field: { value, onChange, ref } }) => (
                                <Input
                                    id="budget-amount"
                                    name="budget.amount"
                                    type="text"
                                    ref={ref}
                                    value={value}
                                    onChange={handleBudgetChange(onChange, true)}
                                    hasError={Boolean(errors.budget)}
                                    className="rounded-md !p-3 font-medium"
                                    placeholder="Project budget..."
                                    disabled={!isAdmin}
                                />
                            )}
                        />
                        <div className="absolute top-[26px] right-[6px]">
                            <Controller
                                name="budget.currency"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <div className="flex-shrink-0">
                                        <CustomSelect
                                            value={value ?? "USD"}
                                            onChange={handleBudgetChange(onChange, false)}
                                            label={
                                                <div className="flex items-center gap-1">
                                                    {currentCurrency ? (
                                                        <>
                                                            <currentCurrency.icon className="h-3 w-3" />
                                                            {currentCurrency.code}
                                                        </>
                                                    ) : (
                                                        <span className="text-custom-text-400">Select Currency</span>
                                                    )}
                                                </div>
                                            }
                                            placement="bottom-start"
                                            noChevron
                                            buttonClassName="!border-custom-border-200 !shadow-none font-medium rounded-md"
                                            input
                                            disabled={!isAdmin}
                                        >
                                            {CURRENCY_CODES.map((currency) => (
                                                <CustomSelect.Option key={currency.code} value={currency.code}>
                                                    <div className="flex items-center gap-2">
                                                        <currency.icon className="h-3.5 w-3.5" />
                                                        <div>{currency.code}</div>
                                                    </div>
                                                </CustomSelect.Option>
                                            ))}
                                        </CustomSelect>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between py-2">
                    <>
                        <Button variant="primary" type="submit" loading={isLoading} disabled={!isAdmin}>
                            {isLoading ? "Updating..." : "Update project"}
                        </Button>
                        <span className="text-sm italic text-custom-sidebar-text-400">
                            Created on {renderFormattedDate(project?.created_at)}
                        </span>
                    </>
                </div>
            </div>
        </form>
    )
}
