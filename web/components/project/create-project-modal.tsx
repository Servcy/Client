import { useRouter } from "next/navigation"

import { ChangeEvent, FC, Fragment, useEffect, useState } from "react"

import { Dialog, Transition } from "@headlessui/react"
import { X } from "lucide-react"
import { observer } from "mobx-react-lite"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"

import { ImagePickerPopover } from "@components/core"
import { MemberDropdown } from "@components/dropdowns"
import EmojiIconPicker from "@components/emoji-icon-picker"

import { useEventTracker, useProject, useUser } from "@hooks/store"

import { CURRENCY_CODES } from "@constants/billing"
import { PROJECT_CREATED } from "@constants/event-tracker"
import { ACCESS_CHOICES, ERoles } from "@constants/iam"
import { PROJECT_UNSPLASH_COVERS } from "@constants/project"

import { getRandomEmoji, renderEmoji } from "@helpers/emoji.helper"

import { Button, CustomSelect, Input, TextArea } from "@servcy/ui"

type Props = {
    isOpen: boolean
    onClose: () => void
    setToFavorite?: boolean
    workspaceSlug: string
}

interface IIsGuestCondition {
    onClose: () => void
}

const IsGuestCondition: FC<IIsGuestCondition> = ({ onClose }) => {
    useEffect(() => {
        onClose()
        toast.error("You don't have permission to create project.")
    }, [onClose])

    return null
}

export interface ICreateProjectForm {
    name: string
    identifier: string
    description: string
    emoji_and_icon: string
    access: number
    lead_member: string
    budget: {
        amount: string
        currency: string
    }
    lead: string
    cover_image: string
    icon_prop: any
    emoji: string
}

export const CreateProjectModal: FC<Props> = observer((props) => {
    const router = useRouter()
    const { isOpen, onClose, workspaceSlug } = props
    // store
    const { captureProjectEvent } = useEventTracker()
    const {
        membership: { currentWorkspaceRole },
    } = useUser()
    const { createProject } = useProject()
    // states
    const [isChangeInIdentifierRequired, setIsChangeInIdentifierRequired] = useState(true)
    // form info
    const cover_image = PROJECT_UNSPLASH_COVERS[Math.floor(Math.random() * PROJECT_UNSPLASH_COVERS.length)]
    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
    } = useForm<ICreateProjectForm>({
        defaultValues: {
            cover_image,
            description: "",
            emoji_and_icon: getRandomEmoji(),
            identifier: "",
            name: "",
            access: 0,
            budget: {
                amount: "",
                currency: "USD",
            },
            lead: undefined,
        },
        reValidateMode: "onChange",
    })

    const projectBudget = watch("budget")
    const currentAccess = ACCESS_CHOICES.find((n) => n.key === watch("access"))
    const currentCurrency = CURRENCY_CODES.find((n) => n.code === projectBudget?.currency)
    if (isOpen && currentWorkspaceRole !== undefined && currentWorkspaceRole < ERoles.MEMBER)
        return <IsGuestCondition onClose={onClose} />

    const handleClose = () => {
        onClose()
        setIsChangeInIdentifierRequired(true)
        reset()
    }

    const onSubmit = async (formData: ICreateProjectForm) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { emoji_and_icon, lead_member, ...payload } = formData

        if (typeof formData.emoji_and_icon === "object") payload.icon_prop = formData.emoji_and_icon
        else payload.emoji = formData.emoji_and_icon

        payload.lead = formData.lead_member
        // Upper case identifier
        payload.identifier = payload.identifier.toUpperCase()

        return createProject(workspaceSlug.toString(), payload)
            .then((res) => {
                const newPayload = {
                    ...res,
                    state: "SUCCESS",
                }
                captureProjectEvent({
                    eventName: PROJECT_CREATED,
                    payload: newPayload,
                })
                router.push(`/${workspaceSlug}/projects/${res.id}/settings/members?openAddMember=true`)
                handleClose()
            })
            .catch(() => {
                toast.error("Please try again later")
            })
    }

    const handleNameChange = (onChange: any) => (e: ChangeEvent<HTMLInputElement>) => {
        if (!isChangeInIdentifierRequired) {
            onChange(e)
            return
        }
        if (e.target.value === "") setValue("identifier", "")
        else setValue("identifier", e.target.value.replace(/[^ÇŞĞIİÖÜA-Za-z0-9]/g, "").substring(0, 5))
        onChange(e)
    }

    const handleIdentifierChange = (onChange: any) => (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        const alphanumericValue = value.replace(/[^ÇŞĞIİÖÜA-Za-z0-9]/g, "")
        setIsChangeInIdentifierRequired(false)
        onChange(alphanumericValue)
    }

    const handleBudgetChange = (onChange: any, isAmount: boolean) => (e: ChangeEvent<HTMLInputElement>) => {
        if (isAmount && Number.isNaN(Number(e.target.value))) return
        if (isAmount) onChange(e.target.value)
        else onChange(e)
    }

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-20" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-custom-backdrop transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-20 overflow-y-auto">
                    <div className="my-10 flex items-center justify-center p-4 text-center sm:p-0 md:my-20">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="w-full transform rounded-lg bg-custom-background-100 p-3 text-left shadow-custom-shadow-md transition-all sm:w-3/5 lg:w-1/2 xl:w-2/5">
                                <div className="group relative h-44 w-full rounded-lg bg-custom-background-80">
                                    {watch("cover_image") !== null && (
                                        <img
                                            src={watch("cover_image")!}
                                            className="absolute left-0 top-0 h-full w-full rounded-lg object-cover"
                                            alt="Cover Image"
                                        />
                                    )}

                                    <div className="absolute right-2 top-2 p-2">
                                        <button
                                            data-posthog="PROJECT_MODAL_CLOSE"
                                            type="button"
                                            onClick={handleClose}
                                            tabIndex={8}
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-2 right-2">
                                        <ImagePickerPopover
                                            label="Change Cover"
                                            onChange={(image) => {
                                                setValue("cover_image", image)
                                            }}
                                            control={control}
                                            value={watch("cover_image")}
                                            tabIndex={9}
                                        />
                                    </div>
                                    <div className="absolute -bottom-[22px] left-3">
                                        <Controller
                                            name="emoji_and_icon"
                                            control={control}
                                            render={({ field: { value, onChange } }) => (
                                                <EmojiIconPicker
                                                    label={
                                                        <div className="grid h-[44px] w-[44px] place-items-center rounded-md bg-custom-background-80 text-lg outline-none">
                                                            {value ? renderEmoji(value) : "Icon"}
                                                        </div>
                                                    }
                                                    onChange={onChange}
                                                    value={value}
                                                    tabIndex={10}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="divide-y-[0.5px] divide-custom-border-100 px-3"
                                >
                                    <div className="mt-9 space-y-6 pb-5">
                                        <div className="grid grid-cols-1 gap-x-2 gap-y-3 md:grid-cols-4">
                                            <div className="md:col-span-3">
                                                <Controller
                                                    control={control}
                                                    name="name"
                                                    rules={{
                                                        required: "Title is required",
                                                        maxLength: {
                                                            value: 255,
                                                            message: "Title should be less than 255 characters",
                                                        },
                                                    }}
                                                    render={({ field: { value, onChange } }) => (
                                                        <Input
                                                            id="name"
                                                            name="name"
                                                            type="text"
                                                            value={value}
                                                            onChange={handleNameChange(onChange)}
                                                            hasError={Boolean(errors.name)}
                                                            placeholder="Project Title"
                                                            className="w-full focus:border-green-300"
                                                            tabIndex={1}
                                                        />
                                                    )}
                                                />
                                                <span className="text-xs text-red-500">{errors?.name?.message}</span>
                                            </div>
                                            <div>
                                                <Controller
                                                    control={control}
                                                    name="identifier"
                                                    rules={{
                                                        required: "Identifier is required",
                                                        // allow only alphanumeric & non-latin characters
                                                        validate: (value) =>
                                                            /^[ÇŞĞIİÖÜA-Z0-9]+$/.test(value.toUpperCase()) ||
                                                            "Only Alphanumeric & Non-latin characters are allowed.",
                                                        minLength: {
                                                            value: 1,
                                                            message: "Identifier must at least be of 1 character",
                                                        },
                                                        maxLength: {
                                                            value: 12,
                                                            message: "Identifier must at most be of 12 characters",
                                                        },
                                                    }}
                                                    render={({ field: { value, onChange } }) => (
                                                        <Input
                                                            id="identifier"
                                                            name="identifier"
                                                            type="text"
                                                            value={value}
                                                            onChange={handleIdentifierChange(onChange)}
                                                            hasError={Boolean(errors.identifier)}
                                                            placeholder="Identifier"
                                                            className="w-full text-xs focus:border-green-300 uppercase"
                                                            tabIndex={2}
                                                        />
                                                    )}
                                                />
                                                <span className="text-xs text-red-500">
                                                    {errors?.identifier?.message}
                                                </span>
                                            </div>
                                            <div className="md:col-span-4">
                                                <Controller
                                                    name="description"
                                                    control={control}
                                                    render={({ field: { value, onChange } }) => (
                                                        <TextArea
                                                            id="description"
                                                            name="description"
                                                            value={value}
                                                            placeholder="Description..."
                                                            onChange={onChange}
                                                            className="!h-24 text-sm focus:border-green-300"
                                                            hasError={Boolean(errors?.description)}
                                                            tabIndex={3}
                                                        />
                                                    )}
                                                />
                                            </div>
                                            {currentWorkspaceRole === ERoles.ADMIN && (
                                                <div className="md:col-span-4 relative">
                                                    <Controller
                                                        control={control}
                                                        name="budget.amount"
                                                        render={({ field: { value, onChange } }) => (
                                                            <Input
                                                                id="budget-amount"
                                                                name="budget.amount"
                                                                type="text"
                                                                value={value}
                                                                onChange={handleBudgetChange(onChange, true)}
                                                                hasError={Boolean(errors.budget)}
                                                                placeholder="Project budget..."
                                                                className="w-full focus:border-green-300"
                                                                tabIndex={8}
                                                            />
                                                        )}
                                                    />
                                                    <span className="text-xs text-red-500">
                                                        {errors?.budget?.message}
                                                    </span>
                                                    <div className="absolute right-[10px] top-[5px]">
                                                        <Controller
                                                            name="budget.currency"
                                                            control={control}
                                                            render={({ field: { onChange, value } }) => (
                                                                <div tabIndex={9} className="flex-shrink-0">
                                                                    <CustomSelect
                                                                        value={value}
                                                                        onChange={handleBudgetChange(onChange, false)}
                                                                        label={
                                                                            <div className="flex items-center gap-1">
                                                                                {currentCurrency ? (
                                                                                    <>
                                                                                        <currentCurrency.icon className="h-3 w-3" />
                                                                                        {currentCurrency.code}
                                                                                    </>
                                                                                ) : (
                                                                                    <span className="text-custom-text-400">
                                                                                        Select Currency
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        }
                                                                        placement="bottom-start"
                                                                        noChevron
                                                                        tabIndex={9}
                                                                    >
                                                                        {CURRENCY_CODES.map((currency) => (
                                                                            <CustomSelect.Option
                                                                                key={currency.code}
                                                                                value={currency.code}
                                                                            >
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
                                                        <span className="text-xs text-red-500">
                                                            {errors?.budget?.message}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Controller
                                                name="access"
                                                control={control}
                                                render={({ field: { onChange, value } }) => (
                                                    <div className="flex-shrink-0" tabIndex={4}>
                                                        <CustomSelect
                                                            value={value}
                                                            onChange={onChange}
                                                            label={
                                                                <div className="flex items-center gap-1">
                                                                    {currentAccess ? (
                                                                        <>
                                                                            <currentAccess.icon className="h-3 w-3" />
                                                                            {currentAccess.label}
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-custom-text-400">
                                                                            Select Access
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            }
                                                            placement="bottom-start"
                                                            noChevron
                                                            tabIndex={4}
                                                        >
                                                            {ACCESS_CHOICES.map((access) => (
                                                                <CustomSelect.Option
                                                                    key={access.key}
                                                                    value={access.key}
                                                                >
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
                                                    </div>
                                                )}
                                            />
                                            <Controller
                                                name="lead_member"
                                                control={control}
                                                render={({ field: { value, onChange } }) => (
                                                    <div className="h-7 flex-shrink-0" tabIndex={5}>
                                                        <MemberDropdown
                                                            value={value}
                                                            placeholder="Lead"
                                                            multiple={false}
                                                            onChange={(lead) => onChange(lead === value ? null : lead)}
                                                            buttonVariant="border-with-text"
                                                            tabIndex={5}
                                                        />
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-5">
                                        <Button variant="neutral-primary" size="sm" onClick={handleClose} tabIndex={6}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            size="sm"
                                            loading={isSubmitting}
                                            tabIndex={7}
                                        >
                                            {isSubmitting ? "Creating..." : "Create Project"}
                                        </Button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
})
